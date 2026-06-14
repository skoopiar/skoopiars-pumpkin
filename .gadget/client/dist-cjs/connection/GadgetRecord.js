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
var GadgetRecord_exports = {};
__export(GadgetRecord_exports, {
  ChangeTracking: () => import_core2.ChangeTracking,
  GadgetRecord: () => GadgetRecord
});
module.exports = __toCommonJS(GadgetRecord_exports);
var import_core = require("@gadgetinc/core");
var import_klona = require("klona");
var import_support = require("./support.js");
var import_core2 = require("@gadgetinc/core");
class GadgetRecord_ {
  constructor(data) {
    /** Storage of the actual keys and values of this record */
    this.__fields = {};
    /** Storage of the keys and values of this record at the time it was instantiated */
    this.__instantiatedFields = {};
    /** Storage of the keys and values of this record at the time it was last persisted */
    this.__persistedFields = {};
    this.__touched = false;
    this.empty = false;
    this.__fields = {};
    this.__touched = false;
    this.__instantiatedFields = (0, import_klona.klona)(data) ?? {};
    this.__persistedFields = (0, import_klona.klona)(data) ?? {};
    Object.assign(this.__fields, data);
    if (!data || Object.keys(data).length === 0) {
      this.empty = true;
      this.__fieldKeys = /* @__PURE__ */ new Set();
    } else {
      this.__fieldKeys = new Set(Object.keys(this.__fields));
    }
    const self = this;
    const handler = {
      get: (obj, prop) => {
        if (prop in self || typeof prop == "symbol") {
          let val = self[prop];
          if (typeof val == "function") {
            val = val.bind(self);
          }
          return val;
        } else if (prop in obj) {
          return obj[prop];
        }
      },
      set: (obj, prop, value) => {
        self.trackKey(prop);
        obj[prop.toString()] = value;
        return true;
      }
    };
    return new Proxy(this.__fields, handler);
  }
  /** Makes sure our data keys are all tracked, to avoid repeated runtime object-to-array conversions */
  trackKey(key) {
    const trackingKey = key.toString();
    this.__fieldKeys.add(trackingKey);
  }
  /** Helper method to compare values with special handling for Date vs string comparisons in either direction */
  hasValueChanged(current, previous) {
    if (current instanceof Date && typeof previous === "string" || previous instanceof Date && typeof current === "string") {
      const currentDate = current instanceof Date ? current : new Date(current);
      const previousDate = previous instanceof Date ? previous : new Date(previous);
      if (!isNaN(currentDate.getTime()) && !isNaN(previousDate.getTime())) {
        return currentDate.getTime() !== previousDate.getTime();
      }
      return true;
    }
    return !(0, import_support.isEqual)(current, previous);
  }
  /** Returns true if even a single field has changed */
  hasChanges(tracking = import_core.ChangeTracking.SinceLoaded) {
    if (this.__touched)
      return true;
    const diffFields = tracking == import_core.ChangeTracking.SinceLoaded ? this.__instantiatedFields : this.__persistedFields;
    return [...this.__fieldKeys].some((key) => this.hasValueChanged(this.__fields[key], diffFields[key]));
  }
  /** Checks if the original constructor data was empty or not */
  isEmpty() {
    return this.empty;
  }
  /** Returns the value of the field for the given `apiIdentifier`. These properties may also be accessed on this record directly. This method can be used if your model field `apiIdentifier` conflicts with the `GadgetRecord` helper functions. */
  getField(apiIdentifier) {
    return this.__fields[apiIdentifier];
  }
  /** Sets the value of the field for the given `apiIdentifier`. These properties may also be accessed on this record directly. This method can be used if your model field `apiIdentifier` conflicts with the `GadgetRecord` helper functions. */
  setField(apiIdentifier, value) {
    this.trackKey(apiIdentifier);
    return this.__fields[apiIdentifier] = value;
  }
  changes(prop, tracking = import_core.ChangeTracking.SinceLoaded) {
    const trackChangesSince = typeof prop == "string" ? tracking : prop || tracking;
    const diffFields = trackChangesSince == import_core.ChangeTracking.SinceLoaded ? this.__instantiatedFields : this.__persistedFields;
    if (prop && typeof prop == "string") {
      const previous = diffFields[prop];
      const current = this.__fields[prop];
      const changed = this.hasValueChanged(current, previous);
      return changed ? { changed, current, previous } : { changed };
    } else {
      const diff = {};
      for (const key of this.__fieldKeys) {
        if (!(0, import_support.isEqual)(diffFields[key], this.__fields[key])) {
          diff[key] = { current: this.__fields[key], previous: diffFields[key] };
        }
      }
      return diff;
    }
  }
  /** Returns all current values for fields that have changed */
  toChangedJSON(tracking = import_core.ChangeTracking.SinceLoaded) {
    const diffFields = tracking == import_core.ChangeTracking.SinceLoaded ? this.__instantiatedFields : this.__persistedFields;
    const current = {};
    for (const key of this.__fieldKeys) {
      if (!(0, import_support.isEqual)(diffFields[key], this.__fields[key])) {
        current[key] = this.__fields[key];
      }
    }
    return current;
  }
  changed(prop, tracking = import_core.ChangeTracking.SinceLoaded) {
    if (prop && typeof prop == "string") {
      return this.changes(prop, tracking).changed;
    } else {
      return this.hasChanges(prop === void 0 ? tracking : prop);
    }
  }
  /** Flushes all `changes` and starts tracking new changes from the current state of the record. */
  flushChanges(tracking = import_core.ChangeTracking.SinceLoaded) {
    if (tracking == import_core.ChangeTracking.SinceLoaded) {
      this.__instantiatedFields = (0, import_klona.klona)(this.__fields);
    } else if (tracking == import_core.ChangeTracking.SinceLastPersisted) {
      this.__persistedFields = (0, import_klona.klona)(this.__fields);
    }
    this.__touched = false;
  }
  /** Reverts all `changes` on the record, and returns to either the values this record were instantiated with, or the values at the time of the last `flushChanges` call. */
  revertChanges(tracking = import_core.ChangeTracking.SinceLoaded) {
    let persistedKeys;
    if (tracking == import_core.ChangeTracking.SinceLoaded) {
      persistedKeys = Object.keys(this.__instantiatedFields);
    } else {
      persistedKeys = Object.keys(this.__persistedFields);
    }
    for (const key of this.__fieldKeys) {
      if (!persistedKeys.includes(key))
        delete this.__fields[key];
    }
    if (tracking == import_core.ChangeTracking.SinceLoaded) {
      Object.assign(this.__fields, (0, import_klona.klona)(this.__instantiatedFields));
    } else {
      Object.assign(this.__fields, (0, import_klona.klona)(this.__persistedFields));
    }
    this.__touched = false;
  }
  /** Returns a JSON representation of all fields on this record. */
  toJSON() {
    return (0, import_support.toPrimitiveObject)({ ...this.__fields });
  }
  /** Marks this record as changed so that the next save will save it and adjust any `updatedAt` timestamps */
  touch() {
    this.__touched = true;
  }
}
const GadgetRecord = Object.assign(GadgetRecord_, {
  ChangeTracking: import_core.ChangeTracking
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ChangeTracking,
  GadgetRecord
});
//# sourceMappingURL=GadgetRecord.js.map
