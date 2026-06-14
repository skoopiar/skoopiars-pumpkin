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
var GadgetTransaction_exports = {};
__export(GadgetTransaction_exports, {
  GadgetTransaction: () => GadgetTransaction,
  TransactionRolledBack: () => TransactionRolledBack
});
module.exports = __toCommonJS(GadgetTransaction_exports);
var import_support = require("./support.js");
class TransactionRolledBack extends Error {
}
class GadgetTransaction {
  constructor(client, subscriptionClient) {
    this.client = client;
    this.subscriptionClient = subscriptionClient;
    this.open = false;
  }
  /** Shut down this transaction by closing the connection to the backend. */
  close() {
    if (this.open) {
      void this.rollback().catch(() => null);
    }
    void this.subscriptionClient.dispose();
  }
  /** Explicitly roll back this transaction, preventing any of the changes made during it from being committed. */
  async rollback() {
    (0, import_support.assertOperationSuccess)(await this.client.mutation(`mutation RollbackTransaction { internal { rollbackTransaction }}`, {}).toPromise(), [
      "internal",
      "rollbackTransaction"
    ]);
    this.open = false;
    throw new TransactionRolledBack("Transaction rolled back.");
  }
  /**
   * @private
   */
  async start() {
    (0, import_support.assertOperationSuccess)(await this.client.mutation(`mutation StartTransaction { internal { startTransaction }}`, {}).toPromise(), [
      "internal",
      "startTransaction"
    ]);
    this.open = true;
  }
  /**
   * @private
   */
  async commit() {
    (0, import_support.assertOperationSuccess)(await this.client.mutation(`mutation CommitTransaction { internal { commitTransaction }}`, {}).toPromise(), [
      "internal",
      "commitTransaction"
    ]);
    this.open = false;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GadgetTransaction,
  TransactionRolledBack
});
//# sourceMappingURL=GadgetTransaction.js.map
