import type { AnyActionFunction, AnyBulkActionFunction, AnyConnection, FunctionResult, TransactionRun } from "@gadgetinc/core";
import type { RequestPolicy } from "@urql/core";
import { Client, cacheExchange, fetchExchange, subscriptionExchange } from "@urql/core";
import type { ExecutionResult } from "graphql";
import type { Sink, Client as SubscriptionClient, ClientOptions as SubscriptionClientOptions } from "graphql-ws";
import { CloseCode, createClient as createSubscriptionClient } from "graphql-ws";
import WebSocket from "isomorphic-ws";
import { BackgroundActionHandle } from "./BackgroundActionHandle.js";
import {
  AuthenticationMode,
  AuthenticationModeOptions,
  BrowserSessionAuthenticationModeOptions,
  BrowserSessionStorageType,
  Exchanges,
  GadgetConnectionOptions,
  GadgetSubscriptionClientOptions,
} from "./ClientOptions.js";
import { ErrorWrapper } from "./ErrorWrapper.js";
import { documentContainsLiveQuery, liveQueryExchange } from "./exchanges/liveQueryExchange.js";
import { operationNameExchange } from "./exchanges/operationNameExchange.js";
import { addUrlParams, urlParamExchange } from "./exchanges/urlParamExchange.js";
import { GadgetTransaction, TransactionRolledBack } from "./GadgetTransaction.js";
import { BrowserStorage, InMemoryStorage } from "./InMemoryStorage.js";
import { enqueueActionOperation, graphqlizeBackgroundOptions } from "./operationBuilders.js";
import {
  GadgetTooManyRequestsError,
  GadgetUnexpectedCloseError,
  GadgetWebsocketConnectionTimeoutError,
  get,
  isCloseEvent,
  namespaceDataPath,
  storageAvailable,
} from "./support.js";

export enum GadgetGraphQLCloseCode {
  TooManyRequests = 4294,
}

const DEFAULT_CONN_ATTEMPTS = 3;
const DEFAULT_CONN_ACK_TIMEOUT = 4_800;
const DEFAULT_CONN_GLOBAL_TIMEOUT = 10_000;

/** Close code 1001 means the server is going away (e.g., during a graceful shutdown/deploy) */
const WS_CLOSE_GOING_AWAY = 1001;

const RETRYABLE_CLOSE_CODES = [
  CloseCode.ConnectionAcknowledgementTimeout,
  CloseCode.ConnectionInitialisationTimeout,
  WS_CLOSE_GOING_AWAY,
  GadgetGraphQLCloseCode.TooManyRequests,
];

/**
 * Calculates a retry delay using exponential backoff with jitter.
 *
 * Uses the formula: `500ms * 2^(attempt - 1)` as the base, then applies +/-25%
 * random jitter to spread out reconnection attempts and avoid thundering herd
 * problems during server deploys.
 *
 * @param attempt - The 1-indexed retry attempt number (1 = first retry, 2 = second retry, etc.)
 * @returns Delay in milliseconds before the next retry
 */
function calculateRetryDelay(attempt: number): number {
  const baseDelay = 500 * Math.pow(2, attempt - 1);
  const jitterFactor = 0.75 + Math.random() * 0.5; // range [0.75, 1.25]
  return Math.round(baseDelay * jitterFactor);
}

export const $transaction: symbol = Symbol.for("gadget/transaction");
export const $gadgetConnection: symbol = Symbol.for("gadget/connection");

const sessionStorageKey = "token";
const base64 = typeof btoa !== "undefined" ? btoa : (str: string) => Buffer.from(str).toString("base64");

const objectForGlobals = typeof globalThis != "undefined" ? globalThis : typeof window != "undefined" ? window : undefined;

/**
 * Root level database connection that Actions can use to mutate data in a Gadget database.
 * Manages transactions and the connection to a Gadget API
 */
export class GadgetConnection implements AnyConnection<GadgetConnectionOptions> {
  static version = "vendored" as const;

