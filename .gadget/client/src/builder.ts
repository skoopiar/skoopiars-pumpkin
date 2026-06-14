import { ErrorWrapper } from "./connection/ErrorWrapper.js";
import type { GadgetConnection } from "./connection/GadgetConnection.js";
import { GadgetRecordList } from "./connection/GadgetRecordList.js";
import {
  actionOperation,
  computedViewOperation,
  findManyOperation,
  findOneByFieldOperation,
  findOneOperation,
  globalActionOperation,
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
  iterateAllRunner,
} from "./connection/operationRunners.js";
import {
  GadgetNotFoundError,
  get,
  getNonUniqueDataError,
  hydrateConnection,
  hydrateRecord,
  hydrateRecordArray,
  namespaceDataPath,
  processActionResponse,
} from "./connection/support.js";
import type {
  ActionFunction,
  ActionFunctionMetadata,
  AnyActionFunction,
  AnyModelFinderMetadata,
  AnyModelManager,
  BaseFindOptions,
  BulkActionFunction,
  FieldSelection,
  FindFirstFunction,
  FindManyFunction,
  FindManyOptions,
  FindOneFunction,
  GadgetRecord,
  GetFunction,
  GlobalActionFunction,
  ProcessResultFunction,
  VariablesOptions,
  ViewFunction,
  ViewFunctionWithoutVariables,
  ViewFunctionWithVariables,
} from "@gadgetinc/core";
import type { CombinedError } from "@urql/core";

/**
 * The metadata that we need for building the runtime version of a finderoperation
 * Excludes the type-time only keys
 */
export type AnyModelFinderRuntimeMetadata = Omit<AnyModelFinderMetadata, "schemaType" | "optionsType" | "variablesType" | "selectionType">;

/**
 * The metadata that we need for building the runtime version of a finder operation
 * Excludes the type-time only keys
 */
export type AnyActionFunctionRuntimeMetadata = Omit<
  ActionFunctionMetadata<any, any, any, any, any, any>,
  "schemaType" | "optionsType" | "variablesType" | "selectionType" | "plan" | "processResult"
>;

export type FindOneOperation = {
  type: "findOne";
  findByVariableName: "id";
} & AnyModelFinderRuntimeMetadata;

export type MaybeFindOneOperation = {
  type: "maybeFindOne";
  findByVariableName: "id";
} & AnyModelFinderRuntimeMetadata;

export type FindManyOperation = {
  type: "findMany";
} & AnyModelFinderRuntimeMetadata;

export type FindFirstOperation = {
  type: "findFirst";
} & AnyModelFinderRuntimeMetadata;

export type MaybeFindFirstOperation = {
  type: "maybeFindFirst";
} & AnyModelFinderRuntimeMetadata;

export type FindOneByFieldOperation = {
  type: "findOne";
  findByVariableName: string;
  findByField: string;
  functionName: string;
} & AnyModelFinderRuntimeMetadata;

export type MaybeFindOneByFieldOperation = {
  type: "maybeFindOne";
  findByVariableName: string;
  findByField: string;
  functionName: string;
} & AnyModelFinderRuntimeMetadata;

export type SingletonGetOperation = {
  type: "get";
} & AnyModelFinderRuntimeMetadata;

export type ActionOperation = {
  type: "action";
  functionName: string;
  isBulk: false;
  isDeleter: boolean;
} & AnyActionFunctionRuntimeMetadata;

export type BulkActionOperation = {
  type: "action";
  functionName: string;
  isBulk: true;
  singleActionFunctionName: string;
  isDeleter: boolean;
} & AnyActionFunctionRuntimeMetadata;

export type GlobalActionOperation = {
  type: "globalAction";
  functionName: string;
  operationName: string;
  operationReturnType?: string;
  namespace: string | string[] | null;
  variables: VariablesOptions;
};

type ComputedViewOperationRuntimeMetadata<VariablesT, ResultT> = Omit<
  ViewFunction<VariablesT, ResultT>,
  "plan" | "processResult" | "resultType" | "variablesType"
>;

