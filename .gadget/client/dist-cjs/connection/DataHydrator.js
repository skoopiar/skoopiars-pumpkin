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
var DataHydrator_exports = {};
__export(DataHydrator_exports, {
  DataHydrator: () => DataHydrator,
  Hydrators: () => Hydrators
});
module.exports = __toCommonJS(DataHydrator_exports);
const Hydrators = {
  DateTime(value) {
    return new Date(value);
  }
};
class DataHydrator {
  constructor(plan) {
    this.plan = plan;
  }
  apply(source) {
    if (Array.isArray(source)) {
      return source.map((object) => this.hydrateObject(object));
    } else {
      return this.hydrateObject(source);
    }
  }
  hydrateObject(object) {
    const hydrated = { ...object };
    for (const [key, hydrator] of Object.entries(this.plan)) {
      const value = hydrated[key];
      if (value != null) {
        hydrated[key] = Hydrators[hydrator](value);
      }
    }
    return hydrated;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DataHydrator,
  Hydrators
});
//# sourceMappingURL=DataHydrator.js.map