  // Options used when generating new GraphQL clients for the base connection and for for transactions
  readonly endpoint: string;
  private subscriptionClientOptions?: SubscriptionClientOptions;
  private websocketsEndpoint: string;
  private websocketImplementation?: typeof globalThis.WebSocket;
  private _fetchImplementation: typeof globalThis.fetch;
  private environment: string;
  private exchanges: Required<Exchanges>;
  readonly enqueue: AnyConnection["enqueue"];

  // the base client using HTTP requests that non-transactional operations will use
  private baseClient: Client;

  /** @private (but accessible for testing purposes) */
  baseSubscriptionClient?: SubscriptionClient;

  // the transactional websocket client that will be used inside a transaction block
  private currentTransaction: GadgetTransaction | null = null;

  // How this client will authenticate (if at all) against the Gadget backed
  authenticationMode: AuthenticationMode = AuthenticationMode.Anonymous;
  private sessionTokenStore?: BrowserStorage;
  private requestPolicy: RequestPolicy;
  createSubscriptionClient: typeof createSubscriptionClient;

  constructor(readonly options: GadgetConnectionOptions) {
    if (!options.endpoint) throw new Error("Must provide an `endpoint` option for a GadgetConnection to connect to");
    this.endpoint = options.endpoint;
    if (options.fetchImplementation) {
      this._fetchImplementation = options.fetchImplementation;
    } else if (typeof objectForGlobals != "undefined" && objectForGlobals.fetch) {
      this._fetchImplementation = (...args: [any]) => objectForGlobals.fetch(...args);
    } else {
      throw new Error("No fetch implementation found on the global, can't boot GadgetClient");
    }
    this.websocketImplementation = options.websocketImplementation ?? globalThis?.WebSocket ?? WebSocket;
    this.websocketsEndpoint = options.websocketsEndpoint ?? options.endpoint + "/batch";
    this.websocketsEndpoint = this.websocketsEndpoint.replace(/^http/, "ws");
    this.environment = options.environment ?? "Development";
    this.requestPolicy = options.requestPolicy ?? "cache-and-network";
    this.exchanges = {
      beforeAll: [],
      beforeAsync: [],
      afterAll: [],
      ...options.exchanges,
    };
    this.createSubscriptionClient = options.createSubscriptionClient ?? createSubscriptionClient;

    this.setAuthenticationMode(options.authenticationMode);

    this.enqueue = {
      plan: (action, options) => enqueueActionOperation(action.operationName, action.variables, action.namespace, options, action.isBulk),
      processOptions: (options) => graphqlizeBackgroundOptions(options),
      processResult: (<SchemaT, Action extends AnyActionFunction>(action: Action, result: FunctionResult) => {
        let error = ErrorWrapper.forMaybeCombinedError(result.error);

        let handle: BackgroundActionHandle<SchemaT, Action> | null = null;
        let handles: BackgroundActionHandle<SchemaT, Action>[] | null = null;
        const isBulk = "isBulk" in action ? action.isBulk : false;

        if (result.data) {
          const dataPath = ["background", ...namespaceDataPath([action.operationName], action.namespace)];
          const mutationData = get(result.data, dataPath);
          if (mutationData) {
            const errors = mutationData["errors"];
            if (errors && errors[0]) {
              error = ErrorWrapper.forErrorsResponse(errors, error?.response);
            } else {
              if (isBulk) {
                handles = mutationData.backgroundActions.map(
                  (result: { id: string }) => new BackgroundActionHandle<SchemaT, Action>(this, action, result.id)
                );
              } else {
                handle = new BackgroundActionHandle<SchemaT, Action>(this, action, mutationData.backgroundAction.id);
              }
            }
          }
        }

        if (isBulk) {
          return { handles, error };
        } else {
          return { handle, error };
        }
      }) as {
        <SchemaT, Action extends AnyBulkActionFunction>(
          action: Action,
          result: FunctionResult
        ): {
          handles: BackgroundActionHandle<SchemaT, Action>[] | null;
          error: ErrorWrapper | undefined;
        };
        <SchemaT, Action extends AnyActionFunction>(
          action: Action,
          result: FunctionResult
        ): {
          handle: BackgroundActionHandle<SchemaT, Action> | null;
          error: ErrorWrapper | undefined;
        };
      },
    };

    this.baseClient = this.newBaseClient();
  }

