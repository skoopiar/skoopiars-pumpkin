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
var operationRunners_exports = {};
__export(operationRunners_exports, {
  actionRunner: () => actionRunner,
  computedViewRunner: () => computedViewRunner,
  enqueueActionRunner: () => enqueueActionRunner,
  findAllRunner: () => findAllRunner,
  findManyRunner: () => findManyRunner,
  findOneByFieldRunner: () => findOneByFieldRunner,
  findOneRunner: () => findOneRunner,
  globalActionRunner: () => globalActionRunner,
  inlineComputedViewRunner: () => inlineComputedViewRunner,
  iterateAllRunner: () => iterateAllRunner
});
module.exports = __toCommonJS(operationRunners_exports);
var import_wonka = require("wonka");
var import_BackgroundActionHandle = require("./BackgroundActionHandle.js");
var import_GadgetRecordList = require("./GadgetRecordList.js");
var import_operationBuilders = require("./operationBuilders.js");
var import_support = require("./support.js");
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
          var _a;
          return await ((_a = iter.return) == null ? void 0 : _a.call(iter, value));
        }
      };
    }
  };
};
function maybeLiveStream($result, mapper, options) {
  if (options == null ? void 0 : options.live) {
    return mapAsyncIterable((0, import_wonka.toAsyncIterable)($result), mapper);
  } else {
    const promise = (0, import_wonka.pipe)(
      $result,
      (0, import_wonka.filter)((result) => !result.stale && !result.hasNext),
      (0, import_wonka.take)(1),
      import_wonka.toPromise
    );
    return promise.then((value) => mapper(value));
  }
}
const findOneRunner = (modelManager, operation, id, defaultSelection, modelApiIdentifier, options, throwOnEmptyData = true, namespace) => {
  const plan = (0, import_operationBuilders.findOneOperation)(operation, id, defaultSelection, modelApiIdentifier, options, namespace);
  const $results = modelManager.connection.currentClient.query(plan.query, plan.variables);
  return maybeLiveStream(
    $results,
    (response) => {
      const assertSuccess = throwOnEmptyData ? import_support.assertOperationSuccess : import_support.assertNullableOperationSuccess;
      const dataPath = (0, import_support.namespaceDataPath)([operation], namespace);
      const record = assertSuccess(response, dataPath);
      return (0, import_support.hydrateRecord)(response, record);
    },
    options
  );
};
const findOneByFieldRunner = (modelManager, operation, fieldName, fieldValue, defaultSelection, modelApiIdentifier, options, throwOnEmptyData = true, namespace) => {
  const plan = (0, import_operationBuilders.findOneByFieldOperation)(operation, fieldName, fieldValue, defaultSelection, modelApiIdentifier, options, namespace);
  const dataPath = (0, import_support.namespaceDataPath)([operation], namespace);
  const $results = modelManager.connection.currentClient.query(plan.query, plan.variables);
  return maybeLiveStream(
    $results,
    (response) => {
      const connectionObject = (0, import_support.assertOperationSuccess)(response, dataPath);
      const records = (0, import_support.hydrateConnection)(response, connectionObject);
      if (records.length > 1) {
        throw (0, import_support.getNonUniqueDataError)(modelApiIdentifier, fieldName, fieldValue);
      }
      const result = records[0];
      if (!result && throwOnEmptyData) {
        throw new import_support.GadgetNotFoundError(`${modelApiIdentifier} record with ${fieldName}=${fieldValue} not found`);
      }
      return result ?? null;
    },
    options
  );
};
const findManyRunner = (modelManager, operation, defaultSelection, modelApiIdentifier, options, throwOnEmptyData, namespace) => {
  const plan = (0, import_operationBuilders.findManyOperation)(operation, defaultSelection, modelApiIdentifier, options, namespace);
  const $results = modelManager.connection.currentClient.query(plan.query, plan.variables);
  const dataPath = (0, import_support.namespaceDataPath)([operation], namespace);
  return maybeLiveStream(
    $results,
    (response) => {
      let connectionObject;
      if (throwOnEmptyData === false) {
        connectionObject = (0, import_support.assertNullableOperationSuccess)(response, dataPath);
      } else {
        connectionObject = (0, import_support.assertOperationSuccess)(response, dataPath, throwOnEmptyData);
      }
      const records = (0, import_support.hydrateConnection)(response, connectionObject);
      return import_GadgetRecordList.GadgetRecordList.boot(modelManager, records, { options, pageInfo: connectionObject.pageInfo });
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
  const plan = (0, import_operationBuilders.actionOperation)(
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
  const dataPath = (0, import_support.namespaceDataPath)([operation], namespace);
  if (!isBulkAction) {
    const mutationTriple = (0, import_support.assertMutationSuccess)(response, dataPath);
    return (0, import_support.processActionResponse)(defaultSelection, response, mutationTriple, modelSelectionField, hasReturnType);
  } else {
    const mutationTriple = (0, import_support.get)(response.data, dataPath);
    const results = (0, import_support.processBulkActionResponse)(defaultSelection, response, mutationTriple, modelSelectionField, hasReturnType);
    if (mutationTriple.errors) {
      const errors = mutationTriple.errors.map((error) => (0, import_support.gadgetErrorFor)(error));
      throw new import_support.GadgetErrorGroup(errors, results);
    }
    return results;
  }
};
const globalActionRunner = async (connection, operation, variables, namespace) => {
  const plan = (0, import_operationBuilders.globalActionOperation)(operation, variables, namespace);
  const response = await connection.currentClient.mutation(plan.query, plan.variables).toPromise();
  const dataPath = (0, import_support.namespaceDataPath)([operation], namespace);
  return (0, import_support.assertMutationSuccess)(response, dataPath).result;
};
async function enqueueActionRunner(connection, action, variables, options = {}) {
  const normalizedVariableValues = action.isBulk ? (0, import_support.disambiguateBulkActionVariables)(action, variables) : (0, import_support.disambiguateActionVariables)(action, variables);
  const variableOptions = (0, import_support.setVariableOptionValues)(action.variables, normalizedVariableValues);
  const plan = (0, import_operationBuilders.enqueueActionOperation)(action.operationName, variableOptions, action.namespace, options, action.isBulk);
  const response = await connection.currentClient.mutation(plan.query, plan.variables, options).toPromise();
  const dataPath = ["background", ...(0, import_support.namespaceDataPath)([action.operationName], action.namespace)];
  try {
    const result = (0, import_support.assertMutationSuccess)(response, dataPath);
    if (action.isBulk) {
      return result.backgroundActions.map((result2) => new import_BackgroundActionHandle.BackgroundActionHandle(connection, action, result2.id));
    } else {
      return new import_BackgroundActionHandle.BackgroundActionHandle(connection, action, result.backgroundAction.id);
    }
  } catch (error) {
    if ("code" in error && error.code == "GGT_DUPLICATE_BACKGROUND_ACTION_ID" && (options == null ? void 0 : options.id) && options.onDuplicateID == "ignore") {
      return new import_BackgroundActionHandle.BackgroundActionHandle(connection, action, options.id);
    }
    throw error;
  }
}
const inlineComputedViewRunner = async (connection, gqlFieldName, viewQuery, variables, namespace) => {
  const { query, variables: vars } = (0, import_operationBuilders.inlineComputedViewOperation)(viewQuery, gqlFieldName, variables, namespace);
  const response = await connection.currentClient.query(query, vars);
  const dataPath = (0, import_support.namespaceDataPath)([gqlFieldName], namespace);
  return (0, import_support.assertOperationSuccess)(response, dataPath);
};
const computedViewRunner = async (connection, gqlFieldName, variablesOptions, namespace) => {
  const { query, variables } = (0, import_operationBuilders.computedViewOperation)(gqlFieldName, variablesOptions, namespace);
  const response = await connection.currentClient.query(query, variables);
  const dataPath = (0, import_support.namespaceDataPath)([gqlFieldName], namespace);
  return (0, import_support.assertOperationSuccess)(response, dataPath);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
});
//# sourceMappingURL=operationRunners.js.map
