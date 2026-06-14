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
     */
    SkoopiarClient: typeof SkoopiarClient;

    /**
     * The Gadget client for SkoopiarClient
     * @deprecated Use window.SkoopiarClient instead
     */
    Gadget: typeof SkoopiarClient;
  }
}

// add the client to the window
window.SkoopiarClient = SkoopiarClient;

const previousValue: any = window.Gadget;

// add the client to the window at the old .Gadget property for backwards compatibility -- the SkoopiarClient property should be preferred instead
window.Gadget = SkoopiarClient;
(window.Gadget as any).previousValue = previousValue;
