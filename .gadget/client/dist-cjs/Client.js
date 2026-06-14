"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var Client_exports = {};
__export(Client_exports, {
  Client: () => Client,
  DefaultGameSelection: () => import_Game2.DefaultGameSelection,
  DefaultSessionSelection: () => import_Session2.DefaultSessionSelection,
  DefaultUserSelection: () => import_User2.DefaultUserSelection,
  SkoopiarClient: () => SkoopiarClient,
  maybeGetAuthenticationModeOptionsFromClientOptions: () => maybeGetAuthenticationModeOptionsFromClientOptions
});
module.exports = __toCommonJS(Client_exports);
var import_core = require("@gadgetinc/core");
var import_wonka = require("wonka");
var import_GadgetConnection = require("./connection/GadgetConnection.js");
var import_InternalModelManager = require("./connection/InternalModelManager.js");
var import_ClientOptions = require("./connection/ClientOptions.js");
var import_support = require("./connection/support.js");
var import_ErrorWrapper = require("./connection/ErrorWrapper.js");
var import_GadgetRecord = require("./connection/GadgetRecord.js");
var import_operationRunners = require("./connection/operationRunners.js");
var import_BackgroundActionHandle = require("./connection/BackgroundActionHandle.js");
var import_builder = require("./builder.js");
var import_User = require("./models/User.js");
var import_Game = require("./models/Game.js");
var import_Session = require("./models/Session.js");
var import_CurrentSession = require("./models/CurrentSession.js");
var import_User2 = require("./models/User.js");
var import_Game2 = require("./models/Game.js");
var import_Session2 = require("./models/Session.js");
const import_meta = {};
;
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
    throw new import_support.GadgetClientError(
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
    this.inspectDiscordCommands = (0, import_builder.buildGlobalAction)(this, {
      type: "globalAction",
      functionName: "inspectDiscordCommands",
      operationName: "inspectDiscordCommands",
      operationReturnType: "InspectDiscordCommands",
      namespace: null,
      variables: {}
    });
    /** Executes the registerCommands global action. */
    this.registerCommands = (0, import_builder.buildGlobalAction)(this, {
      type: "globalAction",
      functionName: "registerCommands",
      operationName: "registerCommands",
      operationReturnType: "RegisterCommands",
      namespace: null,
      variables: {}
    });
    /** Executes the removeCommands global action. */
    this.removeCommands = (0, import_builder.buildGlobalAction)(this, {
      type: "globalAction",
      functionName: "removeCommands",
      operationName: "removeCommands",
      operationReturnType: "RemoveCommands",
      namespace: null,
      variables: {}
    });
    /** Executes an inline computed view. */
    this.view = (0, import_builder.buildInlineComputedView)(this, {
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
    var _a, _b;
    let inSSRContext = false;
    this.options = options;
    try {
      inSSRContext = !!(import_meta.env && import_meta.env.SSR);
    } catch (error) {
    }
    if (inSSRContext) {
      const api = (_a = globalThis.GadgetGlobals) == null ? void 0 : _a.api;
      if (api) {
        return api.actAsSession;
      }
    }
    this.environment = ((options == null ? void 0 : options.environment) ?? getImplicitEnv() ?? fallbackEnv).toLocaleLowerCase();
    let apiRoot;
    if (this.apiRoots[this.environment]) {
      apiRoot = this.apiRoots[this.environment];
    } else {
      const envPart = this.environment == productionEnv ? "" : `--${this.environment}`;
      apiRoot = `https://skoopiar${envPart}.gadget.app`;
    }
    const exchanges = { ...options == null ? void 0 : options.exchanges };
    if (this.environment !== productionEnv) {
      const devHarnessExchange = ({ forward }) => {
        return (operations$) => {
          const operationResult$ = forward(operations$);
          return (0, import_wonka.pipe)(
            operationResult$,
            (0, import_wonka.map)((result) => {
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
      authenticationMode: options == null ? void 0 : options.authenticationMode,
      ...options,
      exchanges,
      environment: this.environment
    };
    const authenticationMode = maybeGetAuthenticationModeOptionsFromClientOptions(options ?? {});
    connectionOptions.authenticationMode = authenticationMode ?? (typeof window == "undefined" ? { anonymous: true } : { browserSession: true });
    this.connection = new import_GadgetConnection.GadgetConnection(connectionOptions);
    if (typeof window != "undefined" && typeof window.document != "undefined" && this.connection.authenticationMode == import_ClientOptions.AuthenticationMode.APIKey && !((_b = options == null ? void 0 : options.authenticationMode) == null ? void 0 : _b.dangerouslyAllowBrowserApiKey)) {
      throw new Error("GGT_BROWSER_API_KEY_USAGE: Using a Gadget API key to authenticate this client object is insecure and will leak your API keys to attackers. Please use a different authentication mode.");
    }
    this.user = new import_User.UserManager(this.connection);
    this.game = new import_Game.GameManager(this.connection);
    this.session = new import_Session.SessionManager(this.connection);
    this.currentSession = new import_CurrentSession.CurrentSessionManager(this.connection);
    this.internal = {
      user: new import_InternalModelManager.InternalModelManager("user", this.connection, { "pluralApiIdentifier": "users", "hasAmbiguousIdentifiers": false, "namespace": [] }),
      game: new import_InternalModelManager.InternalModelManager("game", this.connection, { "pluralApiIdentifier": "games", "hasAmbiguousIdentifiers": false, "namespace": [] }),
      session: new import_InternalModelManager.InternalModelManager("session", this.connection, { "pluralApiIdentifier": "sessions", "hasAmbiguousIdentifiers": false, "namespace": [] })
    };
  }
  /**
   * Returns a new Client instance that will call the Gadget API as the application's admin user.
   * This can only be used for API clients using internal authentication.
   * @returns {SkoopiarClient} A new SkoopiarClient instance with admin authentication
   */
  get actAsAdmin() {
    var _a, _b, _c;
    (0, import_support.assert)((_b = (_a = this.options) == null ? void 0 : _a.authenticationMode) == null ? void 0 : _b.internal, `actAsAdmin can only be used for API clients using internal authentication, this client is using ${JSON.stringify((_c = this.options) == null ? void 0 : _c.authenticationMode)}`);
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
    var _a, _b;
    (0, import_support.assert)((_b = (_a = this.options) == null ? void 0 : _a.authenticationMode) == null ? void 0 : _b.internal, "actAsSession can only be used for API clients using internal authentication");
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
    (0, import_support.assert)(action, ".enqueue must be passed an action as the first argument but was passed undefined");
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
    return await (0, import_operationRunners.enqueueActionRunner)(this.connection, action, input, options);
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
    return new import_BackgroundActionHandle.BackgroundActionHandle(this.connection, action, id);
  }
  toString() {
    return `SkoopiarClient<${this.environment}>`;
  }
  toJSON() {
    return this.toString();
  }
}
SkoopiarClient.prototype[import_core.$modelRelationships] = { "user": {}, "game": {}, "session": { "user": { "type": "BelongsTo", "model": "user" } } };
const coreImplementation = {
  GadgetRecord: import_GadgetRecord.GadgetRecord,
  disambiguateActionVariables: import_support.disambiguateActionVariables,
  disambiguateBulkActionVariables: import_support.disambiguateBulkActionVariables,
  capitalizeIdentifier: import_support.capitalizeIdentifier,
  wrapClientSideError: import_ErrorWrapper.ErrorWrapper.forClientSideError,
  errorIfDataAbsent: import_ErrorWrapper.ErrorWrapper.errorIfDataAbsent,
  namespaceDataPath: import_support.namespaceDataPath,
  camelize: import_support.camelize,
  isEqual: import_support.isEqual
};
SkoopiarClient.prototype[import_core.$coreImplementation] = coreImplementation;
const Client = SkoopiarClient;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Client,
  DefaultGameSelection,
  DefaultSessionSelection,
  DefaultUserSelection,
  SkoopiarClient,
  maybeGetAuthenticationModeOptionsFromClientOptions
});
//# sourceMappingURL=Client.js.map
