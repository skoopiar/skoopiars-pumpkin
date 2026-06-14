import { SkoopiarClient } from ".";
window.SkoopiarClient = SkoopiarClient;
const previousValue = window.Gadget;
window.Gadget = SkoopiarClient;
window.Gadget.previousValue = previousValue;
//# sourceMappingURL=iife-export.js.map