export type ComputedViewOperation<VariablesT = any, ResultT = any> = ComputedViewOperationRuntimeMetadata<VariablesT, ResultT> & {
  type: "computedView";
  operationName: string;
  functionName: string; // Same as operationName, but required by ModelManagers
  gqlFieldName: string; // The field name of the operation in GQL schema (includes model for model views)
  namespace: string | string[] | null;
  /**
   * The list of GraphQL typenames that contribute to this view's expression
   * The view should be invalidated and refreshed client side when changes are made to these typenames
   */
  referencedTypenames?: string[];
  /**
   * List of model keys that contribute to this view's expression
   */
  referencedModelKeys?: string[];
  variables?: VariablesOptions;
};

export type StubbedComputedViewOperation = {
  type: "stubbedComputedView";
  operationName: string;
  functionName: string; // Same as operationName, but required by ModelManagers
  gqlFieldName: string; // The field name of the operation in GQL schema (includes model for model views)
  namespace: string | string[] | null;
  errorMessage: string;
};

export type StubbedActionReason = "MissingApiTrigger";

export type StubbedActionOperation = {
  type: "stubbedAction";
  functionName: string;
  operationName?: string;
  errorMessage: string;
  actionApiIdentifier: string;
  modelApiIdentifier?: string;
  variables: VariablesOptions;
  reason: StubbedActionReason;
  dataPath: string;
};

export type ModelManagerOperation =
  | FindOneOperation
  | MaybeFindOneOperation
  | FindManyOperation
  | FindFirstOperation
  | MaybeFindFirstOperation
  | FindOneByFieldOperation
  | MaybeFindOneByFieldOperation
  | SingletonGetOperation
  | ActionOperation
  | BulkActionOperation
  | StubbedActionOperation
  | ComputedViewOperation
  | StubbedComputedViewOperation;

/**
 * Construct a model manager class out of the metadatas generated on the server
 **/
