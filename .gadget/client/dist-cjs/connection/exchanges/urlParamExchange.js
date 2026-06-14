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
var urlParamExchange_exports = {};
__export(urlParamExchange_exports, {
  addUrlParams: () => addUrlParams,
  urlParamExchange: () => urlParamExchange
});
module.exports = __toCommonJS(urlParamExchange_exports);
var import_core = require("@urql/core");
const addUrlParams = (url, paramsToAdd) => {
  const [start, params] = url.split("?");
  const paramsObj = new URLSearchParams(params);
  for (const [key, value] of Object.entries(paramsToAdd)) {
    paramsObj.set(key, value);
  }
  return `${start}?${paramsObj.toString()}`;
};
const urlParamExchange = (0, import_core.mapExchange)({
  onOperation: (operation) => {
    if (operation.context.url && operation.context.operationName) {
      try {
        operation.context.url = addUrlParams(operation.context.url, { kind: operation.kind, operation: operation.context.operationName });
      } catch (error) {
      }
    }
  }
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  addUrlParams,
  urlParamExchange
});
//# sourceMappingURL=urlParamExchange.js.map
