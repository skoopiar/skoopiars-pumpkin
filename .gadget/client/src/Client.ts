// generated with metadata generator for skoopiar for fv ^1.5.0
  import { $modelRelationships, $coreImplementation } from "@gadgetinc/core";
  import type { AnyClient, ActionFunctionMetadata, GlobalActionFunction, AnyCoreImplementation, ProcessResultFunction, GQLBuilderResult, EnqueueBackgroundActionOptions, AnyActionFunction } from "@gadgetinc/core";


  import type { OperationContext, Exchange } from "@urql/core";
  import type { DocumentNode } from 'graphql';
  import { pipe, map } from "wonka";
  import { GadgetConnection } from "./connection/GadgetConnection.js";
  import { InternalModelManager } from "./connection/InternalModelManager.js";
  import { AuthenticationMode, type ClientOptions as ApiClientOptions, type AuthenticationModeOptions } from "./connection/ClientOptions.js";
  import { assert, GadgetClientError, disambiguateActionVariables, disambiguateBulkActionVariables, capitalizeIdentifier, namespaceDataPath, camelize, isEqual } from "./connection/support.js";
  import { GadgetTransaction } from "./connection/GadgetTransaction.js";
  import { ErrorWrapper } from "./connection/ErrorWrapper.js";
  import { GadgetRecord } from "./connection/GadgetRecord.js";
  import { enqueueActionRunner } from "./connection/operationRunners.js";
  import { BackgroundActionHandle } from "./connection/BackgroundActionHandle.js";;
  import { buildGlobalAction, buildInlineComputedView } from "./builder.js";
  import { DefaultUserSelection, UserManager } from "./models/User.js";
  import { DefaultGameSelection, GameManager } from "./models/Game.js";
  import { DefaultSessionSelection, SessionManager } from "./models/Session.js";
  import { CurrentSessionManager } from "./models/CurrentSession.js";
  export { DefaultUserSelection, type UserRecord } from "./models/User.js";
  export { DefaultGameSelection, type GameRecord } from "./models/Game.js";
  export { DefaultSessionSelection, type SessionRecord } from "./models/Session.js";

  type BaseClientOptions = Omit<ApiClientOptions, "authenticationMode">;
  export type ClientOptions = BaseClientOptions &
    (
      | {
          /**
           * The authentication strategy for connecting to the upstream API.
           *
           * Note: you can only declare authentication modes at the top level, or under the `authenticationMode` key.
           * If you declare them at the top level and under the `authenticationMode` key at the same time, an error will be thrown.
           **/
          authenticationMode?: AuthenticationModeOptions;
        }
      | ({
          authenticationMode?: never;
        } & AuthenticationModeOptions)
    );

  type AllOptionalVariables<T> = Partial<T> extends T ? object : never;
  type CoreArgsKey = (typeof import('@gadgetinc/core')) extends { $args: infer K } ? K : symbol;
  export type InternalModelManagers = {
     /** The internal API model manager for the user model */
     user: InternalModelManager;
     /** The internal API model manager for the game model */
     game: InternalModelManager;
     /** The internal API model manager for the session model */
     session: InternalModelManager;
   };

  const productionEnv = "production";
  const fallbackEnv = "development";

  const availableAuthenticationModes = [
    "apiKey",
    "browserSession",
    "anonymous",
    "internalAuthToken",
    "internal",
    "custom",
  ] as const satisfies readonly (keyof AuthenticationModeOptions)[];

  export const maybeGetAuthenticationModeOptionsFromClientOptions = (options: ClientOptions): AuthenticationModeOptions | undefined => {
    const topLevelAuthModes: AuthenticationModeOptions = {};
    for (const key of availableAuthenticationModes) {
      if (key in options) {
        topLevelAuthModes[key] = (options as any)[key];
      }
    }

    if ("authenticationMode" in options && Object.keys(topLevelAuthModes).length > 0) {
      throw new GadgetClientError(
        "Declaring authentication modes at the top level and under the `authenticationMode` key at the same time is not allowed."
      );
    }

    if ("authenticationMode" in options) {
      return options.authenticationMode;
    }

    if (Object.keys(topLevelAuthModes).length === 0) {
      return undefined;
    }

    return topLevelAuthModes;
  };

  /**
   * Return the implicit environment
   * We specifically use an environment variable  `process.env.GADGET_ENV` or similar so that bundlers like webpack or vite can string replace this value in built source codes with the user's desired value.
   */
  const getImplicitEnv = () => {
    try {
      return process.env.GADGET_ENV;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Function type for the inline view execution function.
   * Includes overloads for all known instances collected from call sites.
   **/
  type InlineViewFunction = {
    (query: string, variables?: Record<string, unknown>): Promise<unknown>
  }

  /**
   * Root object used for interacting with the skoopiar API. `SkoopiarClient` has `query` and `mutation` functions for executing raw GraphQL queries and mutations, as well as `ModelManager` objects for manipulating models with a JavaScript API. `SkoopiarClient` also has a `fetch` function for making raw requests to your backend.

Note: When declaring authentication modes, you can only declare authentication modes at the top level, or under the `authenticationMode` key. If you declare them at the top level and under the `authenticationMode` key at the same time, an error will be thrown.
   * */
  export class SkoopiarClient implements AnyClient {
    $args = Symbol.for('gadget/fieldArgs') as CoreArgsKey;
    connection!: GadgetConnection;
    readonly options: ClientOptions | undefined;

    /** Executes the inspectDiscordCommands global action. */
    inspectDiscordCommands = buildGlobalAction(this, {
                         type: 'globalAction',
                         functionName: 'inspectDiscordCommands',
                         operationName: 'inspectDiscordCommands',
                         operationReturnType: 'InspectDiscordCommands',
                         namespace: null,
                         variables: {}
                       } as const) as unknown as {
                       (): Promise<any>;
                       type: 'globalAction';
                       operationName: 'inspectDiscordCommands';
                       operationReturnType: 'InspectDiscordCommands';
                       namespace: null;
                       typesImports: [];
                       variables: {};
                       variablesType: Record<string, never>;
                       plan: (variables?: Record<string, never>) => GQLBuilderResult;
                       processResult: ProcessResultFunction;
                     };
    /** Executes the registerCommands global action. */
    registerCommands = buildGlobalAction(this, {
                         type: 'globalAction',
                         functionName: 'registerCommands',
                         operationName: 'registerCommands',
                         operationReturnType: 'RegisterCommands',
                         namespace: null,
                         variables: {}
                       } as const) as unknown as {
                       (): Promise<any>;
                       type: 'globalAction';
                       operationName: 'registerCommands';
                       operationReturnType: 'RegisterCommands';
                       namespace: null;
                       typesImports: [];
                       variables: {};
                       variablesType: Record<string, never>;
                       plan: (variables?: Record<string, never>) => GQLBuilderResult;
                       processResult: ProcessResultFunction;
                     };
    /** Executes the removeCommands global action. */
    removeCommands = buildGlobalAction(this, {
                         type: 'globalAction',
                         functionName: 'removeCommands',
                         operationName: 'removeCommands',
                         operationReturnType: 'RemoveCommands',
                         namespace: null,
                         variables: {}
                       } as const) as unknown as {
                       (): Promise<any>;
                       type: 'globalAction';
                       operationName: 'removeCommands';
                       operationReturnType: 'RemoveCommands';
                       namespace: null;
                       typesImports: [];
                       variables: {};
                       variablesType: Record<string, never>;
                       plan: (variables?: Record<string, never>) => GQLBuilderResult;
                       processResult: ProcessResultFunction;
                     };
    /** Executes an inline computed view. */
    view: InlineViewFunction = buildInlineComputedView(this, {
                               type: 'computedView',
                               operationName: 'gellyView',
                               functionName: 'view',
                               gqlFieldName: 'gellyView',
                               namespace: null,
                               variables: {
                                 query: { type: 'String', required: true },
                                 args: { type: 'JSONObject' }
                               }
                             } as const);
    user!: UserManager;
    game!: GameManager;
    session!: SessionManager;
    currentSession!: CurrentSessionManager;

    /**
    * Namespaced object for accessing models via the Gadget internal APIs, which provide lower level and higher privileged operations directly against the database. Useful for maintenance operations like migrations or correcting broken data, and for implementing the high level actions.
    *
    * Returns an object of model API identifiers to `InternalModelManager` objects.
    *
    * Example:
    * `api.internal.user.findOne(...)`
    */
    internal!: InternalModelManagers;

    /**
     * The list of environments with a customized API root endpoint
     */
    apiRoots: Record<string, string> = {"development":"https://skoopiar--development.gadget.app/","production":"https://skoopiar.gadget.app/"};



    applicationId: string = "334033";
    environment!: string;

    constructor(options?: ClientOptions | undefined) {
      let inSSRContext = false;
      this.options = options;

      try {
        // @ts-ignore
        inSSRContext = !!(import.meta.env && import.meta.env.SSR);
      } catch (error) {
        // no-op; this try-catch is here to prevent the empty-import-meta esbuild warning:
      }

      // Inside Vite SSR contexts on Gadget's app sandboxes, we use the global api client set up
      // by the gadget-server package. This is so that the api client used in i.e. Remix loaders
      // has all of the same auth and functionality as any other sandbox api client.
      if (inSSRContext) {
        const api = (globalThis as any).GadgetGlobals?.api;

        if (api) {
          return api.actAsSession;
        }
      }

      // for multi environment apps (this one), we accept any 'ole string as an environment, and we look in GADGET_ENV to determine the environment if not passed explicitly
      this.environment = (options?.environment ?? getImplicitEnv() ?? fallbackEnv).toLocaleLowerCase();
      let apiRoot: string;
      if (this.apiRoots[this.environment]) {
        apiRoot = this.apiRoots[this.environment];
      } else {
        const envPart = this.environment == productionEnv ? "" : `--${this.environment}`;
        apiRoot = `https://skoopiar${envPart}.gadget.app`;
      }

      const exchanges = {...options?.exchanges};
      if (this.environment !== productionEnv) {
        const devHarnessExchange: Exchange = ({ forward }) => {
          return operations$ => {
            const operationResult$ = forward(operations$)

            return pipe(
              operationResult$,
              map(result => {
                try {
                  if (typeof window !== "undefined" && typeof CustomEvent === "function") {
                    const event = new CustomEvent("gadget:devharness:graphqlresult", { detail: result });
                    window.dispatchEvent(event);
                  }
                } catch (error: any) {
                  // gracefully handle environments where CustomEvent is misbehaved like jsdom
                  console.warn("[gadget] error dispatching gadget dev harness event", error)
                }

                return result;
              })
            );
          };
        };

        exchanges.beforeAll = [
          devHarnessExchange,
          ...(exchanges.beforeAll ?? []),
        ];
      }

      const connectionOptions = {
        endpoint: new URL("api/graphql", apiRoot).toString(),
        applicationId: this.applicationId,
        authenticationMode: options?.authenticationMode,
        ...options,
        exchanges,
        environment: this.environment,
      }

      const authenticationMode = maybeGetAuthenticationModeOptionsFromClientOptions(options ?? {});
      connectionOptions.authenticationMode = authenticationMode ?? (typeof window == 'undefined' ? { anonymous: true } : { browserSession: true });

      this.connection = new GadgetConnection(connectionOptions);

      // check for api key usage in the browser. detect browsers using the presence of window and window.document, since server side JS runtimes like Deno and Bun define window (but not window.document)
      if (
        typeof window != 'undefined'
        && typeof window.document != 'undefined'
        && this.connection.authenticationMode == AuthenticationMode.APIKey
        && !(options as any)?.authenticationMode?.dangerouslyAllowBrowserApiKey
      ) {
        throw new Error("GGT_BROWSER_API_KEY_USAGE: Using a Gadget API key to authenticate this client object is insecure and will leak your API keys to attackers. Please use a different authentication mode.")
      }







      this.user = new UserManager(this.connection);
      this.game = new GameManager(this.connection);
      this.session = new SessionManager(this.connection);
      this.currentSession = new CurrentSessionManager(this.connection);

      this.internal = {
                        user: new InternalModelManager("user", this.connection, {"pluralApiIdentifier":"users","hasAmbiguousIdentifiers":false,"namespace":[]}),
                        game: new InternalModelManager("game", this.connection, {"pluralApiIdentifier":"games","hasAmbiguousIdentifiers":false,"namespace":[]}),
                        session: new InternalModelManager("session", this.connection, {"pluralApiIdentifier":"sessions","hasAmbiguousIdentifiers":false,"namespace":[]}),
                      };
    }

    /**
     * Returns a new Client instance that will call the Gadget API as the application's admin user.
     * This can only be used for API clients using internal authentication.
     * @returns {SkoopiarClient} A new SkoopiarClient instance with admin authentication
     */
    get actAsAdmin(): SkoopiarClient {
      assert(this.options?.authenticationMode?.internal, `actAsAdmin can only be used for API clients using internal authentication, this client is using ${JSON.stringify(this.options?.authenticationMode)}`)

      return new SkoopiarClient({
      ...this.options,
      authenticationMode: {
        internal: {
          ...this.options!.authenticationMode!.internal!,
          actAsSession: false,
        }
      }
      });
    }

    /**
     * Returns a new SkoopiarClient instance that will call the Gadget API as with the permission of the current session.
     * This can only be used for API clients using internal authentication.
     * @returns {SkoopiarClient} A new SkoopiarClient instance with session authentication
     */
    get actAsSession(): SkoopiarClient {
      assert(this.options?.authenticationMode?.internal, "actAsSession can only be used for API clients using internal authentication")

      return new SkoopiarClient({
        ...this.options,
        authenticationMode: {
          internal: {
            ...this.options!.authenticationMode!.internal!,
            actAsSession: true,
          }
        }
      })
    }

    /** Run an arbitrary GraphQL query. */
    async query<T = any>(graphQL: string | DocumentNode, variables?: Record<string, any>, options?: Partial<OperationContext>): Promise<T> {
      const {data, error} = await this.connection.currentClient.query(graphQL, variables, options).toPromise();
      if (error) throw error
      return data as T;
    }

    /** Run an arbitrary GraphQL mutation. */
    async mutate<T = any>(graphQL: string | DocumentNode, variables?: Record<string, any>, options?: Partial<OperationContext>): Promise<T> {
      const {data, error} = await this.connection.currentClient.mutation(graphQL, variables, options).toPromise();
      if (error) throw error
      return data as T;
    }

    /** Start a transaction against the Gadget backend which will atomically commit (or rollback). */
    transaction = async <T>(callback: (transaction: GadgetTransaction) => Promise<T>): Promise<T> => {
      return await this.connection.transaction(callback)
    }

    /**
     * `fetch` function that works the same as the built-in `fetch` function, but automatically passes authentication information for this API client.
     *
     * @example
     * await api.fetch("https://myapp--development.gadget.app/foo/bar");
     *
     * @example
     * // fetch a relative URL from the endpoint this API client is configured to fetch from
     * await api.fetch("/foo/bar");
     **/
    async fetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
      return await this.connection.fetch(input, init);
    }

    /**
    * Get a new direct upload token for file uploads to directly to cloud storage.
    * See https://docs.gadget.dev/guides/storing-files#direct-uploads-using-tokens for more information
    * @return { url: string, token: string } A `url` to upload one file to, and a token for that file to pass back to Gadget as an action input.
    */
    getDirectUploadToken = async (): Promise<{url: string, token: string}> => {
      const result = await this.query("query GetDirectUploadToken($nonce: String) { gadgetMeta { directUploadToken(nonce: $nonce) { url, token } } }", {nonce: Math.random().toString(36).slice(2, 7)}, {
        requestPolicy: "network-only",
      });
      return (result as any).gadgetMeta.directUploadToken;
    }

    /**
     * Enqueue one action for execution in the backend. The backend will run the action as soon as possible, and return a handle to the action right away that can be used to check its status.
     *
     * @param action The action to enqueue
     * @param input The input variables for the action, in object form. Optional for actions that have only optional params, but required for actions with required params.
     * @param options Background execution options for the action
     *
     * @example
     * const handle = await api.enqueue(api.widget.update, { id: "123", name: "new name" });
     *
     * @example
     * const handle = await api.enqueue(api.widget.create, { input: "value" }, { retries: 3, priority: "HIGH" });
     *
     * @example
     * const handle = await api.enqueue(api.widget.delete, { id: "123" });
     *
     * @example
     * const handle = await api.enqueue(api.someGlobalAction, { retries: 3, priority: "LOW" });
     *
     * @example
     * const handle = await api.enqueue(api.someGlobalAction, { input: "value" });
     *
     * @example
     * const handle = await api.enqueue(api.widget.bulkCreate, [{ name: "new name b" }, { name: "new name b" }]);
     **/
    async enqueue<SchemaT, Action extends AnyActionFunction & AllOptionalVariables<Action['variablesType']>>(action: Action, input?: Action["variablesType"], options?: EnqueueBackgroundActionOptions<Action>): Promise<BackgroundActionHandle<SchemaT, Action>>;
    /**
     * Enqueue one action for execution in the backend. The backend will run the action as soon as possible, and return a handle to the action right away that can be used to check its status.
     *
     * @param action The action to enqueue
     * @param input The id for the record to run the action on. This is only one overload of this function, see the other forms for other input types.
     * @param options Background execution options for the action
     *
     * @example
     * const handle = await api.enqueue(api.widget.update, { id: "123", name: "new name" });
     *
     * @example
     * const handle = await api.enqueue(api.widget.create, { input: "value" }, { retries: 3, priority: "HIGH" });
     *
     * @example
     * const handle = await api.enqueue(api.widget.delete, { id: "123" });
     *
     * @example
     * const handle = await api.enqueue(api.widget.delete, "123");
     *
     * @example
     * const handle = await api.enqueue(api.someGlobalAction, { retries: 3, priority: "LOW" });
     *
     * @example
     * const handle = await api.enqueue(api.someGlobalAction, { input: "value" });
     *
     * @example
     * const handle = await api.enqueue(api.widget.bulkCreate, [{ name: "new name b" }, { name: "new name b" }]);
     **/
    async enqueue<SchemaT, Action extends AnyActionFunction & {variablesType: {id: string}}>(action: Action, id: string, options?: EnqueueBackgroundActionOptions<Action>): Promise<BackgroundActionHandle<SchemaT, Action>>;
    /**
     * Enqueue one action for execution in the backend. The backend will run the action as soon as possible, and return a handle to the action right away that can be used to check its status. This is the variant of enqueue for actions which accept no inputs.
     *
     * @param action The action to enqueue.
     * @param options Background execution options for the action
     *
     * @example
     * const handle = await api.enqueue(api.widget.update, { id: "123", name: "new name" });
     *
     * @example
     * const handle = await api.enqueue(api.widget.create, { input: "value" });
     *
     * @example
     * const handle = await api.enqueue(api.widget.delete, { id: "123" });
     *
     * @example
     * const handle = await api.enqueue(api.someGlobalAction);
     *
     * @example
     * const handle = await api.enqueue(api.someGlobalAction, { input: "value" });
     *
     * @example
     * const handle = await api.enqueue(api.widget.bulkCreate, [{ name: "new name b" }, { name: "new name b" }]);
     **/
    async enqueue<SchemaT, Action extends ActionFunctionMetadata<any, Record<string, never>, any, any, any, any> | GlobalActionFunction<Record<string, never>>>(action: Action, options?: EnqueueBackgroundActionOptions<Action>): Promise<BackgroundActionHandle<SchemaT, Action>>;
    /**
     * Enqueue a set of actions in bulk for execution. The backend will run each action as soon as possible, and return an array of handles to each action right away that can be used to check their statuses.
     *
     * @param bulkAction The bulk action to enqueue
     * @param input The input variables for the action, in array or object form.
     * @param options Background execution options for the action
     *
     * @example
     * const handle = await api.enqueue(api.widget.bulkCreate, [{ name: "foo" }, {name: "bar"}], { retries: 3, priority: "HIGH" });
     *
     * @example
     * const handle = await api.enqueue(api.widget.bulkDelete, [2, 42]);
     *
     * @example
     * const handle = await api.enqueue(api.widget.addInventory, [{id: 1, amount: 10}, {id: 2, amount: 15}]);
     *
    **/
    async enqueue<SchemaT, Action extends ActionFunctionMetadata<any, any, any, any, any, true>>(action: Action, input: Action["variablesType"], options?: EnqueueBackgroundActionOptions<Action>): Promise<BackgroundActionHandle<SchemaT, Action>[]>;
    /**
     * Enqueue one action for execution in the backend. The backend will run the action as soon as possible, and return a handle to the action right away that can be used to check its status.
     *
     * @param action The action to enqueue
     * @param input The input variables for the action, in object form. Optional for actions that have only optional params, but required for actions with required params.
     * @param options Background execution options for the action
     *
     * @example
     * const handle = await api.enqueue(api.widget.update, { id: "123", name: "new name" });
     *
     * @example
     * const handle = await api.enqueue(api.widget.create, { input: "value" });
     *
     * @example
     * const handle = await api.enqueue(api.widget.delete, { id: "123" });
     *
     * @example
     * const handle = await api.enqueue(api.someGlobalAction);
     *
     * @example
     * const handle = await api.enqueue(api.someGlobalAction, { input: "value" });
     **/
    async enqueue<SchemaT, Action extends AnyActionFunction>(action: Action, input: Action["variablesType"], options?: EnqueueBackgroundActionOptions<Action>): Promise<BackgroundActionHandle<SchemaT, Action>>;
    async enqueue<SchemaT, Action extends AnyActionFunction>(action: Action, inputOrOptions?: Action["variablesType"] | EnqueueBackgroundActionOptions<Action>, maybeOptions?: EnqueueBackgroundActionOptions<Action>): Promise<BackgroundActionHandle<SchemaT, Action> | BackgroundActionHandle<SchemaT, Action>[]> {
      assert(action, ".enqueue must be passed an action as the first argument but was passed undefined");
    
      let input: Action["variablesType"] | undefined;
      let options: EnqueueBackgroundActionOptions<Action> | undefined;
    
      // process different overloads to pull out the input and or options
      if (typeof maybeOptions !== "undefined") {
        if (typeof inputOrOptions == "string") {
          // id input shorthand passes just the id as a string, wrap it into a variables object
          input = { id: inputOrOptions };
        } else {
          input = inputOrOptions;
        }
        options = maybeOptions;
      } else if (!action.variables || Object.keys(action.variables).length == 0) {
        input = {};
        options = inputOrOptions;
      } else {
        if (typeof inputOrOptions == "string") {
          // id input shorthand passes just the id as a string, wrap it into a variables object
          input = { id: inputOrOptions };
        } else {
          input = inputOrOptions;
        }
        options = {};
      }
    
      return await enqueueActionRunner(this.connection, action, input, options);
    }
    
    /**
     * Returns a handle for a given background action id
     *
     * @param action The action that was enqueued
     * @param id The id of the background action
     *
     * @example
     * const handle = api.handle(api.widget.update, "app-job-12346");
     *
     * @example
     * const handle = api.handle(api.someGlobalAction, "app-job-56789");
     **/
    handle<SchemaT, Action extends AnyActionFunction>(action: Action, id: string): BackgroundActionHandle<SchemaT, Action> {
      return new BackgroundActionHandle(this.connection, action, id);
    }

    toString(): string {
      return `SkoopiarClient<${this.environment}>`;
    }

    toJSON(): string {
      return this.toString()
    }
  }

  (SkoopiarClient.prototype as any)[$modelRelationships] = {"user":{},"game":{},"session":{"user":{"type":"BelongsTo","model":"user"}}};
  const coreImplementation: AnyCoreImplementation = {
    GadgetRecord,
    disambiguateActionVariables,
    disambiguateBulkActionVariables,
    capitalizeIdentifier,
    wrapClientSideError: ErrorWrapper.forClientSideError,
    errorIfDataAbsent: ErrorWrapper.errorIfDataAbsent,
    namespaceDataPath,
    camelize,
    isEqual,
  };
  (SkoopiarClient.prototype as any)[$coreImplementation] = coreImplementation;
  /** Legacy export under the `Client` name for backwards compatibility. */
  export const Client: typeof SkoopiarClient = SkoopiarClient;
  export type Client = InstanceType<typeof SkoopiarClient>;