export const buildModelManager = (
  apiIdentifier: string,
  pluralApiIdentifier: string,
  defaultSelection: FieldSelection,
  operationGroup: ModelManagerOperation[] | readonly ModelManagerOperation[]
): AnyModelManager => {
  const modelManagerClass = class {
    constructor(public readonly connection: GadgetConnection) {}
  } as unknown as { prototype: AnyModelManager; new (connection: GadgetConnection): AnyModelManager };
  Object.defineProperty(modelManagerClass, "name", { value: `${apiIdentifier}Manager` });

  for (const operation of operationGroup) {
    switch (operation.type) {
      case "maybeFindOne":
      case "findOne": {
        const allowNull = operation.type.startsWith("maybe");

        if ("functionName" in operation) {
          const processResult: ProcessResultFunction = (result, opts) => {
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

          const plan: FindOneFunction<any, any, any, any>["plan"] = (fieldValue: string, options?: BaseFindOptions) => {
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

          (modelManagerClass.prototype as any)[operation.functionName] = Object.assign(
            function (this: AnyModelManager, value: string, options?: BaseFindOptions) {
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
            operation as unknown as AnyModelFinderMetadata,
            {
              plan,
              processResult,
            }
          );
        } else {
          const processResult: ProcessResultFunction = allowNull
            ? (result) => {
                const dataPath = namespaceDataPath([operation.operationName], operation.namespace);
                let data = result.data ?? null;

                if (data) {
                  const value = get(data, dataPath);
                  data = value && "id" in value ? hydrateRecord(result, value) : null;
                }

                const error = ErrorWrapper.forMaybeCombinedError(result.error);

                return { data, error };
              }
            : (result, opts) => {
                const dataPath = namespaceDataPath([operation.operationName], operation.namespace);

                let data = result.data && get(result.data, dataPath);
                if (data) {
                  data = hydrateRecord(result, data);
                }
                const error = ErrorWrapper.errorIfDataAbsent({ fetching: false, ...result }, dataPath, opts?.pause);
                return { data, error };
              };

          const plan: FindOneFunction<any, any, any, any>["plan"] = (value: string, options?: BaseFindOptions) => {
            return findOneOperation(operation.operationName, value, defaultSelection, apiIdentifier, options, operation.namespace);
          };

          modelManagerClass.prototype[operation.type] = Object.assign(
            function (this: AnyModelManager, id: string, options?: BaseFindOptions) {
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
              return forEachMaybeLiveResponse(response, (record: GadgetRecord<any>) => (record.isEmpty() ? null : record));
            },
            operation as unknown as AnyModelFinderMetadata,
            {
              plan,
              processResult,
            }
          );
        }
        break;
      }
      case "findMany": {
        const processResult: ProcessResultFunction = (result, opts) => {
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

        const plan: FindManyFunction<any, any, any, any>["plan"] = (options?: FindManyOptions) => {
          return findManyOperation(pluralApiIdentifier, defaultSelection, apiIdentifier, options, operation.namespace);
        };

        modelManagerClass.prototype.findMany = Object.assign(
          function (this: AnyModelManager, options?: FindManyOptions) {
            return findManyRunner(this, pluralApiIdentifier, defaultSelection, apiIdentifier, options, undefined, operation.namespace);
          },
          operation as unknown as AnyModelFinderMetadata,
          {
            plan,
            processResult,
          }
        );

        (modelManagerClass.prototype as any).findAll = function (this: AnyModelManager, options?: FindManyOptions) {
          return findAllRunner(this, pluralApiIdentifier, defaultSelection, apiIdentifier, options, operation.namespace);
        };

        (modelManagerClass.prototype as any).iterateAll = function (this: AnyModelManager, options?: FindManyOptions) {
          return iterateAllRunner(this, pluralApiIdentifier, defaultSelection, apiIdentifier, options, operation.namespace);
        };
        break;
      }
      case "maybeFindFirst":
      case "findFirst": {
        const allowNull = operation.type === "maybeFindFirst";

        const processResult: ProcessResultFunction = allowNull
          ? (result) => {
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
            }
          : (result, opts) => {
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

        const plan: FindFirstFunction<any, any, any, any>["plan"] = (options?: BaseFindOptions) => {
          return findManyOperation(
            pluralApiIdentifier,
            defaultSelection,
            apiIdentifier,
            {
              ...options,
              first: 1,
              last: undefined,
              before: undefined,
              after: undefined,
            },
            operation.namespace
          );
        };

        modelManagerClass.prototype[operation.type] = Object.assign(
          function (this: AnyModelManager, options?: BaseFindOptions) {
            const response = findManyRunner(
              this,
              pluralApiIdentifier,
              defaultSelection,
              apiIdentifier,
              {
                ...options,
                first: 1,
                last: undefined,
                before: undefined,
                after: undefined,
              },
              !allowNull,
              operation.namespace
            );
            return forEachMaybeLiveResponse(response, (list: GadgetRecord<any>[]) => list?.[0] ?? null);
          },
          operation as unknown as AnyModelFinderMetadata,
          {
            plan,
            processResult,
          }
        );
        break;
      }
      case "get": {
        const processResult: ProcessResultFunction = (result) => {
          const dataPath = namespaceDataPath([operation.operationName], operation.namespace);
          let data = null;
          const rawRecord = result.data && get(result.data, dataPath);
          if (rawRecord) {
            data = hydrateRecord(result, rawRecord);
          }
          const error = ErrorWrapper.forMaybeCombinedError(result.error);
          return { data, error };
        };

        const plan: GetFunction<any, any, any, any>["plan"] = (options?: BaseFindOptions) => {
          return findOneOperation(operation.operationName, undefined, defaultSelection, apiIdentifier, options, operation.namespace);
        };

        (modelManagerClass.prototype as any).get = Object.assign(
          function (this: AnyModelManager, options?: BaseFindOptions) {
            return findOneRunner(
              this,
              operation.operationName,
              undefined,
              defaultSelection,
              apiIdentifier,
              options,
              undefined,
              operation.namespace
            );
          },
          operation as unknown as AnyModelFinderMetadata,
          {
            plan,
            processResult,
          }
        );
        break;
      }
      case "action": {
        if (operation.isBulk) {
          const bulkInvokedByIDOnly = !!operation.variables["ids"];
          const processResult: ProcessResultFunction = (result) => {
            let error = ErrorWrapper.forMaybeCombinedError(result.error);
            let data = undefined;
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
                    data = operation.hasReturnType
                      ? mutationData.results
                      : hydrateRecordArray(result, mutationData[operation.modelSelectionField]);
                  }
                } else {
                  // Delete action
                  data = mutationData;
                }
              }
            }

            return { data, error };
          };
          const plan: BulkActionFunction<any, any, any, any, any>["plan"] = (options?: BaseFindOptions) => {
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

          (modelManagerClass.prototype as any)[operation.functionName] = Object.assign(
            async function (this: AnyModelManager, inputs: string[] | Record<string, unknown>[], options?: BaseFindOptions) {
              let variables;
              if (bulkInvokedByIDOnly) {
                variables = {
                  ids: {
                    ...operation.variables["ids"],
                    value: inputs,
                  },
                };
              } else {
                variables = {
                  inputs: {
                    ...operation.variables["inputs"],
                    value: (inputs as Record<string, unknown>[]).map((input) =>
                      disambiguateActionParams((this as any)[(operation as BulkActionOperation).singleActionFunctionName], undefined, input)
                    ),
                  },
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
                operation.hasReturnType as any
              );
            },
            operation as unknown as AnyModelFinderMetadata,
            {
              plan,
              processResult,
              get singleAction() {
                return (modelManagerClass.prototype as any)[(operation as BulkActionOperation).singleActionFunctionName];
              },
            } as Pick<AnyActionFunction, "plan" | "processResult">
          );
        } else {
          const hasId = !!operation.variables["id"];
          const hasOthers = Object.keys(operation.variables).filter((key) => key != "id").length > 0;
          const processResult: ProcessResultFunction = (result) => {
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
              error,
            };
          };

          const plan: ActionFunction<any, any, any, any, any>["plan"] = (options?: BaseFindOptions) => {
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

          (modelManagerClass.prototype as any)[operation.functionName] = Object.assign(
            async function (this: AnyModelManager, ...args: (string | Record<string, unknown> | BaseFindOptions)[]) {
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
                operation.hasReturnType as any
              );
            },
            operation as unknown as AnyModelFinderMetadata,
            {
              plan,
              processResult,
            }
          );
        }
        break;
      }
      case "stubbedAction": {
        (modelManagerClass.prototype as any)[operation.functionName] = Object.assign(
          function (this: AnyModelManager, ..._args: any) {
            sendDevHarnessStubbedActionEvent(operation);
            throw new Error(operation.errorMessage);
          },
          operation as unknown as AnyModelFinderMetadata
        );
        break;
      }
      case "computedView": {
        (modelManagerClass.prototype as any)[operation.operationName] = isInlineComputedView(operation)
          ? buildInlineModelComputedView(operation)
          : buildModelComputedView(operation);
        break;
      }
      case "stubbedComputedView": {
        (modelManagerClass.prototype as any)[operation.operationName] = buildStubbedComputedView(operation);
        break;
      }
    }
  }

  return modelManagerClass as any;
};

export const buildGlobalAction = (
  client: { connection: GadgetConnection },
  operation: GlobalActionOperation | StubbedActionOperation
): AnyActionFunction => {
  if (operation.type == "stubbedAction") {
    return Object.assign((..._args: any[]) => {
      sendDevHarnessStubbedActionEvent(operation);
      throw new Error(operation.errorMessage);
    }, operation) as any;
  } else {
    const processResult: ProcessResultFunction = (result) => {
      let error = ErrorWrapper.forMaybeCombinedError(result.error);
      let data = undefined;
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
        error,
      };
    };

    const plan: GlobalActionFunction<any>["plan"] = (variables?: VariablesOptions) => {
      return globalActionOperation(operation.operationName, { ...operation.variables, ...variables }, operation.namespace);
    };

    return Object.assign(
      async (variables: Record<string, any> = {}) => {
        const resultVariables: VariablesOptions = {};
        for (const [name, variable] of Object.entries(operation.variables)) {
          resultVariables[name] = {
            value: variables[name],
            ...variable,
          };
        }

        return await globalActionRunner(client.connection, operation.operationName, resultVariables, operation.namespace);
      },
      operation,
      {
        plan,
        processResult,
      } as Pick<AnyActionFunction, "plan" | "processResult">
    ) as any;
  }
};

export function buildStubbedComputedView(operation: StubbedComputedViewOperation): () => Promise<never> {
  return Object.assign(async () => {
    throw new Error(operation.errorMessage);
  }, operation);
}

export function buildComputedView<VariablesT, ResultT, Op extends ComputedViewOperation<VariablesT, ResultT>>(
  client: { connection: GadgetConnection },
  operation: Op
): Op extends { variables: VariablesOptions } ? ViewFunctionWithVariables<VariablesT, ResultT> : ViewFunctionWithoutVariables<ResultT>;
export function buildComputedView<VariablesT, ResultT>(
  client: { connection: GadgetConnection },
  operation: ComputedViewOperation<VariablesT, ResultT>
): ViewFunctionWithVariables<VariablesT, ResultT> | ViewFunctionWithoutVariables<ResultT> {
  const f = operation.variables
    ? async (variables: Record<string, any> = {}) => {
        let variablesOptions: VariablesOptions | undefined;
        if (operation.variables) {
          variablesOptions = {};
          for (const [name, variable] of Object.entries(operation.variables)) {
            variablesOptions[name] = {
              value: variables[name],
              ...variable,
            };
          }
        }
        return await computedViewRunner(client.connection, operation.gqlFieldName, variablesOptions, operation.namespace);
      }
    : async () => {
        return await computedViewRunner(client.connection, operation.gqlFieldName, undefined, operation.namespace);
      };

  const plan: ViewFunctionWithVariables<VariablesT, ResultT>["plan"] = function (variables: VariablesOptions) {
    return computedViewOperation(operation.gqlFieldName, variables, operation.namespace);
  };

  const processResult: ViewFunctionWithVariables<VariablesT, ResultT>["processResult"] = (result, opts) => {
    const dataPath = namespaceDataPath([operation.operationName], operation.namespace);
    return processViewResult(result, dataPath, opts?.pause);
  };

  return Object.assign(f, operation, { plan, processResult }) as any;
}

export function buildModelComputedView<ResultT>(operation: ComputedViewOperation<any, ResultT>): ViewFunctionWithoutVariables<ResultT>;
export function buildModelComputedView<VariablesT, ResultT>(
  operation: ComputedViewOperation<VariablesT, ResultT>
): ViewFunctionWithVariables<VariablesT, ResultT>;
export function buildModelComputedView<VariablesT, ResultT>(
  operation: ComputedViewOperation<VariablesT, ResultT>
): ViewFunctionWithVariables<VariablesT, ResultT> | ViewFunctionWithoutVariables<ResultT> {
  const f = operation.variables
    ? async function (this: AnyModelManager, variables: Record<string, any> = {}) {
        let resultVariables: VariablesOptions | undefined;
        if (operation.variables) {
          resultVariables = {};
          for (const [name, variable] of Object.entries(operation.variables)) {
            resultVariables[name] = {
              value: variables[name],
              ...variable,
            };
          }
        }
        return await computedViewRunner(this.connection, operation.gqlFieldName, resultVariables, operation.namespace);
      }
    : async function (this: AnyModelManager) {
        return await computedViewRunner(this.connection, operation.gqlFieldName, undefined, operation.namespace);
      };

  const plan: ViewFunctionWithVariables<VariablesT, ResultT>["plan"] = function (variables: VariablesOptions) {
    return computedViewOperation(operation.gqlFieldName, variables, operation.namespace);
  };

  const processResult: ViewFunctionWithVariables<VariablesT, ResultT>["processResult"] = (result, opts) => {
    const dataPath = namespaceDataPath([operation.gqlFieldName], operation.namespace);
    return processViewResult(result, dataPath, opts?.pause);
  };

  return Object.assign(f, operation, { plan, processResult }) as any;
}

const processViewResult = (
  result: { data?: any; error?: CombinedError; fetching?: boolean; stale?: boolean },
  dataPath: string[],
  paused?: boolean
) => {
  let resultData = undefined;
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

export function buildInlineComputedView(client: { connection: GadgetConnection }, operation: ComputedViewOperation) {
  const f = async function (query: string, variables?: Record<string, any>) {
    return await inlineComputedViewRunner(client.connection, operation.gqlFieldName, query, variables, operation.namespace);
  };

  return Object.assign(f, operation) as any;
}

export function buildInlineModelComputedView(operation: ComputedViewOperation) {
  const f = async function (this: AnyModelManager, query: string, variables?: Record<string, any>) {
    return await inlineComputedViewRunner(this.connection, operation.gqlFieldName, query, variables, operation.namespace);
  };
  return Object.assign(f, operation) as any;
}

export function isInlineComputedView(operation: ComputedViewOperation): boolean {
  return operation.functionName == "view";
}

/**
 * Maps the variables passed from a call to the client to the variables the GraphQL API is expecting
 *
 * For actions which accept a model input, the GraphQL API expects the variables to be passed like
 *  id: 123,
 *  widget: { fieldA: "a", fieldB: "b" },
 *  extraParam: "C"
 *
 * For convenience, we allow actions to be invoked like
 *   await api.widget.update("123", {fieldA: "a", fieldB: "b", extraParam: "C"})
 *
 * This function re-nests the model input variables under a key for the model's api identifier, being careful to leave root level params alone.
 **/
function disambiguateActionParams<Action extends AnyActionFunctionRuntimeMetadata>(
  action: Action,
  idValue: string | undefined,
  variables: Record<string, any> = {}
): Record<string, any> {
  if (action.hasAmbiguousIdentifier) {
    if (Object.keys(variables).some((key) => !action.paramOnlyVariables?.includes(key) && key !== action.modelApiIdentifier)) {
      throw Error(`Invalid arguments found in variables. Did you mean to use ({ ${action.modelApiIdentifier}: { ... } })?`);
    }
  }

  let newVariables: Record<string, any>;
  const idVariable = Object.entries(action.variables).find(([key, value]) => key === "id" && value.type === "GadgetID");

  if ((action as any).acceptsModelInput || action.hasCreateOrUpdateEffect) {
    if (
      (action.modelApiIdentifier in variables &&
        typeof variables[action.modelApiIdentifier] === "object" &&
        variables[action.modelApiIdentifier] !== null) ||
      !action.variables[action.modelApiIdentifier]
    ) {
      newVariables = variables;
    } else {
      newVariables = {
        [action.modelApiIdentifier]: {},
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

  newVariables["id"] ??= idValue as any;

  return newVariables;
}

/** Split out the arguments to a call to an action */
function actionArgs(
  operation: AnyActionFunctionRuntimeMetadata,
  hasId: boolean,
  hasOthers: boolean,
  args: (string | Record<string, unknown> | BaseFindOptions)[]
): [variables: VariablesOptions, options?: BaseFindOptions] {
  let id: string | undefined = undefined;
  let params: Record<string, unknown> | undefined = undefined;

  if (hasId) {
    id = args.shift() as string | undefined;
  }
  if (hasOthers) {
    params = args.shift() as Record<string, unknown> | undefined;
  }
  const options = args.shift() as BaseFindOptions;

  let unambiguousParams = params;
  if (id || params) {
    unambiguousParams = disambiguateActionParams(operation, id, params);
  }

  const resultVariables: VariablesOptions = {};
  for (const [name, variable] of Object.entries(operation.variables)) {
    resultVariables[name] = {
      value: name == "id" ? id : unambiguousParams?.[name],
      ...variable,
    };
  }

  return [resultVariables, options];
}

/** Given a result from a finder function that is either a promise for one value or an async iterator over many values, transform each value using a function, returning the same cardinality as the input */
function forEachMaybeLiveResponse<Item, Result>(response: AsyncIterable<Item>, transform: (item: Item) => Result): AsyncIterable<Result>;
function forEachMaybeLiveResponse<Item, Result>(response: Promise<Item>, transform: (item: Item) => Result): Promise<Result>;
function forEachMaybeLiveResponse<Item, Result>(
  response: AsyncIterable<Item> | Promise<Item>,
  transform: (item: Item) => Result
): AsyncIterable<Result> | Promise<Result> {
  if (Symbol.asyncIterator in response) {
    return {
      [Symbol.asyncIterator]: async function* () {
        for await (const item of response) {
          yield transform(item);
        }
      },
    };
  } else {
    return response.then(transform);
  }
}

const sendDevHarnessStubbedActionEvent = (operation: StubbedActionOperation) => {
  try {
    if (typeof window !== "undefined" && typeof CustomEvent === "function") {
      const event = new CustomEvent("gadget:devharness:stubbedActionError", {
        detail: {
          reason: operation.reason,
          action: {
            functionName: operation.functionName,
            actionApiIdentifier: operation.actionApiIdentifier,
            modelApiIdentifier: operation.modelApiIdentifier,
            dataPath: operation.dataPath,
          },
        },
      });
      window.dispatchEvent(event);
    }
  } catch (error: any) {
    // gracefully handle environments where CustomEvent is misbehaved like jsdom
    console.warn("[gadget] error dispatching gadget dev harness event", error);
  }
};
