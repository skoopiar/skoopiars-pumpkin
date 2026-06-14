import { $modelRelationships, $coreImplementation } from "@gadgetinc/core";
import { pipe, map } from "wonka";
import { GadgetConnection } from "./connection/GadgetConnection.js";
import { InternalModelManager } from "./connection/InternalModelManager.js";
import { AuthenticationMode } from "./connection/ClientOptions.js";
import { assert, GadgetClientError, disambiguateActionVariables, disambiguateBulkActionVariables, capitalizeIdentifier, namespaceDataPath, camelize, isEqual } from "./connection/support.js";
import { ErrorWrapper } from "./connection/ErrorWrapper.js";
import { GadgetRecord } from "./connection/GadgetRecord.js";
import { enqueueActionRunner } from "./connection/operationRunners.js";
import { BackgroundActionHandle } from "./connection/BackgroundActionHandle.js";
;
import { buildGlobalAction, buildInlineComputedView } from "./builder.js";
import { UserManager } from "./models/User.js";
import { GameManager } from "./models/Game.js";
import { SessionManager } from "./models/Session.js";
import { CurrentSessionManager } from "./models/CurrentSession.js";
import { DefaultUserSelection as DefaultUserSelection2 } from "./models/User.js";
import { DefaultGameSelection as DefaultGameSelection2 } from "./models/Game.js";
import { DefaultSessionSelection as DefaultSessionSelection2 } from "./models/Session.js";
const productionEnv = "production";
const fallbackEnv = "development";
const availableAuthenticationModes = [
  "apiKey",
  "browserSession",
  "anonymous",
  "internalAuthToken",
  "internal",
  "custom"
];
const maybeGetAuthenticationModeOptionsFromClientOptions = (options) => {
  const topLevelAuthModes = {};
  for (const key of availableAuthenticationModes) {
    if (key in options) {
      topLevelAuthModes[key] = options[key];
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
    return void 0;
  }
  return topLevelAuthModes;
};
const getImplicitEnv = () => {
  try {
    return process.env.GADGET_ENV;
  } catch (error) {
    return void 0;
  }
};
class SkoopiarClient {
  constructor(options) {
    this.$args = Symbol.for("gadget/fieldArgs");
    /** Executes the inspectDiscordCommands global action. */
    this.inspectDiscordCommands = buildGlobalAction(this, {
      type: "globalAction",
      functionName: "inspectDiscordCommands",
      operationName: "inspectDiscordCommands",
      operationReturnType: "InspectDiscordCommands",
      namespace: null,
      variables: {}
    });
    /** Executes the registerCommands global action. */
    this.registerCommands = buildGlobalAction(this, {
      type: "globalAction",
      functionName: "registerCommands",
      operationName: "registerCommands",
      operationReturnType: "RegisterCommands",
      namespace: null,
      variables: {}
    });
    /** Executes the removeCommands global action. */
    this.removeCommands = buildGlobalAction(this, {
      type: "globalAction",
      functionName: "removeCommands",
      operationName: "removeCommands",
      operationReturnType: "RemoveCommands",
      namespace: null,
      variables: {}
    });
    /** Executes an inline computed view. */
    this.view = buildInlineComputedView(this, {
      type: "computedView",
      operationName: "gellyView",
      functionName: "view",
      gqlFieldName: "gellyView",
      namespace: null,
      variables: {
        query: { type: "String", required: true },
        args: { type: "JSONObject" }
      }
    });
    /**
     * The list of environments with a customized API root endpoint
     */
    this.apiRoots = { "development": "https://skoopiar--development.gadget.app/", "production": "https://skoopiar.gadget.app/" };
    this.applicationId = "334033";
    /** Start a transaction against the Gadget backend which will atomically commit (or rollback). */
    this.transaction = async (callback) => {
      return await this.connection.transaction(callback);
    };
    /**
    * Get a new direct upload token for file uploads to directly to cloud storage.
    * See https://docs.gadget.dev/guides/storing-files#direct-uploads-using-tokens for more information
    * @return { url: string, token: string } A `url` to upload one file to, and a token for that file to pass back to Gadget as an action input.
    */
    this.getDirectUploadToken = async () => {
      const result = await this.query("query GetDirectUploadToken($nonce: String) { gadgetMeta { directUploadToken(nonce: $nonce) { url, token } } }", { nonce: Math.random().toString(36).slice(2, 7) }, {
        requestPolicy: "network-only"
      });
      return result.gadgetMeta.directUploadToken;
    };
    let inSSRContext = false;
    this.options = options;
    try {
      inSSRContext = !!(import.meta.env && import.meta.env.SSR);
    } catch (error) {
    }
    if (inSSRContext) {
      const api = globalThis.GadgetGlobals?.api;
      if (api) {
        return api.actAsSession;
      }
    }
    this.environment = (options?.environment ?? getImplicitEnv() ?? fallbackEnv).toLocaleLowerCase();
    let apiRoot;
    if (this.apiRoots[this.environment]) {
      apiRoot = this.apiRoots[this.environment];
    } else {
      const envPart = this.environment == productionEnv ? "" : `--${this.environment}`;
      apiRoot = `https://skoopiar${envPart}.gadget.app`;
    }
    const exchanges = { ...options?.exchanges };
    if (this.environment !== productionEnv) {
      const devHarnessExchange = ({ forward }) => {
        return (operations$) => {
          const operationResult$ = forward(operations$);
          return pipe(
            operationResult$,
            map((result) => {
              try {
                if (typeof window !== "undefined" && typeof CustomEvent === "function") {
                  const event = new CustomEvent("gadget:devharness:graphqlresult", { detail: result });
                  window.dispatchEvent(event);
                }
              } catch (error) {
                console.warn("[gadget] error dispatching gadget dev harness event", error);
              }
              return result;
            })
          );
        };
      };
      exchanges.beforeAll = [
        devHarnessExchange,
        ...exchanges.beforeAll ?? []
      ];
    }
    const connectionOptions = {
      endpoint: new URL("api/graphql", apiRoot).toString(),
      applicationId: this.applicationId,
      authenticationMode: options?.authenticationMode,
      ...options,
      exchanges,
      environment: this.environment
    };
    const authenticationMode = maybeGetAuthenticationModeOptionsFromClientOptions(options ?? {});
    connectionOptions.authenticationMode = authenticationMode ?? (typeof window == "undefined" ? { anonymous: true } : { browserSession: true });
    this.connection = new GadgetConnection(connectionOptions);
    if (typeof window != "undefined" && typeof window.document != "undefined" && this.connection.authenticationMode == AuthenticationMode.APIKey && !options?.authenticationMode?.dangerouslyAllowBrowserApiKey) {
      throw new Error("GGT_BROWSER_API_KEY_USAGE: Using a Gadget API key to authenticate this client object is insecure and will leak your API keys to attackers. Please use a different authentication mode.");
    }
    this.user = new UserManager(this.connection);
    this.game = new GameManager(this.connection);
    this.session = new SessionManager(this.connection);
    this.currentSession = new CurrentSessionManager(this.connection);
    this.internal = {
      user: new InternalModelManager("user", this.connection, { "pluralApiIdentifier": "users", "hasAmbiguousIdentifiers": false, "namespace": [] }),
      game: new InternalModelManager("game", this.connection, { "pluralApiIdentifier": "games", "hasAmbiguousIdentifiers": false, "namespace": [] }),
      session: new InternalModelManager("session", this.connection, { "pluralApiIdentifier": "sessions", "hasAmbiguousIdentifiers": false, "namespace": [] })
    };
  }
  /**
   * Returns a new Client instance that will call the Gadget API as the application's admin user.
   * This can only be used for API clients using internal authentication.
   * @returns {SkoopiarClient} A new SkoopiarClient instance with admin authentication
   */
  get actAsAdmin() {
    assert(this.options?.authenticationMode?.internal, `actAsAdmin can only be used for API clients using internal authentication, this client is using ${JSON.stringify(this.options?.authenticationMode)}`);
    return new SkoopiarClient({
      ...this.options,
      authenticationMode: {
        internal: {
          ...this.options.authenticationMode.internal,
          actAsSession: false
        }
      }
    });
  }
  /**
   * Returns a new SkoopiarClient instance that will call the Gadget API as with the permission of the current session.
   * This can only be used for API clients using internal authentication.
   * @returns {SkoopiarClient} A new SkoopiarClient instance with session authentication
   */
  get actAsSession() {
    assert(this.options?.authenticationMode?.internal, "actAsSession can only be used for API clients using internal authentication");
    return new SkoopiarClient({
      ...this.options,
      authenticationMode: {
        internal: {
          ...this.options.authenticationMode.internal,
          actAsSession: true
        }
      }
    });
  }
  /** Run an arbitrary GraphQL query. */
  async query(graphQL, variables, options) {
    const { data, error } = await this.connection.currentClient.query(graphQL, variables, options).toPromise();
    if (error)
      throw error;
    return data;
  }
  /** Run an arbitrary GraphQL mutation. */
  async mutate(graphQL, variables, options) {
    const { data, error } = await this.connection.currentClient.mutation(graphQL, variables, options).toPromise();
    if (error)
      throw error;
    return data;
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
  async fetch(input, init = {}) {
    return await this.connection.fetch(input, init);
  }
  async enqueue(action, inputOrOptions, maybeOptions) {
    assert(action, ".enqueue must be passed an action as the first argument but was passed undefined");
    let input;
    let options;
    if (typeof maybeOptions !== "undefined") {
      if (typeof inputOrOptions == "string") {
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
  handle(action, id) {
    return new BackgroundActionHandle(this.connection, action, id);
  }
  toString() {
    return `SkoopiarClient<${this.environment}>`;
  }
  toJSON() {
    return this.toString();
  }
}
SkoopiarClient.prototype[$modelRelationships] = { "user": {}, "game": {}, "session": { "user": { "type": "BelongsTo", "model": "user" } } };
const coreImplementation = {
  GadgetRecord,
  disambiguateActionVariables,
  disambiguateBulkActionVariables,
  capitalizeIdentifier,
  wrapClientSideError: ErrorWrapper.forClientSideError,
  errorIfDataAbsent: ErrorWrapper.errorIfDataAbsent,
  namespaceDataPath,
  camelize,
  isEqual
};
SkoopiarClient.prototype[$coreImplementation] = coreImplementation;
const Client = SkoopiarClient;
export {
  Client,
  DefaultGameSelection2 as DefaultGameSelection,
  DefaultSessionSelection2 as DefaultSessionSelection,
  DefaultUserSelection2 as DefaultUserSelection,
  SkoopiarClient,
  maybeGetAuthenticationModeOptionsFromClientOptions
};
//# sourceMappingURL=Client.js.map
