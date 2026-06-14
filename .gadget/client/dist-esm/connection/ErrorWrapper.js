import { GraphQLError } from "@0no-co/graphql.web";
import { gadgetErrorFor, getNonNullableError } from "./support.js";
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
      executionErrors: errors.map(gadgetErrorFor),
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
    const nonNullableError = getNonNullableError(result, dataPath);
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
    return firstInvalidRecordError?.validationErrors ?? null;
  }
}
const rehydrateGraphQlError = (error) => {
  if (typeof error === "string") {
    return new GraphQLError(error);
  } else if (error?.message && !error.code) {
    return new GraphQLError(error.message, error.nodes, error.source, error.positions, error.path, error, error.extensions || {});
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
export {
  ErrorWrapper
};
//# sourceMappingURL=ErrorWrapper.js.map
