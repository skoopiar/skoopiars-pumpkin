"use strict";
var import__ = require(".");
window.SkoopiarClient = import__.SkoopiarClient;
const previousValue = window.Gadget;
window.Gadget = import__.SkoopiarClient;
window.Gadget.previousValue = previousValue;
//# sourceMappingURL=iife-export.js.map
