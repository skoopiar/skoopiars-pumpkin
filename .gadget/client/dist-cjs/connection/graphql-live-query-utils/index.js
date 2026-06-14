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
var graphql_live_query_utils_exports = {};
__export(graphql_live_query_utils_exports, {
  applyAsyncIterableIteratorToSink: () => import_push_pull_async_iterable_iterator.applyAsyncIterableIteratorToSink,
  applyJSONDiffPatch: () => applyJSONDiffPatch,
  applyLiveQueryJSONDiffPatch: () => applyLiveQueryJSONDiffPatch,
  makeAsyncIterableIteratorFromSink: () => import_push_pull_async_iterable_iterator.makeAsyncIterableIteratorFromSink
});
module.exports = __toCommonJS(graphql_live_query_utils_exports);
var import_json_patch_plus = require("@n1ru4l/json-patch-plus");
var import_createApplyLiveQueryPatch = require("./createApplyLiveQueryPatch.js");
var import_push_pull_async_iterable_iterator = require("@n1ru4l/push-pull-async-iterable-iterator");
const applyJSONDiffPatch = (left, delta) => (0, import_json_patch_plus.patch)({
  left,
  delta
});
const applyLiveQueryJSONDiffPatch = (0, import_createApplyLiveQueryPatch.createApplyLiveQueryPatch)(applyJSONDiffPatch);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  applyAsyncIterableIteratorToSink,
  applyJSONDiffPatch,
  applyLiveQueryJSONDiffPatch,
  makeAsyncIterableIteratorFromSink
});
//# sourceMappingURL=index.js.map