  private get sessionStorageKey() {
    return `${sessionStorageKey}-${this.endpoint}`;
  }

  get currentClient(): Client {
    return this.currentTransaction?.client || this.baseClient;
  }

  set fetchImplementation(implementation: typeof globalThis.fetch) {
    this._fetchImplementation = implementation;
    this.resetClients();
  }

  /**
   * Change the authentication mode settings for this connection imperatively.
   * @private This function is generally not required for use by external developers, but is useful for those building integrations against the Gadget API to configure passed in `api` objects.
   */
  setAuthenticationMode(options?: AuthenticationModeOptions): void {
    if (options) {
      if (options.browserSession) {
        this.enableSessionMode(options.browserSession);
      } else if (options.internal) {
        this.authenticationMode = AuthenticationMode.Internal;
      } else if (options.internalAuthToken) {
        this.authenticationMode = AuthenticationMode.InternalAuthToken;
      } else if (options.apiKey) {
        this.authenticationMode = AuthenticationMode.APIKey;
      } else if (options.custom) {
        this.authenticationMode = AuthenticationMode.Custom;
      }
      this.options.authenticationMode = options;
    }

    this.authenticationMode ??= AuthenticationMode.Anonymous;
  }

  enableSessionMode(options?: true | BrowserSessionAuthenticationModeOptions): void {
    this.authenticationMode = AuthenticationMode.BrowserSession;

    const desiredMode =
      !options || typeof options == "boolean" || !("storageType" in options) ? BrowserSessionStorageType.Durable : options.storageType;
    let sessionTokenStore;
    if (desiredMode == BrowserSessionStorageType.Durable && storageAvailable("localStorage")) {
      sessionTokenStore = window.localStorage;
    } else if (desiredMode == BrowserSessionStorageType.Session && storageAvailable("sessionStorage")) {
      sessionTokenStore = window.sessionStorage;
    } else {
      sessionTokenStore = new InMemoryStorage();
    }

    if (options !== null && typeof options === "object" && "initialToken" in options && options.initialToken) {
      sessionTokenStore.setItem(this.sessionStorageKey, options.initialToken);
    }

    this.sessionTokenStore = sessionTokenStore;
    this.resetClients();
  }

