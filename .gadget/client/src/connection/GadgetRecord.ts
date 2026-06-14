import type { GadgetRecord as IGadgetRecord, RecordShape } from "@gadgetinc/core";
import { ChangeTracking } from "@gadgetinc/core";
import { klona as cloneDeep } from "klona";
import { Jsonify } from "type-fest";
import { isEqual, toPrimitiveObject } from "./support.js";

/** Represents one record returned from a high level Gadget API call */
class GadgetRecord_<Shape extends RecordShape> {
  /** Storage of the actual keys and values of this record */
  private __fields: Record<string, any> = {};
  /** Storage of the keys and values of this record at the time it was instantiated */
  private __instantiatedFields: Record<string, any> = {};
  /** Storage of the keys and values of this record at the time it was last persisted */
  private __persistedFields: Record<string, any> = {};
  /** Storage of the keys and values of this record at the time it was last persisted */
  private __fieldKeys: Set<string>;
  private __touched = false;

  private empty: boolean = false;

  constructor(data: Shape) {
    this.__fields = {};
    this.__touched = false;
    this.__instantiatedFields = cloneDeep(data) ?? {};
    this.__persistedFields = cloneDeep(data) ?? {};
    Object.assign(this.__fields, data);

    if (!data || Object.keys(data).length === 0) {
      this.empty = true;
      this.__fieldKeys = new Set<string>();
    } else {
      this.__fieldKeys = new Set(Object.keys(this.__fields));
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    const handler = {
      get: (obj: any, prop: string | symbol) => {
        if (prop in self || typeof prop == "symbol") {
          // if the GadgetRecord responds to the property or function, call that prioritize that
          let val = (self as any)[prop];
          if (typeof val == "function") {
            val = val.bind(self);
          }
          return val;
        } else if (prop in obj) {
          // otherwise proxy it to this [kFields] object
          return obj[prop];
        }
      },
      set: (obj: Record<string, any>, prop: string | symbol, value: any) => {
        self.trackKey(prop);
        obj[prop.toString()] = value;
        return true;
      },
    };

    return new Proxy(this.__fields, handler);
  }

  /** Makes sure our data keys are all tracked, to avoid repeated runtime object-to-array conversions */
  private trackKey(key: string | symbol) {
    const trackingKey = key.toString();
    this.__fieldKeys.add(trackingKey);
  }

  /** Helper method to compare values with special handling for Date vs string comparisons in either direction */
  private hasValueChanged(current: any, previous: any): boolean {
    if ((current instanceof Date && typeof previous === "string") || (previous instanceof Date && typeof current === "string")) {
      const currentDate = current instanceof Date ? current : new Date(current);
      const previousDate = previous instanceof Date ? previous : new Date(previous);

      // Check if both dates are valid before comparing
      if (!isNaN(currentDate.getTime()) && !isNaN(previousDate.getTime())) {
        return currentDate.getTime() !== previousDate.getTime();
      }
      return true; // If either can't be converted to a valid date, they're different
    }
    return !isEqual(current, previous);
  }

  /** Returns true if even a single field has changed */
  private hasChanges(tracking = ChangeTracking.SinceLoaded) {
    if (this.__touched) return true;
    const diffFields = tracking == ChangeTracking.SinceLoaded ? this.__instantiatedFields : this.__persistedFields;

    return [...this.__fieldKeys].some((key) => this.hasValueChanged(this.__fields[key], diffFields[key]));
  }

  /** Checks if the original constructor data was empty or not */
  isEmpty(): boolean {
    return this.empty;
  }

  /** Returns the value of the field for the given `apiIdentifier`. These properties may also be accessed on this record directly. This method can be used if your model field `apiIdentifier` conflicts with the `GadgetRecord` helper functions. */
  getField(apiIdentifier: string): any {
    return this.__fields[apiIdentifier];
  }

  /** Sets the value of the field for the given `apiIdentifier`. These properties may also be accessed on this record directly. This method can be used if your model field `apiIdentifier` conflicts with the `GadgetRecord` helper functions. */
  setField(apiIdentifier: string, value: any): any {
    this.trackKey(apiIdentifier);
    return (this.__fields[apiIdentifier] = value);
  }

  /** Returns the `current` and `previous` values for any changed fields, keyed by field `apiIdentifier`.  */
  changes(): { [prop: string]: { current: any; previous: any } };
  changes(tracking: ChangeTracking): { [prop: string]: { current: any; previous: any } };
  /** Returns the `current` and `previous` values if they have `changed`, otherwise `changed` is `false`. */
  changes(prop: string): { changed: true; current: any; previous: any } | { changed: false };
  changes(prop: string, tracking: ChangeTracking): { changed: true; current: any; previous: any } | { changed: false };
  changes(prop?: string | ChangeTracking, tracking = ChangeTracking.SinceLoaded) {
    const trackChangesSince: ChangeTracking = typeof prop == "string" ? tracking : prop || tracking;
    const diffFields = trackChangesSince == ChangeTracking.SinceLoaded ? this.__instantiatedFields : this.__persistedFields;

    if (prop && typeof prop == "string") {
      const previous = diffFields[prop];
      const current = this.__fields[prop];

      const changed = this.hasValueChanged(current, previous);
      return changed ? { changed, current, previous } : { changed };
    } else {
      const diff = {} as Record<string, { current: any; previous: any }>;
      for (const key of this.__fieldKeys) {
        if (!isEqual(diffFields[key], this.__fields[key])) {
          diff[key] = { current: this.__fields[key], previous: diffFields[key] };
        }
      }
      return diff;
    }
  }

  /** Returns all current values for fields that have changed */
  toChangedJSON(tracking: ChangeTracking = ChangeTracking.SinceLoaded): { [prop: string]: any } {
    const diffFields = tracking == ChangeTracking.SinceLoaded ? this.__instantiatedFields : this.__persistedFields;
    const current = {} as Record<string, any>;

    for (const key of this.__fieldKeys) {
      if (!isEqual(diffFields[key], this.__fields[key])) {
        current[key] = this.__fields[key];
      }
    }

    return current;
  }

  /** Returns `true` if any field has changed on this record. */
  changed(): boolean;
  changed(tracking: ChangeTracking): boolean;
  /** Returns `true` if the specified field has changed on this record. */
  changed(prop: string): boolean;
  changed(prop: string, tracking: ChangeTracking): boolean;
  changed(prop?: string | ChangeTracking, tracking = ChangeTracking.SinceLoaded) {
    if (prop && typeof prop == "string") {
      return this.changes(prop, tracking).changed;
    } else {
      return this.hasChanges(prop === undefined ? tracking : (prop as ChangeTracking));
    }
  }

  /** Flushes all `changes` and starts tracking new changes from the current state of the record. */
  flushChanges(tracking: ChangeTracking = ChangeTracking.SinceLoaded): void {
    if (tracking == ChangeTracking.SinceLoaded) {
      this.__instantiatedFields = cloneDeep(this.__fields);
    } else if (tracking == ChangeTracking.SinceLastPersisted) {
      this.__persistedFields = cloneDeep(this.__fields);
    }
    this.__touched = false;
  }

  /** Reverts all `changes` on the record, and returns to either the values this record were instantiated with, or the values at the time of the last `flushChanges` call. */
  revertChanges(tracking: ChangeTracking = ChangeTracking.SinceLoaded): void {
    let persistedKeys: string[];

    if (tracking == ChangeTracking.SinceLoaded) {
      persistedKeys = Object.keys(this.__instantiatedFields);
    } else {
      persistedKeys = Object.keys(this.__persistedFields);
    }

    for (const key of this.__fieldKeys) {
      if (!persistedKeys.includes(key)) delete this.__fields[key];
    }

    if (tracking == ChangeTracking.SinceLoaded) {
      Object.assign(this.__fields, cloneDeep(this.__instantiatedFields));
    } else {
      Object.assign(this.__fields, cloneDeep(this.__persistedFields));
    }
    this.__touched = false;
  }

  /** Returns a JSON representation of all fields on this record. */
  toJSON(): Jsonify<Shape> {
    return toPrimitiveObject({ ...this.__fields });
  }

  /** Marks this record as changed so that the next save will save it and adjust any `updatedAt` timestamps */
  touch(): void {
    this.__touched = true;
  }
}

/**
 * The overridden constructor below is TypeScript hijinx to make the generic GadgetRecord class include all the members of the wrapped generic Shape object
 * `GadgetRecord`s are generic because they can hold data of an arbitrary shape from the API, but TypeScript doesn't let the the class extend or implement anything without statically known members. The parameter is generic, so it's not statically known. So, we fake TypeScript out and create this pair of constructor and instance types that unions the instance of the class with the shape itself, making dot access of properties on the shape typecheck fine.
 */

export type GadgetRecord<Shape extends RecordShape> = IGadgetRecord<Shape>;
export { ChangeTracking } from "@gadgetinc/core";

/**
 * Instantiates a `GadgetRecord` with the attributes of your model. A `GadgetRecord` can be used to track changes to your model and persist those changes via Gadget actions.
 **/
export const GadgetRecord: (new <Shape extends RecordShape>(data: Shape) => GadgetRecord<Shape>) & {
  ChangeTracking: typeof ChangeTracking;
} = Object.assign(GadgetRecord_, {
  ChangeTracking,
}) as any;
