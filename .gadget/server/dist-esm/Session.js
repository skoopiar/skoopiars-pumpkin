import { getCurrentContext, internalModelManagerForModel, LINK_PARAM } from "./effects.js";
import { assert } from "./utils.js";
/**
 * Bag of key-values associated with the current actor running this request or action
 **/ const stringTag = "[object String]";
const numberTag = "[object Number]";
const objectProto = Object.prototype;
const objectToString = objectProto.toString;
const isArray = Array.isArray;
function isObjectLike(value) {
    return !!value && typeof value == "object";
}
function isString(value) {
    return typeof value == "string" || !isArray(value) && isObjectLike(value) && objectToString.call(value) == stringTag;
}
function isNumber(value) {
    return typeof value == "number" || isObjectLike(value) && objectToString.call(value) == numberTag;
}
export class Session {
    _modelApiIdentifier;
    _id;
    static fromInput(modelApiIdentifier, input) {
        if (input) {
            return new Session(modelApiIdentifier, input.id, input);
        }
    }
    changedKeys;
    ended;
    touched;
    #storage;
    constructor(_modelApiIdentifier, _id, obj){
        this._modelApiIdentifier = _modelApiIdentifier;
        this._id = _id;
        this.changedKeys = new Set();
        this.ended = false;
        this.touched = false;
        this.#storage = obj;
    }
    get(key) {
        return this.#storage[key];
    }
    set(key, value) {
        this.changedKeys.add(key);
        this.#storage[key] = value;
    }
    touch() {
        this.touched = true;
    }
    delete(key) {
        this.changedKeys.add(key);
        this.#storage[key] = null;
    }
    end() {
        this.changedKeys.add("id");
        this.ended = true;
    }
    clearChanges() {
        this.changedKeys.clear();
    }
    get changed() {
        return this.changedKeys.size > 0;
    }
    async persist(modelManager) {
        let internalSessionManager;
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
            sessionData.user = {
                [LINK_PARAM]: sessionData.user
            };
        }
        if (this.id) {
            await internalSessionManager.update(this.id, {
                [apiIdentifier]: sessionData
            });
        } else {
            const record = await internalSessionManager.create({
                [apiIdentifier]: sessionData
            });
            this.id = record.id;
            this.set("state", record.state);
        }
    }
    toJSON() {
        return this.#storage;
    }
    toChangedJSON() {
        const changes = {};
        for (const key of this.changedKeys){
            changes[key] = this.#storage[key];
        }
        return changes;
    }
    get id() {
        return this._id;
    }
    set id(value) {
        this._id = value;
        this.set("id", this._id);
    }
}
