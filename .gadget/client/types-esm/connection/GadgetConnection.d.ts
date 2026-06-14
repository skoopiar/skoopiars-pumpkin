import type { AnyActionFunction, AnyBulkActionFunction, AnyConnection, FunctionResult, TransactionRun } from "@gadgetinc/core";
import { Client } from "@urql/core";
import type { Client as SubscriptionClient } from "graphql-ws";
import { createClient as createSubscriptionClient } from "graphql-ws";
import { BackgroundActionHandle } from "./BackgroundActionHandle.js";
import { AuthenticationMode, AuthenticationModeOptions, BrowserSessionAuthenticationModeOptions, GadgetConnectionOptions, GadgetSubscriptionClientOptions } from "./ClientOptions.js";
import { ErrorWrapper } from "./ErrorWrapper.js";
import { GadgetTransaction } from "./GadgetTransaction.js";
export declare enum GadgetGraphQLCloseCode {
    TooManyRequests = 4294
}
export declare const $transaction: symbol;
export declare const $gadgetConnection: symbol;
/**
 * Root level database connection that Actions can use to mutate data in a Gadget database.
 * Manages transactions and the connection to a Gadget API
 */ export declare class GadgetConnection implements AnyConnection<GadgetConnectionOptions> {
    readonly options: GadgetConnectionOptions;
    static version: "vendored";
    // Options used when generating new GraphQL clients for the base connection and for for transactions
    readonly endpoint: string;
    private subscriptionClientOptions?;
    private websocketsEndpoint;
    private websocketImplementation?;
    private _fetchImplementation;
    private environment;
    private exchanges;
    readonly enqueue: AnyConnection["enqueue"];
    // the base client using HTTP requests that non-transactional operations will use
    private baseClient;
    /** @private (but accessible for testing purposes) */ baseSubscriptionClient?: SubscriptionClient;
    // the transactional websocket client that will be used inside a transaction block
    private currentTransaction;
    // How this client will authenticate (if at all) against the Gadget backed
    authenticationMode: AuthenticationMode;
    private sessionTokenStore?;
    private requestPolicy;
    createSubscriptionClient: typeof createSubscriptionClient;
    constructor(options: GadgetConnectionOptions);
    private get sessionStorageKey();
    get currentClient(): Client;
    set fetchImplementation(implementation: typeof globalThis.fetch);
    /**
   * Change the authentication mode settings for this connection imperatively.
   * @private This function is generally not required for use by external developers, but is useful for those building integrations against the Gadget API to configure passed in `api` objects.
   */ setAuthenticationMode(options?: AuthenticationModeOptions): void;
    enableSessionMode(options?: true | BrowserSessionAuthenticationModeOptions): void;
    transaction: {
        <R>(options: GadgetSubscriptionClientOptions, run: TransactionRun<R, GadgetTransaction>) : Promise<R>;
        <R>(run: TransactionRun<R, GadgetTransaction>) : Promise<R>;
    };
    close(): void;
    /**
   * `fetch` function that works the same as the built-in `fetch` function, but automatically passes authentication information for this API client.
   *
   * @example
   * await api.connection.fetch("https://myapp--development.gadget.app/foo/bar");
   *
   * @example
   * // fetch a relative URL from the endpoint this API client is configured to fetch from
   * await api.connection.fetch("/foo/bar");
   **/ fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
    private isGadgetRequest;
    private resetClients;
    private newBaseClient;
    newSubscriptionClient(overrides?: GadgetSubscriptionClientOptions): SubscriptionClient;
    private requestHeaders;
    private waitForOpenedConnection;
    private disposeClient;
    private getBaseSubscriptionClient;
}
