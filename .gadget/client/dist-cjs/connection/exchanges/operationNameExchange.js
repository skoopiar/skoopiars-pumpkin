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
var operationNameExchange_exports = {};
__export(operationNameExchange_exports, {
  operationNameExchange: () => operationNameExchange
});
module.exports = __toCommonJS(operationNameExchange_exports);
var import_core = require("@urql/core");
var import_graphql = require("graphql");
const graphqlDocumentName = (doc) => {
  const lastDefinition = [...doc.definitions].reverse().find((definition) => definition.kind == import_graphql.Kind.OPERATION_DEFINITION);
  if (lastDefinition) {
    if (lastDefinition.name) {
      return lastDefinition.name.value;
    }
    const firstSelection = lastDefinition.selectionSet.selections.find((node) => node.kind == import_graphql.Kind.FIELD);
    return firstSelection.name.value;
  }
};
const operationNameExchange = (0, import_core.mapExchange)({
  onOperation: (operation) => {
    var _a;
    (_a = operation.context).operationName ?? (_a.operationName = graphqlDocumentName(operation.query) || "unknown");
  }
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  operationNameExchange
});
//# sourceMappingURL=operationNameExchange.js.map
