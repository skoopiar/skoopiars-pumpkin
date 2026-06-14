import { ErrorWrapper } from "./connection/ErrorWrapper.js";
import { GadgetRecordList } from "./connection/GadgetRecordList.js";
import {
  actionOperation,
  computedViewOperation,
  findManyOperation,
  findOneByFieldOperation,
  findOneOperation,
  globalActionOperation
} from "./connection/operationBuilders.js";
import {
  actionRunner,
  computedViewRunner,
  findAllRunner,
  findManyRunner,
  findOneByFieldRunner,
  findOneRunner,
  globalActionRunner,
  inlineComputedViewRunner,
  iterateAllRunner
} from "./connection/operationRunners.js";
import {
  GadgetNotFoundError,
  get,
  getNonUniqueDataError,
  hydrateConnection,
  hydrateRecord,
  hydrateRecordArray,
  namespaceDataPath,
  processActionResponse
} from "./connection/support.js";
const buildModelManager = (apiIdentifier, pluralApiIdentifier, defaultSelection, operationGroup) => {
  const modelManagerClass = class {
    constructor(connection) {
      this.connection = connection;
    }
  };
  Object.defineProperty(modelManagerClass, "name", { value: `${apiIdentifier}Manager` });
  for (const operation of operationGroup) {
    switch (operation.type) {
      case "maybeFindOne":
      case "findOne": {
        const allowNull = operation.type.startsWith("maybe");
        if ("functionName" in operation) {
          const processResult = (result, opts) => {
            const value = opts?.fieldValue ?? "";
            const dataPath = namespaceDataPath([operation.operationName], operation.namespace);
            let data = result.data;
            let records = [];
            if (data) {
              const connection = get(result.data, dataPath);
              if (connection) {
                records = hydrateConnection(result, connection);
                data = records[0];
              }
            }
            let error = ErrorWrapper.forMaybeCombinedError(result.error);
            if (!error) {
              if (records.length > 1) {
                error = ErrorWrapper.forClientSideError(
                  getNonUniqueDataError(operation.modelApiIdentifier, operation.findByVariableName, value)
                );
              } else if (result.data && !records[0]) {
                error = ErrorWrapper.forClientSideError(
                  new GadgetNotFoundError(`${operation.modelApiIdentifier} record with ${operation.findByVariableName}=${value} not found`)
                );
              }
            }
            return { data, error };
          };
          const plan = (fieldValue, options) => {
            return findOneByFieldOperation(
              operation.operationName,
              operation.findByVariableName,
              fieldValue,
              defaultSelection,
              apiIdentifier,
              options,
              operation.namespace
            );
          };
          modelManagerClass.prototype[operation.functionName] = Object.assign(
            function(value, options) {
              return findOneByFieldRunner(
                this,
                operation.operationName,
                operation.findByField,
                value,
                defaultSelection,
                apiIdentifier,
                options,
                !allowNull,
                operation.namespace
              );
            },
            operation,
            {
              plan,
              processResult
            }
          );
        } else {
          const processResult = allowNull ? (result) => {
            const dataPath = namespaceDataPath([operation.operationName], operation.namespace);
            let data = result.data ?? null;
            if (data) {
              const value = get(data, dataPath);
              data = value && "id" in value ? hydrateRecord(result, value) : null;
            }
            const error = ErrorWrapper.forMaybeCombinedError(result.error);
            return { data, error };
          } : (result, opts) => {
            const dataPath = namespaceDataPath([operation.operationName], operation.namespace);
            let data = result.data && get(result.data, dataPath);
            if (data) {
              data = hydrateRecord(result, data);
            }
            const error = ErrorWrapper.errorIfDataAbsent({ fetching: false, ...result }, dataPath, opts?.pause);
            return { data, error };
          };
          const plan = (value, options) => {
            return findOneOperation(operation.operationName, value, defaultSelection, apiIdentifier, options, operation.namespace);
          };
          modelManagerClass.prototype[operation.type] = Object.assign(
            function(id, options) {
              const response = findOneRunner(
                this,
                apiIdentifier,
                id,
                defaultSelection,
                apiIdentifier,
                options,
                !allowNull,
                operation.namespace
              );
              return forEachMaybeLiveResponse(response, (record) => record.isEmpty() ? null : record);
            },
            operation,
            {
              plan,
              processResult
            }
          );
        }
        break;
      }
      case "findMany": {
        const processResult = (result, opts) => {
          const dataPath = namespaceDataPath([operation.operationName], operation.namespace);
          let data = result.data;
          if (data) {
            const connection = get(data, dataPath);
            if (connection) {
              const records = hydrateConnection(result, connection);
              data = GadgetRecordList.boot(modelManagerClass.prototype, records, connection);
            }
          }
          const error = ErrorWrapper.errorIfDataAbsent({ fetching: false, ...result }, dataPath, opts?.pause);
          return { data, error };
        };
        const plan = (options) => {
          return findManyOperation(pluralApiIdentifier, defaultSelection, apiIdentifier, options, operation.namespace);
        };
        modelManagerClass.prototype.findMany = Object.assign(
          function(options) {
            return findManyRunner(this, pluralApiIdentifier, defaultSelection, apiIdentifier, options, void 0, operation.namespace);
          },
          operation,
          {
            plan,
            processResult
          }
        );
        modelManagerClass.prototype.findAll = function(options) {
          return findAllRunner(this, pluralApiIdentifier, defaultSelection, apiIdentifier, options, operation.namespace);
        };
        modelManagerClass.prototype.iterateAll = function(options) {
          return iterateAllRunner(this, pluralApiIdentifier, defaultSelection, apiIdentifier, options, operation.namespace);
        };
        break;
      }
      case "maybeFindFirst":
      case "findFirst": {
        const allowNull = operation.type === "maybeFindFirst";
        const processResult = allowNull ? (result) => {
          const dataPath = namespaceDataPath([operation.operationName], operation.namespace);
          let data = result.data ?? null;
          if (data) {
            const connection = get(data, dataPath);
            if (connection) {
              data = hydrateConnection(result, connection)[0] ?? null;
            } else {
              data = data[0] ?? null;
            }
          }
          return { data, error: ErrorWrapper.forMaybeCombinedError(result.error) };
        } : (result, opts) => {
          const dataPath = namespaceDataPath([operation.operationName], operation.namespace);
          let data = result.data;
          if (data) {
            const connection = get(data, dataPath);
            if (connection) {
              data = hydrateConnection(result, connection)[0];
            } else {
              data = data[0];
            }
          }
          const error = ErrorWrapper.errorIfDataAbsent({ fetching: false, ...result }, dataPath, opts?.pause);
          return { data, error };
        };
        const plan = (options) => {
          return findManyOperation(
            pluralApiIdentifier,
            defaultSelection,
            apiIdentifier,
            {
              ...options,
              first: 1,
              last: void 0,
              before: void 0,
              after: void 0
            },
            operation.namespace
          );
        };
        modelManagerClass.prototype[operation.type] = Object.assign(
          function(options) {
            const response = findManyRunner(
              this,
              pluralApiIdentifier,
              defaultSelection,
              apiIdentifier,
              {
                ...options,
                first: 1,
                last: void 0,
                before: void 0,
                after: void 0
              },
              !allowNull,
              operation.namespace
            );
            return forEachMaybeLiveResponse(response, (list) => list?.[0] ?? null);
          },
          operation,
          {
            plan,
            processResult
          }
        );
        break;
      }
      case "get": {
        const processResult = (result) => {
          const dataPath = namespaceDataPath([operation.operationName], operation.namespace);
          let data = null;
          const rawRecord = result.data && get(result.data, dataPath);
          if (rawRecord) {
            data = hydrateRecord(result, rawRecord);
          }
          const error = ErrorWrapper.forMaybeCombinedError(result.error);
          return { data, error };
        };
        const plan = (options) => {
          return findOneOperation(operation.operationName, void 0, defaultSelection, apiIdentifier, options, operation.namespace);
        };
        modelManagerClass.prototype.get = Object.assign(
          function(options) {
            return findOneRunner(
              this,
              operation.operationName,
              void 0,
              defaultSelection,
              apiIdentifier,
              options,
              void 0,
              operation.namespace
            );
          },
          operation,
          {
            plan,
            processResult
          }
        );
        break;
      }
      case "action": {
        if (operation.isBulk) {
          const bulkInvokedByIDOnly = !!operation.variables["ids"];
          const processResult = (result) => {
            let error = ErrorWrapper.forMaybeCombinedError(result.error);
            let data = void 0;
            if (result.data && !error) {
              const dataPath = namespaceDataPath([operation.operationName], operation.namespace);
              const mutationData = get(result.data, dataPath);
              if (mutationData) {
                const isDeleteAction = operation.isDeleter;
                if (!isDeleteAction) {
                  const errors = mutationData["errors"];
                  if (errors && errors[0]) {
                    error = ErrorWrapper.forErrorsResponse(errors, errors[0]?.response);
                  } else {
                    data = operation.hasReturnType ? mutationData.results : hydrateRecordArray(result, mutationData[operation.modelSelectionField]);
                  }
                } else {
                  data = mutationData;
                }
              }
            }
            return { data, error };
          };
          const plan = (options) => {
            return actionOperation(
              operation.operationName,
              operation.isDeleter ? null : operation.defaultSelection,
              apiIdentifier,
              operation.modelSelectionField,
              operation.variables,
              options,
              operation.namespace,
              true,
              operation.hasReturnType
            );
          };
          modelManagerClass.prototype[operation.functionName] = Object.assign(
            async function(inputs, options) {
              let variables;
              if (bulkInvokedByIDOnly) {
                variables = {
                  ids: {
                    ...operation.variables["ids"],
                    value: inputs
                  }
                };
              } else {
                variables = {
                  inputs: {
                    ...operation.variables["inputs"],
                    value: inputs.map(
                      (input) => disambiguateActionParams(this[operation.singleActionFunctionName], void 0, input)
                    )
                  }
                };
              }
              return await actionRunner(
                this,
                operation.operationName,
                operation.isDeleter ? null : defaultSelection,
                apiIdentifier,
                operation.modelSelectionField,
                true,
                variables,
                options,
                operation.namespace,
                operation.hasReturnType
              );
            },
            operation,
            {
              plan,
              processResult,
              get singleAction() {
                return modelManagerClass.prototype[operation.singleActionFunctionName];
              }
            }
          );
        } else {
          const hasId = !!operation.variables["id"];
          const hasOthers = Object.keys(operation.variables).filter((key) => key != "id").length > 0;
          const processResult = (result) => {
            let error = ErrorWrapper.forMaybeCombinedError(result.error);
            let data = null;
            if (result.data) {
              const dataPath = namespaceDataPath([operation.operationName], operation.namespace);
              const mutationData = get(result.data, dataPath);
              if (mutationData) {
                const errors = mutationData["errors"];
                if (errors && errors[0]) {
                  error = ErrorWrapper.forErrorsResponse(errors, error?.response);
                } else {
                  data = processActionResponse(
                    operation.defaultSelection,
                    result,
                    mutationData,
                    operation.modelSelectionField,
                    operation.hasReturnType
                  );
                }
              }
            }
            return {
              data,
              error
            };
          };
          const plan = (options) => {
            return actionOperation(
              operation.operationName,
              operation.isDeleter ? null : operation.defaultSelection,
              apiIdentifier,
              operation.modelSelectionField,
              operation.variables,
              options,
              operation.namespace,
              false,
              operation.hasReturnType
            );
          };
          modelManagerClass.prototype[operation.functionName] = Object.assign(
            async function(...args) {
              const [variables, options] = actionArgs(operation, hasId, hasOthers, args);
              return await actionRunner(
                this,
                operation.operationName,
                operation.isDeleter ? null : defaultSelection,
                apiIdentifier,
                operation.modelSelectionField,
                false,
                variables,
                options,
                operation.namespace,
                operation.hasReturnType
              );
            },
            operation,
            {
              plan,
              processResult
            }
          );
        }
        break;
      }
      case "stubbedAction": {
        modelManagerClass.prototype[operation.functionName] = Object.assign(
          function(..._args) {
            sendDevHarnessStubbedActionEvent(operation);
            throw new Error(operation.errorMessage);
          },
          operation
        );
        break;
      }
      case "computedView": {
        modelManagerClass.prototype[operation.operationName] = isInlineComputedView(operation) ? buildInlineModelComputedView(operation) : buildModelComputedView(operation);
        break;
      }
      case "stubbedComputedView": {
        modelManagerClass.prototype[operation.operationName] = buildStubbedComputedView(operation);
        break;
      }
    }
  }
  return modelManagerClass;
};
const buildGlobalAction = (client, operation) => {
  if (operation.type == "stubbedAction") {
    return Object.assign((..._args) => {
      sendDevHarnessStubbedActionEvent(operation);
      throw new Error(operation.errorMessage);
    }, operation);
  } else {
    const processResult = (result) => {
      let error = ErrorWrapper.forMaybeCombinedError(result.error);
      let data = void 0;
      if (result.data) {
        const dataPath = namespaceDataPath([operation.operationName], operation.namespace);
        data = get(result.data, dataPath);
        if (data) {
          const errors = data.errors;
          data = data.result;
          if (errors && errors[0]) {
            error = ErrorWrapper.forErrorsResponse(errors, errors[0]?.response);
          }
        }
      }
      return {
        data,
        error
      };
    };
    const plan = (variables) => {
      return globalActionOperation(operation.operationName, { ...operation.variables, ...variables }, operation.namespace);
    };
    return Object.assign(
      async (variables = {}) => {
        const resultVariables = {};
        for (const [name, variable] of Object.entries(operation.variables)) {
          resultVariables[name] = {
            value: variables[name],
            ...variable
          };
        }
        return await globalActionRunner(client.connection, operation.operationName, resultVariables, operation.namespace);
      },
      operation,
      {
        plan,
        processResult
      }
    );
  }
};
function buildStubbedComputedView(operation) {
  return Object.assign(async () => {
    throw new Error(operation.errorMessage);
  }, operation);
}
function buildComputedView(client, operation) {
  const f = operation.variables ? async (variables = {}) => {
    let variablesOptions;
    if (operation.variables) {
      variablesOptions = {};
      for (const [name, variable] of Object.entries(operation.variables)) {
        variablesOptions[name] = {
          value: variables[name],
          ...variable
        };
      }
    }
    return await computedViewRunner(client.connection, operation.gqlFieldName, variablesOptions, operation.namespace);
  } : async () => {
    return await computedViewRunner(client.connection, operation.gqlFieldName, void 0, operation.namespace);
  };
  const plan = function(variables) {
    return computedViewOperation(operation.gqlFieldName, variables, operation.namespace);
  };
  const processResult = (result, opts) => {
    const dataPath = namespaceDataPath([operation.operationName], operation.namespace);
    return processViewResult(result, dataPath, opts?.pause);
  };
  return Object.assign(f, operation, { plan, processResult });
}
function buildModelComputedView(operation) {
  const f = operation.variables ? async function(variables = {}) {
    let resultVariables;
    if (operation.variables) {
      resultVariables = {};
      for (const [name, variable] of Object.entries(operation.variables)) {
        resultVariables[name] = {
          value: variables[name],
          ...variable
        };
      }
    }
    return await computedViewRunner(this.connection, operation.gqlFieldName, resultVariables, operation.namespace);
  } : async function() {
    return await computedViewRunner(this.connection, operation.gqlFieldName, void 0, operation.namespace);
  };
  const plan = function(variables) {
    return computedViewOperation(operation.gqlFieldName, variables, operation.namespace);
  };
  const processResult = (result, opts) => {
    const dataPath = namespaceDataPath([operation.gqlFieldName], operation.namespace);
    return processViewResult(result, dataPath, opts?.pause);
  };
  return Object.assign(f, operation, { plan, processResult });
}
const processViewResult = (result, dataPath, paused) => {
  let resultData = void 0;
  if (result.data) {
    resultData = get(result.data, dataPath);
  }
  const resultError = ErrorWrapper.errorIfDataAbsent(
    { data: result.data, error: result.error, fetching: result.fetching ?? false, stale: result.stale ?? false },
    dataPath,
    paused
  );
  return { data: resultData, error: resultError };
};
function buildInlineComputedView(client, operation) {
  const f = async function(query, variables) {
    return await inlineComputedViewRunner(client.connection, operation.gqlFieldName, query, variables, operation.namespace);
  };
  return Object.assign(f, operation);
}
function buildInlineModelComputedView(operation) {
  const f = async function(query, variables) {
    return await inlineComputedViewRunner(this.connection, operation.gqlFieldName, query, variables, operation.namespace);
  };
  return Object.assign(f, operation);
}
function isInlineComputedView(operation) {
  return operation.functionName == "view";
}
function disambiguateActionParams(action, idValue, variables = {}) {
  if (action.hasAmbiguousIdentifier) {
    if (Object.keys(variables).some((key) => !action.paramOnlyVariables?.includes(key) && key !== action.modelApiIdentifier)) {
      throw Error(`Invalid arguments found in variables. Did you mean to use ({ ${action.modelApiIdentifier}: { ... } })?`);
    }
  }
  let newVariables;
  const idVariable = Object.entries(action.variables).find(([key, value]) => key === "id" && value.type === "GadgetID");
  if (action.acceptsModelInput || action.hasCreateOrUpdateEffect) {
    if (action.modelApiIdentifier in variables && typeof variables[action.modelApiIdentifier] === "object" && variables[action.modelApiIdentifier] !== null || !action.variables[action.modelApiIdentifier]) {
      newVariables = variables;
    } else {
      newVariables = {
        [action.modelApiIdentifier]: {}
      };
      for (const [key, value] of Object.entries(variables)) {
        if (action.paramOnlyVariables?.includes(key)) {
          newVariables[key] = value;
        } else {
          if (idVariable && key === idVariable[0]) {
            newVariables["id"] = value;
          } else {
            newVariables[action.modelApiIdentifier][key] = value;
          }
        }
      }
    }
  } else {
    newVariables = variables;
  }
  newVariables["id"] ?? (newVariables["id"] = idValue);
  return newVariables;
}
function actionArgs(operation, hasId, hasOthers, args) {
  let id = void 0;
  let params = void 0;
  if (hasId) {
    id = args.shift();
  }
  if (hasOthers) {
    params = args.shift();
  }
  const options = args.shift();
  let unambiguousParams = params;
  if (id || params) {
    unambiguousParams = disambiguateActionParams(operation, id, params);
  }
  const resultVariables = {};
  for (const [name, variable] of Object.entries(operation.variables)) {
    resultVariables[name] = {
      value: name == "id" ? id : unambiguousParams?.[name],
      ...variable
    };
  }
  return [resultVariables, options];
}
function forEachMaybeLiveResponse(response, transform) {
  if (Symbol.asyncIterator in response) {
    return {
      [Symbol.asyncIterator]: async function* () {
        for await (const item of response) {
          yield transform(item);
        }
      }
    };
  } else {
    return response.then(transform);
  }
}
const sendDevHarnessStubbedActionEvent = (operation) => {
  try {
    if (typeof window !== "undefined" && typeof CustomEvent === "function") {
      const event = new CustomEvent("gadget:devharness:stubbedActionError", {
        detail: {
          reason: operation.reason,
          action: {
            functionName: operation.functionName,
            actionApiIdentifier: operation.actionApiIdentifier,
            modelApiIdentifier: operation.modelApiIdentifier,
            dataPath: operation.dataPath
          }
        }
      });
      window.dispatchEvent(event);
    }
  } catch (error) {
    console.warn("[gadget] error dispatching gadget dev harness event", error);
  }
};
export {
  buildComputedView,
  buildGlobalAction,
  buildInlineComputedView,
  buildInlineModelComputedView,
  buildModelComputedView,
  buildModelManager,
  buildStubbedComputedView,
  isInlineComputedView
};
//# sourceMappingURL=builder.js.map
