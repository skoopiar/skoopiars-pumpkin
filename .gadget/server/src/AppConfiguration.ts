/**
* A map from configuration value name to value all the configuration values and secrets in skoopiar.
* __Note__: Any encrypted configuration values are decrypted and ready for use in this map.
*/
export interface AppConfiguration {
  GADGET_ENV: string | undefined;
  GADGET_APP: string | undefined;
  GADGET_APP_URL: string | undefined;
  /**
  * The value for the PUBLIC_KEY environment variable set in the Gadget Environment Variables settings section. Decrypted from the encrypted value for use here.
  */
  PUBLIC_KEY: string | undefined;
  /**
  * The value for the APP_ID environment variable set in the Gadget Environment Variables settings section. Decrypted from the encrypted value for use here.
  */
  APP_ID: string | undefined;
  /**
  * The value for the NODE_ENV environment variable set in the Gadget Environment Variables settings section. 
  */
  NODE_ENV: string | undefined;
  /**
  * The value for the DISCORD_TOKEN environment variable set in the Gadget Environment Variables settings section. Decrypted from the encrypted value for use here.
  */
  DISCORD_TOKEN: string | undefined;
};


declare global {
  namespace NodeJS {
    interface ProcessEnv extends AppConfiguration {
    }
  }
}
