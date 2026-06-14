import { Client, cacheExchange, fetchExchange, subscriptionExchange } from "@urql/core";
import { CloseCode, createClient as createSubscriptionClient } from "graphql-ws";
import WebSocket from "isomorphic-ws";
import { BackgroundActionHandle } from "./BackgroundActionHandle.js";
import {
  AuthenticationMode,
  BrowserSessionStorageType
} from "./ClientOptions.js";
import { ErrorWrapper } from "./ErrorWrapper.js";
import { documentContainsLiveQuery, liveQueryExchange } from "./exchanges/liveQueryExchange.js";
import { operationNameExchange } from "./exchanges/operationNameExchange.js";
import { addUrlParams, urlParamExchange } from "./exchanges/urlParamExchange.js";
import { GadgetTransaction, TransactionRolledBack } from "./GadgetTransaction.js";
import { InMemoryStorage } from "./InMemoryStorage.js";
import { enqueueActionOperation, graphqlizeBackgroundOptions } from "./operationBuilders.js";
import {
  GadgetTooManyRequestsError,
  GadgetUnexpectedCloseError,
  GadgetWebsocketConnectionTimeoutError,
  get,
  isCloseEvent,
  namespaceDataPath,
  storageAvailable
} from "./support.js";
var GadgetGraphQLCloseCode = /* @__PURE__ */ ((GadgetGraphQLCloseCode2) => {
  GadgetGraphQLCloseCode2[GadgetGraphQLCloseCode2["TooManyRequests"] = 4294] = "TooManyRequests";
  return GadgetGraphQLCloseCode2;
})(GadgetGraphQLCloseCode || {});
const DEFAULT_CONN_ATTEMPTS = 3;
const DEFAULT_CONN_ACK_TIMEOUT = 4800;
const DEFAULT_CONN_GLOBAL_TIMEOUT = 1e4;
const WS_CLOSE_GOING_AWAY = 1001;
const RETRYABLE_CLOSE_CODES = [
  CloseCode.ConnectionAcknowledgementTimeout,
  CloseCode.ConnectionInitialisationTimeout,
  WS_CLOSE_GOING_AWAY,
  4294 /* TooManyRequests */
];
function calculateRetryDelay(attempt) {
  const baseDelay = 500 * Math.pow(2, attempt - 1);
  const jitterFactor = 0.75 + Math.random() * 0.5;
  return Math.round(baseDelay * jitterFactor);
}
const $transaction = Symbol.for("gadget/transaction");
const $gadgetConnection = Symbol.for("gadget/connection");
const sessionStorageKey = "token";
const base64 = typeof btoa !== "undefined" ? btoa : (str) => Buffer.from(str).toString("base64");
const objectForGlobals = typeof globalThis != "undefined" ? globalThis : typeof window != "undefined" ? window : void 0;
class GadgetConnection {
  constructor(options) {
    this.options = options;
    // the transactional websocket client that will be used inside a transaction block
    this.currentTransaction = null;
    // How this client will authenticate (if at all) against the Gadget backed
    this.authenticationMode = AuthenticationMode.Anonymous;
    this.transaction = async (optionsOrRun, maybeRun) => {
      let run;
      let options;
      if (maybeRun) {
        run = maybeRun;
        options = optionsOrRun;
      } else {
        run = optionsOrRun;
        options = {};
      }
      if (this.currentTransaction) {
        return await run(this.currentTransaction);
      }
      let subscriptionClient = null;
      let transaction;
      try {
        subscriptionClient = await this.waitForOpenedConnection({
          isFatalConnectionProblem(errorOrCloseEvent) {
            console.warn("Transport error encountered during transaction processing", errorOrCloseEvent);
            return true;
          },
          connectionAckWaitTimeout: DEFAULT_CONN_ACK_TIMEOUT,
          ...options,
          urlParams: {
            ...options.urlParams,
            transaction: "1"
          },
          lazy: false,
          // super ultra critical option that ensures graphql-ws doesn't automatically close the websocket connection when there are no outstanding operations. this is key so we can start a transaction then make mutations within it
          lazyCloseTimeout: 1e5,
          retryAttempts: 0
        });
        const client = new Client({
          url: "/-",
          // not used because there's no fetch exchange, set for clarity
          requestPolicy: "network-only",
          // skip any cached data during transactions
          exchanges: [
            ...this.exchanges.beforeAll,
            operationNameExchange,
            ...this.exchanges.beforeAsync,
            subscriptionExchange({
              forwardSubscription(request) {
                const input = { ...request, query: request.query || "" };
                return {
                  subscribe: (sink) => {
                    const dispose = subscriptionClient.subscribe(input, sink);
                    return {
                      unsubscribe: dispose
                    };
                  }
                };
              },
              enableAllOperations: true
            }),
            ...this.exchanges.afterAll
          ]
        });
        client[$gadgetConnection] = this;
        transaction = new GadgetTransaction(client, subscriptionClient);
        this.currentTransaction = transaction;
        await transaction.start();
        const result = await run(transaction);
        await transaction.commit();
        return result;
      } catch (error) {
        try {
          if (transaction?.open)
            await transaction.rollback();
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
    this.fetch = async (input, init = {}) => {
      input = processMaybeRelativeInput(input, this.options.baseRouteURL ?? this.options.endpoint);
      if (this.isGadgetRequest(input)) {
        const requestHeaders = await this.requestHeaders();
        init.headers = { ...requestHeaders, ...init.headers };
        if (this.authenticationMode == AuthenticationMode.Custom) {
          await this.options.authenticationMode.custom.processFetch(input, init);
        }
      }
      const response = await this._fetchImplementation(input, init);
      if (this.authenticationMode == AuthenticationMode.BrowserSession) {
        const headerValue = response.headers.get("x-set-authorization");
        const sessionToken = headerValue?.startsWith("Session ") ? headerValue.replace("Session ", "") : null;
        if (sessionToken) {
          this.sessionTokenStore.setItem(this.sessionStorageKey, sessionToken);
        }
      }
      return response;
    };
    if (!options.endpoint)
      throw new Error("Must provide an `endpoint` option for a GadgetConnection to connect to");
    this.endpoint = options.endpoint;
    if (options.fetchImplementation) {
      this._fetchImplementation = options.fetchImplementation;
    } else if (typeof objectForGlobals != "undefined" && objectForGlobals.fetch) {
      this._fetchImplementation = (...args) => objectForGlobals.fetch(...args);
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
      ...options.exchanges
    };
    this.createSubscriptionClient = options.createSubscriptionClient ?? createSubscriptionClient;
    this.setAuthenticationMode(options.authenticationMode);
    this.enqueue = {
      plan: (action, options2) => enqueueActionOperation(action.operationName, action.variables, action.namespace, options2, action.isBulk),
      processOptions: (options2) => graphqlizeBackgroundOptions(options2),
      processResult: (action, result) => {
        let error = ErrorWrapper.forMaybeCombinedError(result.error);
        let handle = null;
        let handles = null;
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
                  (result2) => new BackgroundActionHandle(this, action, result2.id)
                );
              } else {
                handle = new BackgroundActionHandle(this, action, mutationData.backgroundAction.id);
              }
            }
          }
        }
        if (isBulk) {
          return { handles, error };
        } else {
          return { handle, error };
        }
      }
    };
    this.baseClient = this.newBaseClient();
  }
  get sessionStorageKey() {
    return `${sessionStorageKey}-${this.endpoint}`;
  }
  get currentClient() {
    return this.currentTransaction?.client || this.baseClient;
  }
  set fetchImplementation(implementation) {
    this._fetchImplementation = implementation;
    this.resetClients();
  }
  /**
   * Change the authentication mode settings for this connection imperatively.
   * @private This function is generally not required for use by external developers, but is useful for those building integrations against the Gadget API to configure passed in `api` objects.
   */
  setAuthenticationMode(options) {
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
    this.authenticationMode ?? (this.authenticationMode = AuthenticationMode.Anonymous);
  }
  enableSessionMode(options) {
    this.authenticationMode = AuthenticationMode.BrowserSession;
    const desiredMode = !options || typeof options == "boolean" || !("storageType" in options) ? BrowserSessionStorageType.Durable : options.storageType;
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
  close() {
    if (this.baseSubscriptionClient)
      this.disposeClient(this.baseSubscriptionClient);
    if (this.currentTransaction) {
      this.currentTransaction.close();
    }
  }
  isGadgetRequest(input) {
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
  resetClients() {
    if (this.currentTransaction) {
      throw new Error("Can't reset clients while a transaction is open");
    }
    if (this.baseSubscriptionClient)
      this.disposeClient(this.baseSubscriptionClient);
    if (this.baseClient)
      this.baseClient = this.newBaseClient();
  }
  newBaseClient() {
    const exchanges = [...this.exchanges.beforeAll, operationNameExchange, urlParamExchange];
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
              const dispose = this.getBaseSubscriptionClient().subscribe(input, sink);
              return {
                unsubscribe: dispose
              };
            }
          };
        }
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
              let unsubscribe = void 0;
              const loadAndSubscribe = import("./graphql-live-query-utils/index.js").then(({ applyAsyncIterableIteratorToSink, applyLiveQueryJSONDiffPatch, makeAsyncIterableIteratorFromSink }) => {
                const input = { ...request, query: request.query || "" };
                unsubscribe = applyAsyncIterableIteratorToSink(
                  applyLiveQueryJSONDiffPatch(
                    makeAsyncIterableIteratorFromSink(
                      (sink2) => this.getBaseSubscriptionClient().subscribe(input, sink2)
                    )
                  ),
                  sink
                );
                return unsubscribe;
              }).catch((error) => sink.error(error));
              return {
                unsubscribe: () => {
                  if (unsubscribe) {
                    unsubscribe();
                  } else {
                    void loadAndSubscribe.then((unsubscribe2) => {
                      if (unsubscribe2) {
                        unsubscribe2();
                      }
                    });
                  }
                }
              };
            }
          };
        }
      }),
      fetchExchange,
      ...this.exchanges.afterAll
    );
    const client = new Client({
      url: this.endpoint,
      fetch: this.fetch,
      exchanges,
      requestPolicy: this.requestPolicy,
      preferGetMethod: false
    });
    client[$gadgetConnection] = this;
    return client;
  }
  newSubscriptionClient(overrides) {
    if (!this.websocketImplementation) {
      throw new Error(
        "Can't use this GadgetClient for this subscription-based operation as there's no global WebSocket implementation available. Please pass one as the `websocketImplementation` option to the GadgetClient constructor."
      );
    }
    let url = this.websocketsEndpoint;
    if (overrides?.urlParams) {
      url = addUrlParams(url, overrides.urlParams);
    }
    let activeSocket;
    let timedOut;
    return this.createSubscriptionClient({
      url,
      webSocketImpl: this.websocketImplementation,
      keepAlive: 7e3,
      connectionParams: async () => {
        const connectionParams = { environment: this.environment, auth: { type: this.authenticationMode } };
        if (this.authenticationMode == AuthenticationMode.APIKey) {
          connectionParams.auth.key = this.options.authenticationMode.apiKey;
        } else if (this.authenticationMode == AuthenticationMode.Internal || this.authenticationMode == AuthenticationMode.InternalAuthToken) {
          const authToken = this.authenticationMode == AuthenticationMode.Internal ? this.options.authenticationMode.internal.authToken : this.options.authenticationMode.internalAuthToken;
          connectionParams.auth.token = authToken;
          if (this.authenticationMode == AuthenticationMode.Internal && this.options.authenticationMode.internal.actAsSession) {
            connectionParams.auth.actAsInternalSession = true;
            connectionParams.auth.internalSessionId = await this.options.authenticationMode.internal.getSessionId?.();
          }
        } else if (this.authenticationMode == AuthenticationMode.BrowserSession) {
          connectionParams.auth.sessionToken = this.sessionTokenStore.getItem(this.sessionStorageKey);
        } else if (this.authenticationMode == AuthenticationMode.Custom) {
          await this.options.authenticationMode?.custom?.processTransactionConnectionParams(connectionParams);
        }
        return connectionParams;
      },
      onNonLazyError: () => {
      },
      on: {
        connected: (socket, payload, wasRetry) => {
          if (this.authenticationMode == AuthenticationMode.BrowserSession && payload?.sessionToken) {
            const browserSession = this.options.authenticationMode?.browserSession;
            const initialToken = browserSession !== null && typeof browserSession === "object" ? browserSession.initialToken : null;
            if (!initialToken) {
              this.sessionTokenStore.setItem(this.sessionStorageKey, payload.sessionToken);
            }
          }
          this.subscriptionClientOptions?.on?.connected?.(socket, payload, wasRetry);
          overrides?.on?.connected?.(socket, payload, wasRetry);
          activeSocket = socket;
        },
        ping: (received) => {
          if (!received) {
            timedOut = setTimeout(() => {
              if (activeSocket.readyState === WebSocket.OPEN) {
                activeSocket.close(4408, "Request Timeout");
              }
            }, 3e3);
          }
        },
        pong: (received) => {
          if (received)
            clearTimeout(timedOut);
        }
      },
      ...this.subscriptionClientOptions,
      ...overrides
    });
  }
  async requestHeaders() {
    const headers = {};
    if (this.authenticationMode == AuthenticationMode.Internal || this.authenticationMode == AuthenticationMode.InternalAuthToken) {
      const authToken = this.authenticationMode == AuthenticationMode.Internal ? this.options.authenticationMode.internal.authToken : this.options.authenticationMode.internalAuthToken;
      headers.authorization = "Basic " + base64("gadget-internal:" + authToken);
      if (this.authenticationMode == AuthenticationMode.Internal && this.options.authenticationMode.internal.actAsSession) {
        headers["x-gadget-act-as-internal-session"] = "true";
        const sessionId = await this.options.authenticationMode.internal.getSessionId?.();
        if (sessionId) {
          headers["x-gadget-internal-session-id"] = sessionId;
        }
      }
    } else if (this.authenticationMode == AuthenticationMode.APIKey) {
      headers.authorization = `Bearer ${this.options.authenticationMode?.apiKey}`;
    } else if (this.authenticationMode == AuthenticationMode.BrowserSession) {
      const val = this.sessionTokenStore.getItem(this.sessionStorageKey);
      if (val) {
        headers.authorization = `Session ${val}`;
      }
      const browserSessionOptions = this.options.authenticationMode.browserSession;
      const shopId = typeof browserSessionOptions === "boolean" ? void 0 : browserSessionOptions.shopId;
      if (shopId) {
        headers["x-gadget-for-shop-id"] = shopId;
      }
    }
    headers["x-gadget-environment"] = this.environment;
    return headers;
  }
  async waitForOpenedConnection(options) {
    let subscriptionClient = this.newSubscriptionClient(options);
    let unsubscribes = [];
    const totalAttempts = options.connectionAttempts || DEFAULT_CONN_ATTEMPTS;
    let remainingRetries = totalAttempts - 1;
    const globalTimeout = options.connectionGlobalTimeoutMs || DEFAULT_CONN_GLOBAL_TIMEOUT;
    let retryTimeoutId;
    const clearListeners = () => {
      if (retryTimeoutId !== void 0) {
        clearTimeout(retryTimeoutId);
        retryTimeoutId = void 0;
      }
      unsubscribes.forEach((fn) => fn());
      unsubscribes = [];
    };
    return await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        clearListeners();
        this.disposeClient(subscriptionClient);
        wrappedReject(new GadgetWebsocketConnectionTimeoutError("Timeout opening websocket connection to Gadget API"));
      }, globalTimeout);
      const retryOnClose = (event) => {
        if (isCloseEvent(event)) {
          if (RETRYABLE_CLOSE_CODES.includes(event.code) && remainingRetries > 0) {
            remainingRetries -= 1;
            clearListeners();
            this.disposeClient(subscriptionClient);
            const retryNumber = totalAttempts - 1 - remainingRetries;
            const delay = calculateRetryDelay(retryNumber);
            retryTimeoutId = setTimeout(() => {
              retryTimeoutId = void 0;
              subscriptionClient = this.newSubscriptionClient(options);
              resetListeners();
            }, delay);
            return;
          }
          if (event.code == 4294 /* TooManyRequests */) {
            clearListeners();
            return wrappedReject(new GadgetTooManyRequestsError(event.reason));
          }
        }
        clearListeners();
        clearTimeout(timeout);
        reject(new GadgetUnexpectedCloseError(event));
      };
      const wrappedReject = (err) => {
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
  disposeClient(client) {
    const maybePromise = client.dispose();
    if (maybePromise) {
      maybePromise.catch((err) => console.error(`Error closing SubscriptionClient: ${err.message}`));
    }
  }
  getBaseSubscriptionClient() {
    if (!this.baseSubscriptionClient) {
      this.baseSubscriptionClient = this.newSubscriptionClient({ lazy: true });
    }
    return this.baseSubscriptionClient;
  }
}
GadgetConnection.version = "vendored";
function processMaybeRelativeInput(input, endpoint) {
  if (typeof input != "string")
    return input;
  if (isRelativeUrl(input)) {
    try {
      return String(new URL(input, endpoint));
    } catch (err) {
      return input;
    }
  }
  return input;
}
function isRelativeUrl(url) {
  return url.startsWith("/") && !url.startsWith("//");
}
export {
  $gadgetConnection,
  $transaction,
  GadgetConnection,
  GadgetGraphQLCloseCode
};
//# sourceMappingURL=GadgetConnection.js.map
