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
var GadgetRecordList_exports = {};
__export(GadgetRecordList_exports, {
  GadgetRecordList: () => GadgetRecordList
});
module.exports = __toCommonJS(GadgetRecordList_exports);
var import_support = require("./support.js");
class GadgetRecordList extends Array {
  /** Internal method used to create a list. Should not be used by applications. */
  static boot(modelManager, records, pagination) {
    const list = new GadgetRecordList();
    list.push(...records);
    Object.defineProperty(list, "modelManager", { value: modelManager, enumerable: false, writable: true, configurable: true });
    list.pagination = pagination;
    Object.freeze(list);
    return list;
  }
  firstOrThrow() {
    if (!this[0]) {
      throw new import_support.GadgetOperationError("No records found.", "GGT_RECORD_NOT_FOUND");
    }
    return this[0];
  }
  toJSON() {
    return this.map((record) => record.toJSON());
  }
  get hasNextPage() {
    return this.pagination.pageInfo.hasNextPage;
  }
  get hasPreviousPage() {
    return this.pagination.pageInfo.hasPreviousPage;
  }
  get startCursor() {
    return this.pagination.pageInfo.startCursor;
  }
  get endCursor() {
    return this.pagination.pageInfo.endCursor;
  }
  async nextPage() {
    if (!this.hasNextPage)
      throw new import_support.GadgetClientError("Cannot request next page because there isn't one, should check 'hasNextPage' to see if it exists");
    const { first, last, before: _before, ...options } = this.pagination.options ?? {};
    const nextPage = this.modelManager.findMany({
      ...options,
      after: this.pagination.pageInfo.endCursor,
      first: first || last
    });
    return await nextPage;
  }
  async previousPage() {
    if (!this.hasPreviousPage)
      throw new import_support.GadgetClientError(
        "Cannot request previous page because there isn't one, should check 'hasPreviousPage' to see if it exists"
      );
    const { first, last, after: _after, ...options } = this.pagination.options ?? {};
    const prevPage = this.modelManager.findMany({
      ...options,
      before: this.pagination.pageInfo.startCursor,
      last: last || first
    });
    return await prevPage;
  }
}
Object.defineProperty(GadgetRecordList, Symbol.species, {
  get() {
    return Array;
  }
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GadgetRecordList
});
//# sourceMappingURL=GadgetRecordList.js.map
