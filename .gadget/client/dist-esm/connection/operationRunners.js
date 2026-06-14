import { filter, pipe, take, toAsyncIterable, toPromise } from "wonka";
import { BackgroundActionHandle } from "./BackgroundActionHandle.js";
import { GadgetRecordList } from "./GadgetRecordList.js";
import {
  actionOperation,
  computedViewOperation,
  enqueueActionOperation,
  findManyOperation,
  findOneByFieldOperation,
  findOneOperation,
  globalActionOperation,
  inlineComputedViewOperation
} from "./operationBuilders.js";
import {
  GadgetErrorGroup,
  GadgetNotFoundError,
  assertMutationSuccess,
  assertNullableOperationSuccess,
  assertOperationSuccess,
  disambiguateActionVariables,
  disambiguateBulkActionVariables,
  gadgetErrorFor,
  get,
  getNonUniqueDataError,
  hydrateConnection,
  hydrateRecord,
  namespaceDataPath,
  processActionResponse,
  processBulkActionResponse,
  setVariableOptionValues
} from "./support.js";
const mapAsyncIterable = (source, mapper) => {
  return {
    [Symbol.asyncIterator]() {
      const iter = source[Symbol.asyncIterator]();
      return {
        async next() {
          const { done, value } = await iter.next();
          return {
            done,
            value: typeof value != "undefined" ? mapper(value) : void 0
          };
        },
        async return(value) {
          return await iter.return?.(value);
        }
      };
    }
  };
};
function maybeLiveStream($result, mapper, options) {
  if (options?.live) {
    return mapAsyncIterable(toAsyncIterable($result), mapper);
  } else {
    const promise = pipe(
      $result,
      filter((result) => !result.stale && !result.hasNext),
      take(1),
      toPromise
    );
    return promise.then((value) => mapper(value));
  }
}
const findOneRunner = (modelManager, operation, id, defaultSelection, modelApiIdentifier, options, throwOnEmptyData = true, namespace) => {
  const plan = findOneOperation(operation, id, defaultSelection, modelApiIdentifier, options, namespace);
  const $results = modelManager.connection.currentClient.query(plan.query, plan.variables);
  return maybeLiveStream(
    $results,
    (response) => {
      const assertSuccess = throwOnEmptyData ? assertOperationSuccess : assertNullableOperationSuccess;
      const dataPath = namespaceDataPath([operation], namespace);
      const record = assertSuccess(response, dataPath);
      return hydrateRecord(response, record);
    },
    options
  );
};
const findOneByFieldRunner = (modelManager, operation, fieldName, fieldValue, defaultSelection, modelApiIdentifier, options, throwOnEmptyData = true, namespace) => {
  const plan = findOneByFieldOperation(operation, fieldName, fieldValue, defaultSelection, modelApiIdentifier, options, namespace);
  const dataPath = namespaceDataPath([operation], namespace);
  const $results = modelManager.connection.currentClient.query(plan.query, plan.variables);
  return maybeLiveStream(
    $results,
    (response) => {
      const connectionObject = assertOperationSuccess(response, dataPath);
      const records = hydrateConnection(response, connectionObject);
      if (records.length > 1) {
        throw getNonUniqueDataError(modelApiIdentifier, fieldName, fieldValue);
      }
      const result = records[0];
      if (!result && throwOnEmptyData) {
        throw new GadgetNotFoundError(`${modelApiIdentifier} record with ${fieldName}=${fieldValue} not found`);
      }
      return result ?? null;
    },
    options
  );
};
const findManyRunner = (modelManager, operation, defaultSelection, modelApiIdentifier, options, throwOnEmptyData, namespace) => {
  const plan = findManyOperation(operation, defaultSelection, modelApiIdentifier, options, namespace);
  const $results = modelManager.connection.currentClient.query(plan.query, plan.variables);
  const dataPath = namespaceDataPath([operation], namespace);
  return maybeLiveStream(
    $results,
    (response) => {
      let connectionObject;
      if (throwOnEmptyData === false) {
        connectionObject = assertNullableOperationSuccess(response, dataPath);
      } else {
        connectionObject = assertOperationSuccess(response, dataPath, throwOnEmptyData);
      }
      const records = hydrateConnection(response, connectionObject);
      return GadgetRecordList.boot(modelManager, records, { options, pageInfo: connectionObject.pageInfo });
    },
    options
  );
};
const findAllRunner = async (modelManager, operation, defaultSelection, modelApiIdentifier, options, namespace) => {
  const { last: _last, before: _before, live: _live, ...cleanOptions } = options ?? {};
  const pageSize = cleanOptions.first ?? 250;
  const allRecords = [];
  let after = cleanOptions.after;
  while (true) {
    const page = await findManyRunner(
      modelManager,
      operation,
      defaultSelection,
      modelApiIdentifier,
      { ...cleanOptions, first: pageSize, after },
      void 0,
      namespace
    );
    allRecords.push(...page);
    if (!page.hasNextPage)
      break;
    after = page.endCursor;
  }
  return allRecords;
};
const iterateAllRunner = (modelManager, operation, defaultSelection, modelApiIdentifier, options, namespace) => {
  const { last: _last, before: _before, live: _live, ...cleanOptions } = options ?? {};
  const pageSize = cleanOptions.first ?? 250;
  return {
    [Symbol.asyncIterator]() {
      let currentPage = null;
      let index = 0;
      let after = cleanOptions.after;
      let done = false;
      return {
        async next() {
          if (currentPage && index < currentPage.length) {
            return { done: false, value: currentPage[index++] };
          }
          if (currentPage && !currentPage.hasNextPage) {
            done = true;
            return { done: true, value: void 0 };
          }
          if (done) {
            return { done: true, value: void 0 };
          }
          if (currentPage) {
            after = currentPage.endCursor;
          }
          currentPage = await findManyRunner(
            modelManager,
            operation,
            defaultSelection,
            modelApiIdentifier,
            { ...cleanOptions, first: pageSize, after },
            void 0,
            namespace
          );
          index = 0;
          if (currentPage.length === 0) {
            done = true;
            return { done: true, value: void 0 };
          }
          return { done: false, value: currentPage[index++] };
        }
      };
    }
  };
};
const actionRunner = async (modelManager, operation, defaultSelection, modelApiIdentifier, modelSelectionField, isBulkAction, variables, options, namespace, hasReturnType) => {
  const plan = actionOperation(
    operation,
    defaultSelection,
    modelApiIdentifier,
    modelSelectionField,
    variables,
    options,
    namespace,
    isBulkAction,
    hasReturnType
  );
  const response = await modelManager.connection.currentClient.mutation(plan.query, plan.variables).toPromise();
  const dataPath = namespaceDataPath([operation], namespace);
  if (!isBulkAction) {
    const mutationTriple = assertMutationSuccess(response, dataPath);
    return processActionResponse(defaultSelection, response, mutationTriple, modelSelectionField, hasReturnType);
  } else {
    const mutationTriple = get(response.data, dataPath);
    const results = processBulkActionResponse(defaultSelection, response, mutationTriple, modelSelectionField, hasReturnType);
    if (mutationTriple.errors) {
      const errors = mutationTriple.errors.map((error) => gadgetErrorFor(error));
      throw new GadgetErrorGroup(errors, results);
    }
    return results;
  }
};
const globalActionRunner = async (connection, operation, variables, namespace) => {
  const plan = globalActionOperation(operation, variables, namespace);
  const response = await connection.currentClient.mutation(plan.query, plan.variables).toPromise();
  const dataPath = namespaceDataPath([operation], namespace);
  return assertMutationSuccess(response, dataPath).result;
};
async function enqueueActionRunner(connection, action, variables, options = {}) {
  const normalizedVariableValues = action.isBulk ? disambiguateBulkActionVariables(action, variables) : disambiguateActionVariables(action, variables);
  const variableOptions = setVariableOptionValues(action.variables, normalizedVariableValues);
  const plan = enqueueActionOperation(action.operationName, variableOptions, action.namespace, options, action.isBulk);
  const response = await connection.currentClient.mutation(plan.query, plan.variables, options).toPromise();
  const dataPath = ["background", ...namespaceDataPath([action.operationName], action.namespace)];
  try {
    const result = assertMutationSuccess(response, dataPath);
    if (action.isBulk) {
      return result.backgroundActions.map((result2) => new BackgroundActionHandle(connection, action, result2.id));
    } else {
      return new BackgroundActionHandle(connection, action, result.backgroundAction.id);
    }
  } catch (error) {
    if ("code" in error && error.code == "GGT_DUPLICATE_BACKGROUND_ACTION_ID" && options?.id && options.onDuplicateID == "ignore") {
      return new BackgroundActionHandle(connection, action, options.id);
    }
    throw error;
  }
}
const inlineComputedViewRunner = async (connection, gqlFieldName, viewQuery, variables, namespace) => {
  const { query, variables: vars } = inlineComputedViewOperation(viewQuery, gqlFieldName, variables, namespace);
  const response = await connection.currentClient.query(query, vars);
  const dataPath = namespaceDataPath([gqlFieldName], namespace);
  return assertOperationSuccess(response, dataPath);
};
const computedViewRunner = async (connection, gqlFieldName, variablesOptions, namespace) => {
  const { query, variables } = computedViewOperation(gqlFieldName, variablesOptions, namespace);
  const response = await connection.currentClient.query(query, variables);
  const dataPath = namespaceDataPath([gqlFieldName], namespace);
  return assertOperationSuccess(response, dataPath);
};
export {
  actionRunner,
  computedViewRunner,
  enqueueActionRunner,
  findAllRunner,
  findManyRunner,
  findOneByFieldRunner,
  findOneRunner,
  globalActionRunner,
  inlineComputedViewRunner,
  iterateAllRunner
};
//# sourceMappingURL=operationRunners.js.map
