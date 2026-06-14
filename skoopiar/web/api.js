import { Client } from "@gadget-client/skoopiar";

export const api = new Client({ environment: window.gadgetConfig.environment });
