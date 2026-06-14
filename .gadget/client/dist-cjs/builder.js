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
var builder_exports = {};
__export(builder_exports, {
  buildComputedView: () => buildComputedView,
  buildGlobalAction: () => buildGlobalAction,
  buildInlineComputedView: () => buildInlineComputedView,
  buildInlineModelComputedView: () => buildInlineModelComputedView,
  buildModelComputedView: () => buildModelComputedView,
  buildModelManager: () => buildModelManager,
  buildStubbedComputedView: () => buildStubbedComputedView,
  isInlineComputedView: () => isInlineComputedView
});
module.exports = __toCommonJS(builder_exports);
var import_ErrorWrapper = require("./connection/ErrorWrapper.js");
var import_GadgetRecordList = require("./connection/GadgetRecordList.js");
var import_operationBuilders = require("./connection/operationBuilders.js");
var import_operationRunners = require("./connection/operationRunners.js");
var import_support = require("./connection/support.js");
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
            const value = (opts == null ? void 0 : opts.fieldValue) ?? "";
            const dataPath = (0, import_support.namespaceDataPath)([operation.operationName], operation.namespace);
            let data = result.data;
            let records = [];
            if (data) {
              const connection = (0, import_support.get)(result.data, dataPath);
              if (connection) {
                records = (0, import_support.hydrateConnection)(result, connection);
                data = records[0];
              }
            }
            let error = import_ErrorWrapper.ErrorWrapper.forMaybeCombinedError(result.error);
            if (!error) {
              if (records.length > 1) {
                error = import_ErrorWrapper.ErrorWrapper.forClientSideError(
                  (0, import_support.getNonUniqueDataError)(operation.modelApiIdentifier, operation.findByVariableName, value)
                );
              } else if (result.data && !records[0]) {
                error = import_ErrorWrapper.ErrorWrapper.forClientSideError(
                  new import_support.GadgetNotFoundError(`${operation.modelApiIdentifier} record with ${operation.findByVariableName}=${value} not found`)
                );
              }
            }
            return { data, error };
          };
          const plan = (fieldValue, options) => {
            return (0, import_operationBuilders.findOneByFieldOperation)(
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
              return (0, import_operationRunners.findOneByFieldRunner)(
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
            const dataPath = (0, import_support.namespaceDataPath)([operation.operationName], operation.namespace);
            let data = result.data ?? null;
            if (data) {
              const value = (0, import_support.get)(data, dataPath);
              data = value && "id" in value ? (0, import_support.hydrateRecord)(result, value) : null;
            }
            const error = import_ErrorWrapper.ErrorWrapper.forMaybeCombinedError(result.error);
            return { data, error };
          } : (result, opts) => {
            const dataPath = (0, import_support.namespaceDataPath)([operation.operationName], operation.namespace);
            let data = result.data && (0, import_support.get)(result.data, dataPath);
            if (data) {
              data = (0, import_support.hydrateRecord)(result, data);
            }
            const error = import_ErrorWrapper.ErrorWrapper.errorIfDataAbsent({ fetching: false, ...result }, dataPath, opts == null ? void 0 : opts.pause);
            return { data, error };
          };
          const plan = (value, options) => {
            return (0, import_operationBuilders.findOneOperation)(operation.operationName, value, defaultSelection, apiIdentifier, options, operation.namespace);
          };
          modelManagerClass.prototype[operation.type] = Object.assign(
            function(id, options) {
              const response = (0, import_operationRunners.findOneRunner)(
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
          const dataPath = (0, import_support.namespaceDataPath)([operation.operationName], operation.namespace);
          let data = result.data;
          if (data) {
            const connection = (0, import_support.get)(data, dataPath);
            if (connection) {
              const records = (0, import_support.hydrateConnection)(result, connection);
              data = import_GadgetRecordList.GadgetRecordList.boot(modelManagerClass.prototype, records, connection);
            }
          }
          const error = import_ErrorWrapper.ErrorWrapper.errorIfDataAbsent({ fetching: false, ...result }, dataPath, opts == null ? void 0 : opts.pause);
          return { data, error };
        };
        const plan = (options) => {
          return (0, import_operationBuilders.findManyOperation)(pluralApiIdentifier, defaultSelection, apiIdentifier, options, operation.namespace);
        };
        modelManagerClass.prototype.findMany = Object.assign(
          function(options) {
            return (0, import_operationRunners.findManyRunner)(this, pluralApiIdentifier, defaultSelection, apiIdentifier, options, void 0, operation.namespace);
          },
          operation,
          {
            plan,
            processResult
          }
        );
        modelManagerClass.prototype.findAll = function(options) {
          return (0, import_operationRunners.findAllRunner)(this, pluralApiIdentifier, defaultSelection, apiIdentifier, options, operation.namespace);
        };
        modelManagerClass.prototype.iterateAll = function(options) {
          return (0, import_operationRunners.iterateAllRunner)(this, pluralApiIdentifier, defaultSelection, apiIdentifier, options, operation.namespace);
        };
        break;
      }
      case "maybeFindFirst":
      case "findFirst": {
        const allowNull = operation.type === "maybeFindFirst";
        const processResult = allowNull ? (result) => {
          const dataPath = (0, import_support.namespaceDataPath)([operation.operationName], operation.namespace);
          let data = result.data ?? null;
          if (data) {
            const connection = (0, import_support.get)(data, dataPath);
            if (connection) {
              data = (0, import_support.hydrateConnection)(result, connection)[0] ?? null;
            } else {
              data = data[0] ?? null;
            }
          }
          return { data, error: import_ErrorWrapper.ErrorWrapper.forMaybeCombinedError(result.error) };
        } : (result, opts) => {
          const dataPath = (0, import_support.namespaceDataPath)([operation.operationName], operation.namespace);
          let data = result.data;
          if (data) {
            const connection = (0, import_support.get)(data, dataPath);
            if (connection) {
              data = (0, import_support.hydrateConnection)(result, connection)[0];
            } else {
              data = data[0];
            }
          }
          const error = import_ErrorWrapper.ErrorWrapper.errorIfDataAbsent({ fetching: false, ...result }, dataPath, opts == null ? void 0 : opts.pause);
          return { data, error };
        };
        const plan = (options) => {
          return (0, import_operationBuilders.findManyOperation)(
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
            const response = (0, import_operationRunners.findManyRunner)(
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
            return forEachMaybeLiveResponse(response, (list) => (list == null ? void 0 : list[0]) ?? null);
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
          const dataPath = (0, import_support.namespaceDataPath)([operation.operationName], operation.namespace);
          let data = null;
          const rawRecord = result.data && (0, import_support.get)(result.data, dataPath);
          if (rawRecord) {
            data = (0, import_support.hydrateRecord)(result, rawRecord);
          }
          const error = import_ErrorWrapper.ErrorWrapper.forMaybeCombinedError(result.error);
          return { data, error };
        };
        const plan = (options) => {
          return (0, import_operationBuilders.findOneOperation)(operation.operationName, void 0, defaultSelection, apiIdentifier, options, operation.namespace);
        };
        modelManagerClass.prototype.get = Object.assign(
          function(options) {
            return (0, import_operationRunners.findOneRunner)(
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
            var _a;
            let error = import_ErrorWrapper.ErrorWrapper.forMaybeCombinedError(result.error);
            let data = void 0;
            if (result.data && !error) {
              const dataPath = (0, import_support.namespaceDataPath)([operation.operationName], operation.namespace);
              const mutationData = (0, import_support.get)(result.data, dataPath);
              if (mutationData) {
                const isDeleteAction = operation.isDeleter;
                if (!isDeleteAction) {
                  const errors = mutationData["errors"];
                  if (errors && errors[0]) {
                    error = import_ErrorWrapper.ErrorWrapper.forErrorsResponse(errors, (_a = errors[0]) == null ? void 0 : _a.response);
                  } else {
                    data = operation.hasReturnType ? mutationData.results : (0, import_support.hydrateRecordArray)(result, mutationData[operation.modelSelectionField]);
                  }
                } else {
                  data = mutationData;
                }
              }
            }
            return { data, error };
          };
          const plan = (options) => {
            return (0, import_operationBuilders.actionOperation)(
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
              return await (0, import_operationRunners.actionRunner)(
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
            let error = import_ErrorWrapper.ErrorWrapper.forMaybeCombinedError(result.error);
            let data = null;
            if (result.data) {
              const dataPath = (0, import_support.namespaceDataPath)([operation.operationName], operation.namespace);
              const mutationData = (0, import_support.get)(result.data, dataPath);
              if (mutationData) {
                const errors = mutationData["errors"];
                if (errors && errors[0]) {
                  error = import_ErrorWrapper.ErrorWrapper.forErrorsResponse(errors, error == null ? void 0 : error.response);
                } else {
                  data = (0, import_support.processActionResponse)(
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
            return (0, import_operationBuilders.actionOperation)(
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
              return await (0, import_operationRunners.actionRunner)(
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
      var _a;
      let error = import_ErrorWrapper.ErrorWrapper.forMaybeCombinedError(result.error);
      let data = void 0;
      if (result.data) {
        const dataPath = (0, import_support.namespaceDataPath)([operation.operationName], operation.namespace);
        data = (0, import_support.get)(result.data, dataPath);
        if (data) {
          const errors = data.errors;
          data = data.result;
          if (errors && errors[0]) {
            error = import_ErrorWrapper.ErrorWrapper.forErrorsResponse(errors, (_a = errors[0]) == null ? void 0 : _a.response);
          }
        }
      }
      return {
        data,
        error
      };
    };
    const plan = (variables) => {
      return (0, import_operationBuilders.globalActionOperation)(operation.operationName, { ...operation.variables, ...variables }, operation.namespace);
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
        return await (0, import_operationRunners.globalActionRunner)(client.connection, operation.operationName, resultVariables, operation.namespace);
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
    return await (0, import_operationRunners.computedViewRunner)(client.connection, operation.gqlFieldName, variablesOptions, operation.namespace);
  } : async () => {
    return await (0, import_operationRunners.computedViewRunner)(client.connection, operation.gqlFieldName, void 0, operation.namespace);
  };
  const plan = function(variables) {
    return (0, import_operationBuilders.computedViewOperation)(operation.gqlFieldName, variables, operation.namespace);
  };
  const processResult = (result, opts) => {
    const dataPath = (0, import_support.namespaceDataPath)([operation.operationName], operation.namespace);
    return processViewResult(result, dataPath, opts == null ? void 0 : opts.pause);
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
    return await (0, import_operationRunners.computedViewRunner)(this.connection, operation.gqlFieldName, resultVariables, operation.namespace);
  } : async function() {
    return await (0, import_operationRunners.computedViewRunner)(this.connection, operation.gqlFieldName, void 0, operation.namespace);
  };
  const plan = function(variables) {
    return (0, import_operationBuilders.computedViewOperation)(operation.gqlFieldName, variables, operation.namespace);
  };
  const processResult = (result, opts) => {
    const dataPath = (0, import_support.namespaceDataPath)([operation.gqlFieldName], operation.namespace);
    return processViewResult(result, dataPath, opts == null ? void 0 : opts.pause);
  };
  return Object.assign(f, operation, { plan, processResult });
}
const processViewResult = (result, dataPath, paused) => {
  let resultData = void 0;
  if (result.data) {
    resultData = (0, import_support.get)(result.data, dataPath);
  }
  const resultError = import_ErrorWrapper.ErrorWrapper.errorIfDataAbsent(
    { data: result.data, error: result.error, fetching: result.fetching ?? false, stale: result.stale ?? false },
    dataPath,
    paused
  );
  return { data: resultData, error: resultError };
};
function buildInlineComputedView(client, operation) {
  const f = async function(query, variables) {
    return await (0, import_operationRunners.inlineComputedViewRunner)(client.connection, operation.gqlFieldName, query, variables, operation.namespace);
  };
  return Object.assign(f, operation);
}
function buildInlineModelComputedView(operation) {
  const f = async function(query, variables) {
    return await (0, import_operationRunners.inlineComputedViewRunner)(this.connection, operation.gqlFieldName, query, variables, operation.namespace);
  };
  return Object.assign(f, operation);
}
function isInlineComputedView(operation) {
  return operation.functionName == "view";
}
function disambiguateActionParams(action, idValue, variables = {}) {
  var _a;
  if (action.hasAmbiguousIdentifier) {
    if (Object.keys(variables).some((key) => {
      var _a2;
      return !((_a2 = action.paramOnlyVariables) == null ? void 0 : _a2.includes(key)) && key !== action.modelApiIdentifier;
    })) {
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
        if ((_a = action.paramOnlyVariables) == null ? void 0 : _a.includes(key)) {
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
      value: name == "id" ? id : unambiguousParams == null ? void 0 : unambiguousParams[name],
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  buildComputedView,
  buildGlobalAction,
  buildInlineComputedView,
  buildInlineModelComputedView,
  buildModelComputedView,
  buildModelManager,
  buildStubbedComputedView,
  isInlineComputedView
});
//# sourceMappingURL=builder.js.map
