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
var ClientOptions_exports = {};
__export(ClientOptions_exports, {
  AuthenticationMode: () => AuthenticationMode,
  BrowserSessionStorageType: () => BrowserSessionStorageType
});
module.exports = __toCommonJS(ClientOptions_exports);
var AuthenticationMode = /* @__PURE__ */ ((AuthenticationMode2) => {
  AuthenticationMode2["BrowserSession"] = "browser-session";
  AuthenticationMode2["APIKey"] = "api-key";
  AuthenticationMode2["Internal"] = "internal";
  AuthenticationMode2["InternalAuthToken"] = "internal-auth-token";
  AuthenticationMode2["Anonymous"] = "anonymous";
  AuthenticationMode2["Custom"] = "custom";
  return AuthenticationMode2;
})(AuthenticationMode || {});
var BrowserSessionStorageType = /* @__PURE__ */ ((BrowserSessionStorageType2) => {
  BrowserSessionStorageType2["Durable"] = "Durable";
  BrowserSessionStorageType2["Session"] = "session";
  BrowserSessionStorageType2["Temporary"] = "temporary";
  return BrowserSessionStorageType2;
})(BrowserSessionStorageType || {});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AuthenticationMode,
  BrowserSessionStorageType
});
//# sourceMappingURL=ClientOptions.js.map
