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
var ErrorWrapper_exports = {};
__export(ErrorWrapper_exports, {
  ErrorWrapper: () => ErrorWrapper
});
module.exports = __toCommonJS(ErrorWrapper_exports);
var import_graphql = require("@0no-co/graphql.web");
var import_support = require("./support.js");
class ErrorWrapper extends Error {
  constructor({
    networkError,
    executionErrors,
    response
  }) {
    const normalizedExecutionErrors = (executionErrors || []).map(rehydrateGraphQlError);
    const message = generateErrorMessage(networkError, normalizedExecutionErrors);
    super(message);
    this.message = message;
    this.executionErrors = normalizedExecutionErrors;
    this.graphQLErrors = normalizedExecutionErrors;
    this.networkError = networkError;
    this.response = response;
  }
  /** @private */
  static forClientSideError(error, response) {
    return new ErrorWrapper({
      executionErrors: [error],
      response
    });
  }
  /** @private */
  static forErrorsResponse(errors, response) {
    return new ErrorWrapper({
      executionErrors: errors.map(import_support.gadgetErrorFor),
      response
    });
  }
  /** @private */
  static forMaybeCombinedError(error) {
    if (!error)
      return void 0;
    return new ErrorWrapper({
      networkError: error.networkError,
      executionErrors: error.graphQLErrors,
      response: error.response
    });
  }
  /** @private */
  static errorIfDataAbsent(result, dataPath, paused = false) {
    const nonNullableError = (0, import_support.getNonNullableError)(result, dataPath);
    let error = ErrorWrapper.forMaybeCombinedError(result.error);
    if (!error && nonNullableError && !paused) {
      error = ErrorWrapper.forClientSideError(nonNullableError);
    }
    return error;
  }
  /** Class name of this error -- always `ErrorWrapper` */
  get name() {
    return "ErrorWrapper";
  }
  toString() {
    return this.message;
  }
  /**
   * A list of errors the backend reported for specific fields being invalid for the records touched by an action. Is a shortcut for accessing the validation errors of a `GadgetInvalidRecordError` if that's what is in the `executionErrors`.
   **/
  get validationErrors() {
    const firstInvalidRecordError = this.executionErrors.find((err) => err.code == "GGT_INVALID_RECORD");
    return (firstInvalidRecordError == null ? void 0 : firstInvalidRecordError.validationErrors) ?? null;
  }
}
const rehydrateGraphQlError = (error) => {
  if (typeof error === "string") {
    return new import_graphql.GraphQLError(error);
  } else if ((error == null ? void 0 : error.message) && !error.code) {
    return new import_graphql.GraphQLError(error.message, error.nodes, error.source, error.positions, error.path, error, error.extensions || {});
  } else {
    return error;
  }
};
const generateErrorMessage = (networkErr, graphQlErrs) => {
  let error = "";
  if (networkErr !== void 0) {
    error = `[Network] ${networkErr.message}`;
  } else if (graphQlErrs !== void 0) {
    graphQlErrs.forEach((err) => {
      error += `[GraphQL] ${err.message}
`;
    });
  } else {
    error = "Unknown error";
  }
  return error.trim();
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ErrorWrapper
});
//# sourceMappingURL=ErrorWrapper.js.map
