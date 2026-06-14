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
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var src_exports = {};
__export(src_exports, {
  BrowserSessionStorageType: () => import_ClientOptions.BrowserSessionStorageType,
  ChangeTracking: () => import_core.ChangeTracking,
  GadgetClientError: () => import_support.GadgetClientError,
  GadgetConnection: () => import_GadgetConnection.GadgetConnection,
  GadgetInternalError: () => import_support.GadgetInternalError,
  GadgetOperationError: () => import_support.GadgetOperationError,
  GadgetRecord: () => import_GadgetRecord.GadgetRecord,
  GadgetRecordList: () => import_GadgetRecordList.GadgetRecordList,
  GadgetValidationError: () => import_support.GadgetValidationError,
  InvalidRecordError: () => import_support.InvalidRecordError,
  formatErrorMessages: () => import_support.formatErrorMessages
});
module.exports = __toCommonJS(src_exports);
var import_core = require("@gadgetinc/core");
var import_ClientOptions = require("./connection/ClientOptions.js");
var import_GadgetConnection = require("./connection/GadgetConnection.js");
var import_GadgetRecord = require("./connection/GadgetRecord.js");
var import_GadgetRecordList = require("./connection/GadgetRecordList.js");
var import_support = require("./connection/support.js");
__reExport(src_exports, require("./Client.js"), module.exports);
__reExport(src_exports, require("./types.js"), module.exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BrowserSessionStorageType,
  ChangeTracking,
  GadgetClientError,
  GadgetConnection,
  GadgetInternalError,
  GadgetOperationError,
  GadgetRecord,
  GadgetRecordList,
  GadgetValidationError,
  InvalidRecordError,
  formatErrorMessages,
  ...require("./Client.js"),
  ...require("./types.js")
});
//# sourceMappingURL=index.js.map