  transaction: {
    <R>(options: GadgetSubscriptionClientOptions, run: TransactionRun<R, GadgetTransaction>): Promise<R>;
    <R>(run: TransactionRun<R, GadgetTransaction>): Promise<R>;
  } = async <R>(
    optionsOrRun: GadgetSubscriptionClientOptions | TransactionRun<R, GadgetTransaction>,
    maybeRun?: TransactionRun<R, GadgetTransaction>
  ): Promise<R> => {
    let run: TransactionRun<R, GadgetTransaction>;
    let options: GadgetSubscriptionClientOptions;

    if (maybeRun) {
      run = maybeRun;
      options = optionsOrRun as GadgetSubscriptionClientOptions;
    } else {
      run = optionsOrRun as TransactionRun<R, GadgetTransaction>;
      options = {};
    }

    if (this.currentTransaction) {
      return await run(this.currentTransaction);
    }

    let subscriptionClient: SubscriptionClient | null = null;
    let transaction;
    try {
      // The server will error if it receives any operations before the auth dance has been completed, so we block on that happening before sending our first operation. It's important that this happens synchronously after instantiating the client so we don't miss any messages
      subscriptionClient = await this.waitForOpenedConnection({
        isFatalConnectionProblem(errorOrCloseEvent) {
          // any interruption of the transaction is fatal to the transaction
          console.warn("Transport error encountered during transaction processing", errorOrCloseEvent);
          return true;
        },
        connectionAckWaitTimeout: DEFAULT_CONN_ACK_TIMEOUT,
        ...options,
        urlParams: {
          ...options.urlParams,
          transaction: "1",
        },
        lazy: false,
        // super ultra critical option that ensures graphql-ws doesn't automatically close the websocket connection when there are no outstanding operations. this is key so we can start a transaction then make mutations within it
        lazyCloseTimeout: 100000,
        retryAttempts: 0,
      });

      const client = new Client({
        url: "/-", // not used because there's no fetch exchange, set for clarity
        requestPolicy: "network-only", // skip any cached data during transactions
        exchanges: [
          ...this.exchanges.beforeAll,
          operationNameExchange,
          ...this.exchanges.beforeAsync,
          subscriptionExchange({
            forwardSubscription(request) {
              const input = { ...request, query: request.query || "" };
              return {
                subscribe: (sink) => {
                  const dispose = subscriptionClient!.subscribe(input, sink as Sink<ExecutionResult>);
                  return {
                    unsubscribe: dispose,
                  };
                },
              };
            },
            enableAllOperations: true,
          }),
          ...this.exchanges.afterAll,
        ],
      });
      (client as any)[$gadgetConnection] = this;

      transaction = new GadgetTransaction(client, subscriptionClient);
      this.currentTransaction = transaction;
      await transaction.start();
      const result = await run(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      try {
        if (transaction?.open) await transaction.rollback();
      } catch (rollbackError) {
        if (!(rollbackError instanceof TransactionRolledBack)) {
          console.warn("Encountered another error while rolling back a Gadget transaction that errored. The other error:", rollbackError);
        }
      }
      if (isCloseEvent(error)) {
        throw new GadgetUnexpectedCloseError(error);
      } else {
        throw error;
      }
    } finally {
      await subscriptionClient?.dispose();
      this.currentTransaction = null;
    }
  };

  close(): void {
    if (this.baseSubscriptionClient) this.disposeClient(this.baseSubscriptionClient);
    if (this.currentTransaction) {
      this.currentTransaction.close();
    }
  }

  /**
   * `fetch` function that works the same as the built-in `fetch` function, but automatically passes authentication information for this API client.
   *
   * @example
   * await api.connection.fetch("https://myapp--development.gadget.app/foo/bar");
   *
   * @example
   * // fetch a relative URL from the endpoint this API client is configured to fetch from
   * await api.connection.fetch("/foo/bar");
   **/
  fetch = async (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
    input = processMaybeRelativeInput(input, this.options.baseRouteURL ?? this.options.endpoint);

    if (this.isGadgetRequest(input)) {
      const requestHeaders = await this.requestHeaders();
      init.headers = { ...requestHeaders, ...init.headers };

      if (this.authenticationMode == AuthenticationMode.Custom) {
        await this.options.authenticationMode!.custom!.processFetch(input, init);
      }
    }

    const response = await this._fetchImplementation(input, init);
    if (this.authenticationMode == AuthenticationMode.BrowserSession) {
      const headerValue = response.headers.get("x-set-authorization");
      const sessionToken = headerValue?.startsWith("Session ") ? headerValue.replace("Session ", "") : null;
      if (sessionToken) {
        this.sessionTokenStore!.setItem(this.sessionStorageKey, sessionToken);
      }
    }

    return response;
  };

  private isGadgetRequest(input: RequestInfo | URL) {
    let requestUrl;

    if (typeof input === "string") {
      requestUrl = input;
    } else if (typeof input === "object" && "url" in input) {
      requestUrl = input.url;
    } else {
      requestUrl = String(input);
    }
    if (isRelativeUrl(this.options.endpoint)) {
      if (isRelativeUrl(requestUrl)) {
        return true;
      } else {
        return false;
      }
    }

    const host = new URL(this.options.endpoint).host;
    return requestUrl.includes(host);
  }

  private resetClients() {
    if (this.currentTransaction) {
      throw new Error("Can't reset clients while a transaction is open");
    }

    if (this.baseSubscriptionClient) this.disposeClient(this.baseSubscriptionClient);
    if (this.baseClient) this.baseClient = this.newBaseClient();
  }

  private newBaseClient() {
    const exchanges = [...this.exchanges.beforeAll, operationNameExchange, urlParamExchange];

    // apply urql's default caching behaviour when client side (but skip it server side)
    if (typeof window != "undefined") {
      exchanges.push(cacheExchange);
      exchanges.push(liveQueryExchange);
    }
    exchanges.push(
      ...this.exchanges.beforeAsync,
      // standard subscriptions for normal GraphQL subscriptions
      subscriptionExchange({
        forwardSubscription: (request) => {
          return {
            subscribe: (sink) => {
              const input = { ...request, query: request.query || "" };

              const dispose = this.getBaseSubscriptionClient().subscribe(input, sink as Sink<ExecutionResult>);
              return {
                unsubscribe: dispose,
              };
            },
          };
        },
      }),
      // another subscription exchange for live queries
      // live queries pass through the same WS client, but use jsondiffs for patching in results
      subscriptionExchange({
        isSubscriptionOperation: (request) => {
          return documentContainsLiveQuery(request.query);
        },
        forwardSubscription: (request) => {
          return {
            subscribe: (sink) => {
              let unsubscribe: (() => void) | undefined = undefined;

              // dynamic import on first subscription the live utils to keep the base bundle size small
              const loadAndSubscribe = import("./graphql-live-query-utils/index.js")
                .then(({ applyAsyncIterableIteratorToSink, applyLiveQueryJSONDiffPatch, makeAsyncIterableIteratorFromSink }) => {
                  const input = { ...request, query: request.query || "" };
                  unsubscribe = applyAsyncIterableIteratorToSink(
                    applyLiveQueryJSONDiffPatch(
                      makeAsyncIterableIteratorFromSink<ExecutionResult>((sink: Sink<ExecutionResult>) =>
                        this.getBaseSubscriptionClient().subscribe(input, sink)
                      )
                    ),
                    sink
                  );
                  return unsubscribe;
                })
                .catch((error) => sink.error(error));

              return {
                unsubscribe: () => {
                  if (unsubscribe) {
                    unsubscribe();
                  } else {
                    void loadAndSubscribe.then((unsubscribe) => {
                      if (unsubscribe) {
                        unsubscribe();
                      }
                    });
                  }
                },
              };
            },
          };
        },
      }),
      fetchExchange,
      ...this.exchanges.afterAll
    );

    const client = new Client({
      url: this.endpoint,
      fetch: this.fetch,
      exchanges,
      requestPolicy: this.requestPolicy,
      preferGetMethod: false,
    });
    (client as any)[$gadgetConnection] = this;

    return client;
  }

  newSubscriptionClient(overrides?: GadgetSubscriptionClientOptions): SubscriptionClient {
    if (!this.websocketImplementation) {
      throw new Error(
        "Can't use this GadgetClient for this subscription-based operation as there's no global WebSocket implementation available. Please pass one as the `websocketImplementation` option to the GadgetClient constructor."
      );
    }

    let url = this.websocketsEndpoint;
    if (overrides?.urlParams) {
      url = addUrlParams(url, overrides.urlParams);
    }

    let activeSocket: globalThis.WebSocket;
    let timedOut: NodeJS.Timeout;

    return this.createSubscriptionClient({
      url,
      webSocketImpl: this.websocketImplementation,
      keepAlive: 7_000,
      connectionParams: async () => {
        // In the browser, we can't set arbitrary headers on the websocket request, so we don't use the same auth mechanism that we use for normal HTTP requests. Instead we use graphql-ws' connectionParams to send the auth information in the connection setup message to the server.
        const connectionParams: Record<string, any> = { environment: this.environment, auth: { type: this.authenticationMode } };
        if (this.authenticationMode == AuthenticationMode.APIKey) {
          connectionParams.auth.key = this.options.authenticationMode!.apiKey!;
        } else if (
          this.authenticationMode == AuthenticationMode.Internal ||
          this.authenticationMode == AuthenticationMode.InternalAuthToken
        ) {
          const authToken =
            this.authenticationMode == AuthenticationMode.Internal
              ? this.options.authenticationMode!.internal!.authToken
              : this.options.authenticationMode!.internalAuthToken!;
          connectionParams.auth.token = authToken;
          if (this.authenticationMode == AuthenticationMode.Internal && this.options.authenticationMode!.internal!.actAsSession) {
            connectionParams.auth.actAsInternalSession = true;
            connectionParams.auth.internalSessionId = await this.options.authenticationMode!.internal!.getSessionId?.();
          }
        } else if (this.authenticationMode == AuthenticationMode.BrowserSession) {
          connectionParams.auth.sessionToken = this.sessionTokenStore!.getItem(this.sessionStorageKey);
        } else if (this.authenticationMode == AuthenticationMode.Custom) {
          await this.options.authenticationMode?.custom?.processTransactionConnectionParams(connectionParams);
        }
        return connectionParams;
      },
      onNonLazyError: () => {
        // we catch this outside in the runner function
      },
      on: {
        connected: (socket, payload, wasRetry) => {
          // If we're using session token authorization, we don't use request headers to exchange the session token, we use graphql-ws' ConnectionAck payload to persist the token. When the subscription client first starts, the server will send us session token identifying this client, and we persist it to the session token store
          if (this.authenticationMode == AuthenticationMode.BrowserSession && payload?.sessionToken) {
            const browserSession = this.options.authenticationMode?.browserSession;
            const initialToken = browserSession !== null && typeof browserSession === "object" ? browserSession.initialToken : null;
            if (!initialToken) {
              this.sessionTokenStore!.setItem(this.sessionStorageKey, payload.sessionToken as string);
            }
          }
          this.subscriptionClientOptions?.on?.connected?.(socket, payload, wasRetry);
          overrides?.on?.connected?.(socket, payload, wasRetry);
          activeSocket = socket as globalThis.WebSocket;
        },
        ping: (received) => {
          if (!received) {
            timedOut = setTimeout(() => {
              if (activeSocket.readyState === WebSocket.OPEN) {
                activeSocket.close(4408, "Request Timeout");
              }
            }, 3_000);
          }
        },
        pong: (received) => {
          if (received) clearTimeout(timedOut);
        },
      },
      ...this.subscriptionClientOptions,
      ...overrides,
    });
  }

  private async requestHeaders() {
    const headers: Record<string, string> = {};

    if (this.authenticationMode == AuthenticationMode.Internal || this.authenticationMode == AuthenticationMode.InternalAuthToken) {
      const authToken =
        this.authenticationMode == AuthenticationMode.Internal
          ? this.options.authenticationMode!.internal!.authToken
          : this.options.authenticationMode!.internalAuthToken!;

      headers.authorization = "Basic " + base64("gadget-internal" + ":" + authToken);

      if (this.authenticationMode == AuthenticationMode.Internal && this.options.authenticationMode!.internal!.actAsSession) {
        headers["x-gadget-act-as-internal-session"] = "true";

        const sessionId = await this.options.authenticationMode!.internal!.getSessionId?.();
        if (sessionId) {
          headers["x-gadget-internal-session-id"] = sessionId;
        }
      }
    } else if (this.authenticationMode == AuthenticationMode.APIKey) {
      headers.authorization = `Bearer ${this.options.authenticationMode?.apiKey}`;
    } else if (this.authenticationMode == AuthenticationMode.BrowserSession) {
      const val = this.sessionTokenStore!.getItem(this.sessionStorageKey);
      if (val) {
        headers.authorization = `Session ${val}`;
      }

      const browserSessionOptions = this.options.authenticationMode!.browserSession!;
      const shopId = typeof browserSessionOptions === "boolean" ? undefined : browserSessionOptions.shopId;
      if (shopId) {
        headers["x-gadget-for-shop-id"] = shopId;
      }
    }

    headers["x-gadget-environment"] = this.environment;

    return headers;
  }

  private async waitForOpenedConnection(options: GadgetSubscriptionClientOptions): Promise<SubscriptionClient> {
    let subscriptionClient = this.newSubscriptionClient(options);
    let unsubscribes: Function[] = []; // eslint-disable-line @typescript-eslint/no-unsafe-function-type

    const totalAttempts = options.connectionAttempts || DEFAULT_CONN_ATTEMPTS;
    let remainingRetries = totalAttempts - 1; // first attempt is the initial connection above
    const globalTimeout = options.connectionGlobalTimeoutMs || DEFAULT_CONN_GLOBAL_TIMEOUT;
    let retryTimeoutId: ReturnType<typeof setTimeout> | undefined;

    const clearListeners = () => {
      if (retryTimeoutId !== undefined) {
        clearTimeout(retryTimeoutId);
        retryTimeoutId = undefined;
      }
      unsubscribes.forEach((fn) => fn());
      unsubscribes = [];
    };

    return await new Promise<SubscriptionClient>((resolve, reject) => {
      const timeout = setTimeout(() => {
        clearListeners();
        this.disposeClient(subscriptionClient);
        wrappedReject(new GadgetWebsocketConnectionTimeoutError("Timeout opening websocket connection to Gadget API"));
      }, globalTimeout);

      const retryOnClose = (event: unknown) => {
        if (isCloseEvent(event)) {
          if (RETRYABLE_CLOSE_CODES.includes(event.code) && remainingRetries > 0) {
            remainingRetries -= 1;
            // Clear listeners first to prevent duplicate close/error events from scheduling extra retries
            clearListeners();
            this.disposeClient(subscriptionClient);

            const retryNumber = totalAttempts - 1 - remainingRetries;
            const delay = calculateRetryDelay(retryNumber);
            retryTimeoutId = setTimeout(() => {
              retryTimeoutId = undefined;
              subscriptionClient = this.newSubscriptionClient(options);
              resetListeners();
            }, delay);
            return;
          }

          if (event.code == (GadgetGraphQLCloseCode.TooManyRequests as number)) {
            clearListeners();
            return wrappedReject(new GadgetTooManyRequestsError(event.reason));
          }
        }

        clearListeners();
        clearTimeout(timeout);
        reject(new GadgetUnexpectedCloseError(event));
      };

      const wrappedReject = (err: any) => {
        clearTimeout(timeout);
        reject(err);
      };

      const wrappedResolve = () => {
        clearTimeout(timeout);
        resolve(subscriptionClient);
      };

      const resetListeners = () => {
        clearListeners();
        unsubscribes.push(subscriptionClient.on("connected", wrappedResolve));
        unsubscribes.push(subscriptionClient.on("closed", retryOnClose));
        unsubscribes.push(subscriptionClient.on("error", wrappedReject));
      };

      resetListeners();
    }).finally(clearListeners);
  }

  private disposeClient(client: SubscriptionClient) {
    const maybePromise = client.dispose();
    if (maybePromise) {
      maybePromise.catch((err: any) => console.error(`Error closing SubscriptionClient: ${err.message}`));
    }
  }

  private getBaseSubscriptionClient() {
    if (!this.baseSubscriptionClient) {
      this.baseSubscriptionClient = this.newSubscriptionClient({ lazy: true });
    }
    return this.baseSubscriptionClient;
  }
}

function processMaybeRelativeInput(input: RequestInfo | URL, endpoint: string): RequestInfo | URL {
  if (typeof input != "string") return input;
  if (isRelativeUrl(input)) {
    try {
      return String(new URL(input, endpoint));
    } catch (err) {
      return input;
    }
  }
  return input;
}

function isRelativeUrl(url: string) {
  return url.startsWith("/") && !url.startsWith("//");
}
