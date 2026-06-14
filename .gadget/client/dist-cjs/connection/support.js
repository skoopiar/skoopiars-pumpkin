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
    for (let key2 of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key2) && key2 !== except)
        __defProp(to, key2, { get: () => from[key2], enumerable: !(desc = __getOwnPropDesc(from, key2)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var support_exports = {};
__export(support_exports, {
  ErrorsSelection: () => ErrorsSelection,
  GadgetClientError: () => GadgetClientError,
  GadgetErrorGroup: () => GadgetErrorGroup,
  GadgetInternalError: () => GadgetInternalError,
  GadgetNonUniqueDataError: () => GadgetNonUniqueDataError,
  GadgetNotFoundError: () => GadgetNotFoundError,
  GadgetOperationError: () => GadgetOperationError,
  GadgetTooManyRequestsError: () => GadgetTooManyRequestsError,
  GadgetUnexpectedCloseError: () => GadgetUnexpectedCloseError,
  GadgetValidationError: () => GadgetValidationError,
  GadgetWebsocketConnectionTimeoutError: () => GadgetWebsocketConnectionTimeoutError,
  InvalidRecordError: () => InvalidRecordError,
  assert: () => assert,
  assertMutationSuccess: () => assertMutationSuccess,
  assertNullableOperationSuccess: () => assertNullableOperationSuccess,
  assertOperationSuccess: () => assertOperationSuccess,
  assertResponseSuccess: () => assertResponseSuccess,
  camelize: () => camelize,
  capitalizeFirstCharacter: () => capitalizeFirstCharacter,
  capitalizeIdentifier: () => capitalizeIdentifier,
  disambiguateActionVariables: () => disambiguateActionVariables,
  disambiguateBulkActionVariables: () => disambiguateBulkActionVariables,
  errorMessage: () => errorMessage,
  filterTypeName: () => filterTypeName,
  formatErrorMessages: () => formatErrorMessages,
  gadgetErrorFor: () => gadgetErrorFor,
  get: () => get,
  getHydrator: () => getHydrator,
  getNonNullableError: () => getNonNullableError,
  getNonUniqueDataError: () => getNonUniqueDataError,
  hydrateConnection: () => hydrateConnection,
  hydrateRecord: () => hydrateRecord,
  hydrateRecordArray: () => hydrateRecordArray,
  isCloseEvent: () => isCloseEvent,
  isEqual: () => isEqual,
  isPlainObject: () => isPlainObject,
  jsSearchFieldsToGqlSearchFields: () => jsSearchFieldsToGqlSearchFields,
  namespaceDataPath: () => namespaceDataPath,
  namespacedGraphQLTypeName: () => namespacedGraphQLTypeName,
  namespacify: () => namespacify,
  processActionResponse: () => processActionResponse,
  processBulkActionResponse: () => processBulkActionResponse,
  searchableFieldTypeName: () => searchableFieldTypeName,
  setVariableOptionValues: () => setVariableOptionValues,
  sortTypeName: () => sortTypeName,
  storageAvailable: () => storageAvailable,
  toPrimitiveObject: () => toPrimitiveObject
});
module.exports = __toCommonJS(support_exports);
var import_DataHydrator = require("./DataHydrator.js");
var import_GadgetRecord = require("./GadgetRecord.js");
class GadgetInternalError extends Error {
  constructor() {
    super(...arguments);
    this.code = "GGT_INTERNAL_ERROR";
    this.name = "InternalError";
    /** @private */
    this.statusCode = 500;
    /** @private */
    this.causedByClient = false;
  }
}
class GadgetClientError extends Error {
  constructor() {
    super(...arguments);
    this.code = "GGT_CLIENT_ERROR";
    this.name = "ClientError";
    /** @private */
    this.statusCode = 500;
    /** @private */
    this.causedByClient = true;
  }
}
class GadgetOperationError extends Error {
  constructor(incomingMessage, code) {
    super(incomingMessage.startsWith("GGT_") ? incomingMessage : `${code}: ${incomingMessage}`);
    this.code = code;
  }
}
class GadgetUnexpectedCloseError extends Error {
  constructor(event) {
    let message;
    if (isCloseEvent(event)) {
      message = `GraphQL websocket closed unexpectedly by the server with error code ${event.code} and reason "${event.reason}"`;
    } else {
      message = "GraphQL websocket closed unexpectedly by the server";
    }
    super(message);
    this.code = "GGT_UNKNOWN";
    this.name = "UnexpectedCloseError";
    /** @private */
    this.statusCode = 500;
    /** @private */
    this.causedByClient = false;
    this.event = event;
  }
}
class GadgetWebsocketConnectionTimeoutError extends Error {
  constructor() {
    super(...arguments);
    this.code = "GGT_WEBSOCKET_CONNECTION_TIMEOUT";
    this.name = "WebsocketConnectionTimeoutError";
    /** @private */
    this.statusCode = 500;
    /** @private */
    this.causedByClient = false;
  }
}
class GadgetTooManyRequestsError extends Error {
  constructor() {
    super(...arguments);
    this.code = "GGT_TOO_MANY_REQUESTS";
    this.name = "TooManyRequestsError";
    /** @private */
    this.statusCode = 429;
    /** @private */
    this.causedByClient = false;
  }
}
class InvalidRecordError extends Error {
  constructor(message, validationErrors, modelApiIdentifier, record) {
    const firstErrors = validationErrors.slice(0, 3);
    const extraErrorMessage = validationErrors.length > 3 ? `, and ${validationErrors.length - 3} more error${validationErrors.length > 4 ? "s" : ""} need${validationErrors.length > 4 ? "" : "s"} to be corrected` : "";
    super(
      message ?? `GGT_INVALID_RECORD: ${modelApiIdentifier ?? "Record"} is invalid and can't be saved. ${firstErrors.map(({ apiIdentifier, message: message2 }) => `${apiIdentifier} ${message2}`).join(", ")}${extraErrorMessage}.`
    );
    this.code = "GGT_INVALID_RECORD";
    this.name = "InvalidRecordError";
    /** @private */
    this.statusCode = 422;
    /** @private */
    this.causedByClient = true;
    this.validationErrors = validationErrors;
    this.modelApiIdentifier = modelApiIdentifier;
    this.record = record;
  }
}
const GadgetValidationError = InvalidRecordError;
class GadgetNonUniqueDataError extends Error {
  constructor() {
    super(...arguments);
    this.code = "GGT_NON_UNIQUE_DATA";
    this.name = "NonUniqueDataError";
    /** @private */
    this.statusCode = 417;
    /** @private */
    this.causedByClient = false;
  }
}
class GadgetNotFoundError extends Error {
  constructor() {
    super(...arguments);
    this.code = "GGT_RECORD_NOT_FOUND";
    this.name = "RecordNotFoundError";
    /** @private */
    this.statusCode = 404;
    /** @private */
    this.causedByClient = false;
  }
}
class GadgetErrorGroup extends Error {
  constructor(errors, results) {
    super(errors.length > 1 ? "Multiple errors occurred" : errors[0].message);
    this.errors = errors;
    this.results = results;
    this.name = "ErrorGroup";
  }
  get code() {
    return `GGT_ERROR_GROUP(${this.errors.slice(0, 10).map((error) => error.code ?? "GGT_UNKNOWN").join(",")})`;
  }
  /** @private */
  get statusCode() {
    return Math.max(...this.errors.map((error) => error.statusCode ?? 500));
  }
}
function assert(value, message) {
  if (!value) {
    throw new Error("assertion error" + (message ? `: ${message}` : ""));
  }
  return value;
}
const get = (object, path) => {
  const length = path.length;
  let index = 0;
  while (object != null && index < length) {
    object = object[path[index++]];
  }
  return index && index == length ? object : void 0;
};
const isCloseEvent = (event) => (event == null ? void 0 : event.type) == "close";
const capitalizeIdentifier = (str, capitalizeFirstCharacter2) => {
  if (typeof str !== "string")
    return "";
  return camelize(str, capitalizeFirstCharacter2);
};
const capitalizeFirstCharacter = (str) => {
  const result = str === null || str === void 0 ? "" : String(str);
  return result.charAt(0).toUpperCase() + result.slice(1);
};
const camelize = (term, uppercaseFirstLetter = true) => {
  let result = "" + term;
  if (uppercaseFirstLetter) {
    result = result.replace(/^[a-z\d]*/, (a) => {
      return capitalizeFirstCharacter(a);
    });
  } else {
    result = result.replace(new RegExp("^(?:(?=\\b|[A-Z_])|\\w)"), (a) => {
      return a.toLowerCase();
    });
  }
  result = result.replace(/(?:_|(\/))([a-z\d]*)/gi, (_match, a, b, _idx, _string) => {
    a || (a = "");
    return "" + a + capitalizeFirstCharacter(b);
  });
  return result;
};
const namespacedGraphQLTypeName = (modelApiIdentifier, givenNamespaces) => {
  const namespaces = Array.isArray(givenNamespaces) ? givenNamespaces : givenNamespaces ? [givenNamespaces] : [];
  const segments = [...namespaces, modelApiIdentifier];
  return segments.map((segment) => camelize(segment)).join("");
};
const sortTypeName = (modelApiIdentifier, namespace) => `${namespacedGraphQLTypeName(modelApiIdentifier, namespace)}Sort`;
const filterTypeName = (modelApiIdentifier, namespace) => `${namespacedGraphQLTypeName(modelApiIdentifier, namespace)}Filter`;
const searchableFieldTypeName = (modelApiIdentifier, namespace) => `${namespacedGraphQLTypeName(modelApiIdentifier, namespace)}SearchFields`;
const getNonUniqueDataError = (modelApiIdentifier, fieldName, fieldValue) => new GadgetNonUniqueDataError(
  `More than one record found for ${modelApiIdentifier}.${fieldName} = ${fieldValue}. Please confirm your unique validation is not reporting an error.`
);
const getNonNullableError = (response, dataPath) => {
  if (response.fetching) {
    return;
  }
  const result = get(response.data, dataPath);
  if (result === void 0) {
    return new GadgetInternalError(
      `Internal Error: Gadget API didn't return expected data. Nothing found in response at ${dataPath.join(".")}`
    );
  } else if (result === null) {
    return new GadgetNotFoundError(`Record Not Found Error: Gadget API returned no data at ${dataPath.join(".")}`);
  }
};
const assertOperationSuccess = (response, dataPath, throwOnEmptyData = false) => {
  var _a;
  if (response.error) {
    if ("networkError" in response.error && response.error.networkError) {
      if ((_a = response.error.networkError) == null ? void 0 : _a.message) {
        response.error.message = `[Network] ${response.error.networkError.message}`;
      } else {
        response.error.message = `[Network] No message, error: string(response.error.networkError) 
stack: ${String(
          response.error.networkError.stack
        )}}`;
      }
    }
    throw response.error;
  }
  const result = get(response.data, dataPath);
  const edges = get(result, ["edges"]);
  const dataArray = edges ?? result;
  if (result === void 0) {
    throw new GadgetInternalError(
      `Internal Error: Gadget API didn't return expected data. Nothing found in response at ${dataPath.join(".")}`
    );
  } else if (result === null || throwOnEmptyData && Array.isArray(dataArray) && dataArray.length === 0) {
    throw new GadgetNotFoundError(`Record Not Found Error: Gadget API returned no data at ${dataPath.join(".")}`);
  }
  return result;
};
const assertNullableOperationSuccess = (response, dataPath) => {
  var _a;
  if (response.error) {
    if ("networkError" in response.error && ((_a = response.error.networkError) == null ? void 0 : _a.length)) {
      response.error.message = response.error.networkError.map((error) => "[Network] " + error.message).join("\n");
    }
    throw response.error;
  }
  const result = get(response.data, dataPath);
  return result ?? null;
};
const gadgetErrorFor = (error) => {
  var _a;
  if (error.code == "GGT_INVALID_RECORD") {
    return new InvalidRecordError(error.message, error.validationErrors, (_a = error.model) == null ? void 0 : _a.apiIdentifier, error.record);
  } else if (error.code == "GGT_UNKNOWN" && error.message.includes("duplicate key value violates unique constraint")) {
    return new GadgetNonUniqueDataError(error.message);
  } else {
    return new GadgetOperationError(error.message, error.code);
  }
};
const assertMutationSuccess = (response, dataPath) => {
  const operationResponse = assertOperationSuccess(response, dataPath);
  return assertResponseSuccess(operationResponse);
};
const assertResponseSuccess = (operationResponse) => {
  if (!operationResponse.success) {
    const firstErrorBlob = operationResponse.errors && operationResponse.errors[0];
    if (firstErrorBlob) {
      throw gadgetErrorFor(firstErrorBlob);
    } else {
      throw new GadgetOperationError(`Gadget API operation not successful.`, "GGT_UNKNOWN");
    }
  }
  return operationResponse;
};
const getHydrator = (response) => {
  var _a, _b, _c, _d;
  if ((_b = (_a = response.data) == null ? void 0 : _a.gadgetMeta) == null ? void 0 : _b.hydrations) {
    return new import_DataHydrator.DataHydrator((_d = (_c = response.data) == null ? void 0 : _c.gadgetMeta) == null ? void 0 : _d.hydrations);
  }
};
const hydrateRecord = (response, record) => {
  const hydrator = getHydrator(response);
  if (hydrator) {
    record = hydrator.apply(record);
  }
  return new import_GadgetRecord.GadgetRecord(record);
};
const hydrateRecordArray = (response, records) => {
  const hydrator = getHydrator(response);
  if (hydrator) {
    records = hydrator.apply(records);
  }
  return records == null ? void 0 : records.map((record) => new import_GadgetRecord.GadgetRecord(record));
};
const hydrateConnection = (response, connection) => {
  const nodes = connection.edges.map((edge) => edge.node);
  return hydrateRecordArray(response, nodes);
};
const objObjType = "[object Object]";
const stringObjType = "[object String]";
const toPrimitiveObject = (value) => {
  if (value != null && typeof value.toJSON === "function")
    value = value.toJSON();
  if (value === void 0)
    return void 0;
  if (value === null)
    return null;
  if (typeof value === "boolean")
    return value;
  if (typeof value === "string")
    return value;
  if (typeof value === "number")
    return Number.isFinite(value) ? value : null;
  if (typeof value === "object") {
    if (Array.isArray(value)) {
      const arr = [];
      for (let i = 0; i < value.length; i++) {
        const v = value[i];
        arr[i] = v === void 0 ? null : toPrimitiveObject(v);
      }
      return arr;
    }
    if (Object.prototype.toString.call(value) === "[object Error]")
      return {};
    if (Object.prototype.toString.call(value) === objObjType) {
      const obj = {};
      for (const key2 of Object.keys(value)) {
        const parsed = toPrimitiveObject(value[key2]);
        if (parsed !== void 0)
          obj[key2] = parsed;
      }
      return obj;
    }
  }
};
const errorMessage = (error) => {
  if (typeof error == "string") {
    return error;
  } else if (error && (error == null ? void 0 : error.message)) {
    return error.message;
  } else {
    return String(error);
  }
};
const key = "gstk";
const storageAvailable = (type) => {
  try {
    const storage = window[type];
    storage.setItem(key, key);
    storage.removeItem(key);
    return true;
  } catch (e) {
    return false;
  }
};
const toString = Object.prototype.toString, getPrototypeOf = Object.getPrototypeOf, getOwnProperties = Object.getOwnPropertySymbols ? (c) => Object.keys(c).concat(Object.getOwnPropertySymbols(c)) : Object.keys;
const checkEquality = (a, b, refs) => {
  if (a === b)
    return true;
  if (a == null || b == null)
    return false;
  if (refs.indexOf(a) > -1 && refs.indexOf(b) > -1)
    return true;
  const aType = toString.call(a);
  const bType = toString.call(b);
  let aElements, bElements, element;
  refs.push(a, b);
  if (aType == objObjType && bType == stringObjType && "_link" in a && Object.keys(a).length == 1) {
    return a._link === b;
  } else if (bType == objObjType && aType == stringObjType && "_link" in b && Object.keys(b).length == 1) {
    return b._link === a;
  }
  if (aType != bType)
    return false;
  aElements = getOwnProperties(a);
  bElements = getOwnProperties(b);
  if (aElements.length != bElements.length || aElements.some(function(key2) {
    return !checkEquality(a[key2], b[key2], refs);
  })) {
    return false;
  }
  switch (aType.slice(8, -1)) {
    case "Symbol":
      return a.valueOf() == b.valueOf();
    case "Date":
    case "Number":
      return +a == +b || +a != +a && +b != +b;
    case "RegExp":
    case "Function":
    case "String":
    case "Boolean":
      return "" + a == "" + b;
    case "Set":
    case "Map": {
      aElements = a.entries();
      bElements = b.entries();
      do {
        element = aElements.next();
        if (!checkEquality(element.value, bElements.next().value, refs)) {
          return false;
        }
      } while (!element.done);
      return true;
    }
    case "ArrayBuffer":
      a = new Uint8Array(a), b = new Uint8Array(b);
    case "DataView":
      a = new Uint8Array(a.buffer), b = new Uint8Array(b.buffer);
    case "Float32Array":
    case "Float64Array":
    case "Int8Array":
    case "Int16Array":
    case "Int32Array":
    case "Uint8Array":
    case "Uint16Array":
    case "Uint32Array":
    case "Uint8ClampedArray":
    case "Arguments":
    case "Array":
      if (a.length != b.length)
        return false;
      for (element = 0; element < a.length; element++) {
        if (!(element in a) && !(element in b))
          continue;
        if (element in a != element in b || !checkEquality(a[element], b[element], refs))
          return false;
      }
      return true;
    case "Object":
      return checkEquality(getPrototypeOf(a), getPrototypeOf(b), refs);
    default:
      return false;
  }
};
const isEqual = (a, b) => checkEquality(a, b, []);
const isPlainObject = (value) => {
  if (typeof value !== "object" || value === null)
    return false;
  if (Object.prototype.toString.call(value) !== "[object Object]")
    return false;
  const proto = Object.getPrototypeOf(value);
  if (proto === null)
    return true;
  const Ctor = Object.prototype.hasOwnProperty.call(proto, "constructor") && proto.constructor;
  return typeof Ctor === "function" && Ctor instanceof Ctor && Function.prototype.call(Ctor) === Function.prototype.call(value);
};
const disambiguateActionVariables = (action, variables) => {
  var _a;
  variables ?? (variables = {});
  if (!("hasAmbiguousIdentifier" in action) && !("acceptsModelInput" in action))
    return variables;
  if (action.hasAmbiguousIdentifier) {
    if (Object.keys(variables).some((key2) => {
      var _a2;
      return key2 !== "id" && !((_a2 = action.paramOnlyVariables) == null ? void 0 : _a2.includes(key2)) && key2 !== action.modelApiIdentifier;
    })) {
      throw Error(`Invalid arguments found in variables. Did you mean to use ({ ${action.modelApiIdentifier}: { ... } })?`);
    }
  }
  let newVariables;
  const shouldExtractId = action.operatesWithRecordIdentity ?? true;
  if (action.acceptsModelInput ?? action.hasCreateOrUpdateEffect) {
    if (action.modelApiIdentifier in variables && typeof variables[action.modelApiIdentifier] === "object" && variables[action.modelApiIdentifier] != null) {
      newVariables = variables;
    } else {
      newVariables = {
        [action.modelApiIdentifier]: /* @__PURE__ */ Object.create(null)
      };
      for (const [key2, value] of Object.entries(variables)) {
        if ((_a = action.paramOnlyVariables) == null ? void 0 : _a.includes(key2)) {
          newVariables[key2] = value;
        } else {
          if (key2 == "id" && shouldExtractId) {
            newVariables.id = value;
          } else {
            newVariables[action.modelApiIdentifier][key2] = value;
          }
        }
      }
    }
  } else {
    newVariables = variables;
  }
  return newVariables;
};
const disambiguateBulkActionVariables = (action, inputs = {}) => {
  if (action.variables["ids"]) {
    return Array.isArray(inputs) ? { ids: inputs } : inputs;
  } else {
    const inputsArray = (Array.isArray(inputs) ? inputs : inputs.inputs) ?? [];
    return {
      inputs: inputsArray.map((input) => disambiguateActionVariables(action, input))
    };
  }
};
const setVariableOptionValues = (variableOptions, values) => {
  const result = {};
  for (const [key2, variable] of Object.entries(variableOptions)) {
    const value = key2 in values ? values[key2] : variable.value;
    result[key2] = { ...variable, value };
  }
  return result;
};
const namespaceDataPath = (dataPath, namespace) => {
  if (namespace) {
    dataPath.unshift(...Array.isArray(namespace) ? namespace : [namespace]);
  }
  return dataPath;
};
function namespacify(namespace, fields) {
  if (!namespace)
    return fields;
  if (!Array.isArray(namespace)) {
    namespace = [namespace];
  }
  if (namespace) {
    for (let i = namespace.length - 1; i >= 0; i--) {
      fields = {
        [namespace[i]]: fields
      };
    }
  }
  return fields;
}
const ErrorsSelection = {
  errors: {
    message: true,
    code: true,
    "... on InvalidRecordError": {
      model: {
        apiIdentifier: true
      },
      validationErrors: {
        message: true,
        apiIdentifier: true
      }
    }
  }
};
function mapToObject(map) {
  const obj = {};
  for (const [key2, value] of map.entries()) {
    if (value instanceof Map) {
      obj[key2] = mapToObject(value);
    } else {
      obj[key2] = value;
    }
  }
  return obj;
}
const formatErrorMessages = (error) => {
  const result = /* @__PURE__ */ new Map();
  if ("validationErrors" in error) {
    const invalidRecordError = error;
    for (const validationError of invalidRecordError.validationErrors) {
      if (invalidRecordError.modelApiIdentifier) {
        if (!result.has(invalidRecordError.modelApiIdentifier)) {
          result.set(invalidRecordError.modelApiIdentifier, /* @__PURE__ */ new Map());
        }
        const modelMap = result.get(invalidRecordError.modelApiIdentifier);
        modelMap.set(validationError.apiIdentifier, { message: validationError.message });
      } else {
        result.set(validationError.apiIdentifier, { message: validationError.message });
      }
    }
  } else {
    const codeToReplace = "code" in error ? `${error.code}: ` : "";
    const message = error.message.replace(codeToReplace, "");
    result.set("root", { message });
  }
  return mapToObject(result);
};
const jsSearchFieldsToGqlSearchFields = (searchFields) => {
  const result = {};
  for (const [field, config] of Object.entries(searchFields)) {
    if (config === null || config === void 0 || config === false) {
      continue;
    }
    if (isPlainObject(config)) {
      const hasScalarProperties = Object.values(config).some(
        (v) => !isPlainObject(v) && v !== true && v !== null && v !== void 0 && v !== false
      );
      if (hasScalarProperties) {
        const fieldConfig = {};
        for (const [key2, value] of Object.entries(config)) {
          if (value === null || value === void 0 || value === false) {
            continue;
          }
          if (isPlainObject(value)) {
            fieldConfig[key2] = jsSearchFieldsToGqlSearchFields(value);
          } else if (value === true) {
            fieldConfig[key2] = {};
          } else {
            fieldConfig[key2] = value;
          }
        }
        result[field] = fieldConfig;
      } else {
        result[field] = jsSearchFieldsToGqlSearchFields(config);
      }
    } else if (config === true) {
      result[field] = {};
    }
  }
  return result;
};
const processBulkActionResponse = (defaultSelection, response, records, modelSelectionField, hasReturnType) => {
  if (defaultSelection == null)
    return;
  if (!hasReturnType) {
    return hydrateRecordArray(response, records[modelSelectionField]);
  } else if (typeof hasReturnType == "boolean") {
    return records.results;
  } else {
    return Object.entries(hasReturnType).flatMap(([returnTypeField, innerHasReturnType]) => {
      const results = records[returnTypeField];
      if (!Array.isArray(results)) {
        return [];
      }
      return results.map((result) => {
        const returnTypeForResult = "hasReturnType" in innerHasReturnType ? returnTypeForRecord(result, innerHasReturnType.hasReturnType) : false;
        if (!returnTypeForResult) {
          return hydrateRecord(response, result);
        } else {
          return processActionResponse(defaultSelection, response, result, modelSelectionField, returnTypeForResult);
        }
      });
    });
  }
};
const processActionResponse = (defaultSelection, response, record, modelSelectionField, hasReturnType) => {
  if (defaultSelection == null)
    return;
  if (!hasReturnType) {
    return hydrateRecord(response, record[modelSelectionField]);
  } else if (typeof hasReturnType == "boolean") {
    return record.result;
  } else {
    const innerReturnType = returnTypeForRecord(record, hasReturnType);
    return processActionResponse(defaultSelection, response, record, modelSelectionField, innerReturnType);
  }
};
const returnTypeForRecord = (record, hasReturnType) => {
  if (typeof hasReturnType == "boolean") {
    return hasReturnType;
  }
  const innerReturnTypeForTypename = hasReturnType[`... on ${record.__typename}`];
  return innerReturnTypeForTypename && "hasReturnType" in innerReturnTypeForTypename ? innerReturnTypeForTypename.hasReturnType : false;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ErrorsSelection,
  GadgetClientError,
  GadgetErrorGroup,
  GadgetInternalError,
  GadgetNonUniqueDataError,
  GadgetNotFoundError,
  GadgetOperationError,
  GadgetTooManyRequestsError,
  GadgetUnexpectedCloseError,
  GadgetValidationError,
  GadgetWebsocketConnectionTimeoutError,
  InvalidRecordError,
  assert,
  assertMutationSuccess,
  assertNullableOperationSuccess,
  assertOperationSuccess,
  assertResponseSuccess,
  camelize,
  capitalizeFirstCharacter,
  capitalizeIdentifier,
  disambiguateActionVariables,
  disambiguateBulkActionVariables,
  errorMessage,
  filterTypeName,
  formatErrorMessages,
  gadgetErrorFor,
  get,
  getHydrator,
  getNonNullableError,
  getNonUniqueDataError,
  hydrateConnection,
  hydrateRecord,
  hydrateRecordArray,
  isCloseEvent,
  isEqual,
  isPlainObject,
  jsSearchFieldsToGqlSearchFields,
  namespaceDataPath,
  namespacedGraphQLTypeName,
  namespacify,
  processActionResponse,
  processBulkActionResponse,
  searchableFieldTypeName,
  setVariableOptionValues,
  sortTypeName,
  storageAvailable,
  toPrimitiveObject
});
//# sourceMappingURL=support.js.map
