/**
* This is the Gadget API client library for:
*
*       _                     _            
*   ___| | _____   ___  _ __ (_) __ _ _ __ 
*  / __| |/ / _ \ / _ \| '_ \| |/ _` | '__|
*  \__ \   < (_) | (_) | |_) | | (_| | |   
*  |___/_|\_\___/ \___/| .__/|_|\__,_|_|   
*                      |_|                 
*
* Built for environment "Development" at version 581
* API docs: https://docs.gadget.dev/api/skoopiar
* Edit this app here: https://skoopiar.gadget.app/edit
*/
export type { Select, LimitToKnownKeys } from "@gadgetinc/core";
export { ChangeTracking } from "@gadgetinc/core";
export type { AuthenticationModeOptions, BrowserSessionAuthenticationModeOptions, ClientOptions } from "./connection/ClientOptions.js";
export { BrowserSessionStorageType } from "./connection/ClientOptions.js";
export { GadgetConnection } from "./connection/GadgetConnection.js";
export { GadgetRecord } from "./connection/GadgetRecord.js";
export { GadgetRecordList } from "./connection/GadgetRecordList.js";
export {
  GadgetClientError,
  GadgetInternalError,
  GadgetOperationError,
  GadgetValidationError,
  InvalidRecordError,
  formatErrorMessages,
} from "./connection/support.js";



export * from "./Client.js";
export * from "./types.js";

declare global {
  interface Window {
    gadgetConfig: {
      apiKeys: {
        shopify: string;
      };
      environment: string;
      env: Record<string, any>;
      authentication?: {
        signInPath: string;
        redirectOnSuccessfulSignInPath: string;
      };
      shopifyInstallState?: {
        redirectToOauth: boolean;
        isAuthenticated: boolean;
        missingScopes: string[];
        shopExists: boolean;
      };
      shopifyAppBridgeCDNScriptSrc?: string;
    };
  }
}
