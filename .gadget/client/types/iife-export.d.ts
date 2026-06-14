import { SkoopiarClient } from ".";
declare global {
    interface Window {
        /**
     * The Gadget client constructor
     *
     * @example
     * ```ts
     * const api = new SkoopiarClient();
     * ```
     */ SkoopiarClient: typeof SkoopiarClient;
        /**
     * The Gadget client for SkoopiarClient
     * @deprecated Use window.SkoopiarClient instead
     */ Gadget: typeof SkoopiarClient;
    }
}
