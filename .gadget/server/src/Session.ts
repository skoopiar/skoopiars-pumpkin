import { AnyInternalModelManager } from "@gadgetinc/core";
import { getCurrentContext, internalModelManagerForModel, LINK_PARAM } from "./effects";
import { assert } from "./utils";
/**
 * Bag of key-values associated with the current actor running this request or action
 **/

const stringTag = "[object String]";
const numberTag = "[object Number]";
const objectProto = Object.prototype;
const objectToString = objectProto.toString;
const isArray = Array.isArray;
function isObjectLike(value: any): boolean {
  return !!value && typeof value == "object";
}

function isString(value: any): value is string {
  return typeof value == "string" || (!isArray(value) && isObjectLike(value) && objectToString.call(value) == stringTag);
}

function isNumber(value: any): value is number {
  return typeof value == "number" || (isObjectLike(value) && objectToString.call(value) == numberTag);
}

export class Session {
  static fromInput(modelApiIdentifier: string | null, input?: Record<string, any>): Session | undefined {
    if (input) {
      return new Session(modelApiIdentifier, input.id, input);
    }
  }

  changedKeys: Set<string> = new Set<string>();
  ended = false;
  touched = false;
  #storage: Record<string, any>;

  constructor(
    private _modelApiIdentifier: string | null,
    private _id: string | null,
    obj: Record<string, any>
  ) {
    this.#storage = obj;
  }

  get(key: string): any {
    return this.#storage[key];
  }

  set(key: string, value: any): void {
    this.changedKeys.add(key);
    this.#storage[key] = value;
  }

  touch(): void {
    this.touched = true;
  }

  delete(key: string): void {
    this.changedKeys.add(key);
    this.#storage[key] = null;
  }

  end(): void {
    this.changedKeys.add("id");
    this.ended = true;
  }

  clearChanges(): void {
    this.changedKeys.clear();
  }

  get changed(): boolean {
    return this.changedKeys.size > 0;
  }

  async persist(modelManager?: AnyInternalModelManager): Promise<void> {
    let internalSessionManager: AnyInternalModelManager;
    const apiIdentifier = assert(this._modelApiIdentifier, "cannot persist session without a session model");
    if (modelManager) {
      internalSessionManager = modelManager;
    } else {
      const context = getCurrentContext();
      const api = assert(context.api, "api client is missing from the current context");
      internalSessionManager = internalModelManagerForModel(api, apiIdentifier, []);
    }

    const sessionData = this.toChangedJSON();

    if (isString(sessionData.user) || isNumber(sessionData.user)) {
      sessionData.user = { [LINK_PARAM]: sessionData.user };
    }

    if (this.id) {
      await internalSessionManager.update(this.id, { [apiIdentifier]: sessionData });
    } else {
      const record = await internalSessionManager.create({ [apiIdentifier]: sessionData });
      this.id = (record as any).id;
      this.set("state", (record as any).state);
    }
  }

  toJSON(): Record<string, any> {
    return this.#storage;
  }

  toChangedJSON(): Record<string, any> {
    const changes: Record<string, any> = {};
    for (const key of this.changedKeys) {
      changes[key] = this.#storage[key];
    }
    return changes;
  }

  get id() {
    return this._id;
  }

  set id(value: string | null) {
    this._id = value;
    this.set("id", this._id);
  }
}
