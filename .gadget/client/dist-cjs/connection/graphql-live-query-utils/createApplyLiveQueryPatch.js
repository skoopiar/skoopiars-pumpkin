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
var createApplyLiveQueryPatch_exports = {};
__export(createApplyLiveQueryPatch_exports, {
  createApplyLiveQueryPatch: () => createApplyLiveQueryPatch
});
module.exports = __toCommonJS(createApplyLiveQueryPatch_exports);
var import_repeater = require("../repeater/index.js");
const createApplyLiveQueryPatch = (applyPatch) => (source) => new import_repeater.Repeater(async (push, stop) => {
  const iterator = source[Symbol.asyncIterator]();
  stop.then(() => {
    var _a;
    return (_a = iterator.return) == null ? void 0 : _a.call(iterator);
  }).catch(console.log);
  let mutableData = null;
  let lastRevision = 0;
  let next;
  while ((next = await iterator.next()).done === false) {
    if ("revision" in next.value && next.value.revision) {
      const valueToPublish = {};
      if (next.value.revision === 1) {
        if (next.value.data !== void 0) {
          valueToPublish.data = next.value.data;
          mutableData = next.value.data;
          lastRevision = 1;
        } else {
          throw new Error("Missing data.");
        }
      } else {
        if (!mutableData) {
          throw new Error("No previousData available.");
        }
        if (!next.value.patch) {
          throw new Error("Missing patch.");
        }
        if (lastRevision + 1 !== next.value.revision) {
          throw new Error("Wrong revision received.");
        }
        mutableData = applyPatch(mutableData, next.value.patch);
        valueToPublish.data = { ...mutableData };
        lastRevision++;
      }
      if (next.value.extensions) {
        valueToPublish.extensions = next.value.extensions;
      }
      if (next.value.errors) {
        valueToPublish.errors = next.value.errors;
      }
      await push(valueToPublish);
      continue;
    }
    await push(next.value);
  }
  stop();
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createApplyLiveQueryPatch
});
//# sourceMappingURL=createApplyLiveQueryPatch.js.map
