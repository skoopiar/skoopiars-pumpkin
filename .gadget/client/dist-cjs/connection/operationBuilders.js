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
var operationBuilders_exports = {};
__export(operationBuilders_exports, {
  actionOperation: () => actionOperation,
  actionResultOperation: () => actionResultOperation,
  backgroundActionResultOperation: () => backgroundActionResultOperation,
  cancelBackgroundActionOperation: () => cancelBackgroundActionOperation,
  computedViewOperation: () => computedViewOperation,
  enqueueActionOperation: () => enqueueActionOperation,
  expandSelection: () => expandSelection,
  findManyOperation: () => findManyOperation,
  findOneByFieldOperation: () => findOneByFieldOperation,
  findOneOperation: () => findOneOperation,
  getBackgroundActionStatusOperation: () => getBackgroundActionStatusOperation,
  globalActionOperation: () => globalActionOperation,
  graphqlizeBackgroundOptions: () => graphqlizeBackgroundOptions,
  inlineComputedViewOperation: () => inlineComputedViewOperation
});
module.exports = __toCommonJS(operationBuilders_exports);
var import_tiny_graphql_query_compiler = require("tiny-graphql-query-compiler");
var import_support = require("./support.js");
var import_utils = require("./utils.js");
const $args = Symbol.for("gadget/fieldArgs");
const expandSelection = (selection, defaultSelection) => {
  const result = {};
  for (const [key, value] of Object.entries(selection)) {
    const defaultValue = defaultSelection[key];
    if (value === true && defaultValue != null && typeof defaultValue === "object") {
      result[key] = defaultValue;
    } else {
      result[key] = value;
    }
  }
  return result;
};
const selectionValueToBuilderValue = (value) => {
  if (typeof value !== "object" || value === null) {
    return value;
  }
  const fieldArgs = value[$args];
  const stringKeys = Object.keys(value);
  const nestedSelection = {};
  for (const key of stringKeys) {
    nestedSelection[key] = selectionValueToBuilderValue(value[key]);
  }
  if (fieldArgs != null) {
    return stringKeys.length > 0 ? (0, import_tiny_graphql_query_compiler.Call)(fieldArgs, nestedSelection) : (0, import_tiny_graphql_query_compiler.Call)(fieldArgs);
  }
  return nestedSelection;
};
const fieldSelectionToQueryCompilerFields = (selection, includeTypename = false) => {
  const output = {};
  for (const [key, value] of Object.entries(selection)) {
    output[key] = selectionValueToBuilderValue(value);
  }
  if (includeTypename)
    output.__typename = true;
  return output;
};
const directivesForOptions = (options) => {
  if (options == null ? void 0 : options.live)
    return ["@live"];
  return void 0;
};
const findOneOperation = (operation, id, defaultSelection, modelApiIdentifier, options, namespace) => {
  const variables = {};
  if (typeof id !== "undefined")
    variables.id = (0, import_tiny_graphql_query_compiler.Var)({ type: "GadgetID!", value: id });
  let fields = {
    [operation]: (0, import_tiny_graphql_query_compiler.Call)(
      variables,
      fieldSelectionToQueryCompilerFields((options == null ? void 0 : options.select) ? expandSelection(options.select, defaultSelection) : defaultSelection, true)
    )
  };
  fields = (0, import_support.namespacify)(namespace, fields);
  return (0, import_tiny_graphql_query_compiler.compileWithVariableValues)({
    type: "query",
    name: operation,
    fields: {
      ...fields,
      ...(0, import_utils.hydrationSelection)(modelApiIdentifier, namespace)
    },
    directives: directivesForOptions(options)
  });
};
const findOneByFieldOperation = (operation, fieldName, fieldValue, defaultSelection, modelApiIdentifier, options, namespace) => {
  return findManyOperation(
    operation,
    defaultSelection,
    modelApiIdentifier,
    {
      ...options,
      first: 2,
      filter: {
        [fieldName]: {
          equals: fieldValue
        }
      }
    },
    namespace
  );
};
const findManyOperation = (operation, defaultSelection, modelApiIdentifier, options, namespace) => {
  let fields = {
    [operation]: (0, import_tiny_graphql_query_compiler.Call)(
      {
        after: (0, import_tiny_graphql_query_compiler.Var)({ value: options == null ? void 0 : options.after, type: "String" }),
        first: (0, import_tiny_graphql_query_compiler.Var)({ value: options == null ? void 0 : options.first, type: "Int" }),
        before: (0, import_tiny_graphql_query_compiler.Var)({ value: options == null ? void 0 : options.before, type: "String" }),
        last: (0, import_tiny_graphql_query_compiler.Var)({ value: options == null ? void 0 : options.last, type: "Int" }),
        sort: (options == null ? void 0 : options.sort) ? (0, import_tiny_graphql_query_compiler.Var)({ value: options.sort, type: `[${(0, import_support.sortTypeName)(modelApiIdentifier, namespace)}!]` }) : void 0,
        filter: (options == null ? void 0 : options.filter) ? (0, import_tiny_graphql_query_compiler.Var)({ value: options.filter, type: `[${(0, import_support.filterTypeName)(modelApiIdentifier, namespace)}!]` }) : void 0,
        search: (options == null ? void 0 : options.search) ? (0, import_tiny_graphql_query_compiler.Var)({ value: options.search, type: "String" }) : void 0,
        searchFields: (options == null ? void 0 : options.searchFields) ? (0, import_tiny_graphql_query_compiler.Var)({
          value: (0, import_support.jsSearchFieldsToGqlSearchFields)(options.searchFields),
          type: `${(0, import_support.searchableFieldTypeName)(modelApiIdentifier, namespace)}`
        }) : void 0
      },
      {
        pageInfo: { hasNextPage: true, hasPreviousPage: true, startCursor: true, endCursor: true },
        edges: {
          cursor: true,
          node: fieldSelectionToQueryCompilerFields(
            (options == null ? void 0 : options.select) ? expandSelection(options.select, defaultSelection) : defaultSelection,
            true
          )
        }
      }
    )
  };
  if (namespace) {
    fields = (0, import_support.namespacify)(namespace, fields);
  }
  return (0, import_tiny_graphql_query_compiler.compileWithVariableValues)({
    type: "query",
    name: operation,
    fields: {
      ...fields,
      ...(0, import_utils.hydrationSelection)(modelApiIdentifier, namespace)
    },
    directives: directivesForOptions(options)
  });
};
const variableOptionsToVariables = (variables) => {
  return Object.fromEntries(Object.entries(variables).map(([name, options]) => [name, (0, import_tiny_graphql_query_compiler.Var)(options)]));
};
const actionResultFieldSelection = (modelSelectionField, selection, isBulkAction, hasReturnType, depth = 0) => {
  const fieldSelection = depth == 0 ? {
    success: true,
    ...import_support.ErrorsSelection
  } : {};
  if (hasReturnType && typeof hasReturnType != "boolean") {
    for (const [selectionField, returnTypeSelection] of Object.entries(hasReturnType)) {
      if ("select" in returnTypeSelection) {
        fieldSelection[selectionField] = fieldSelectionToQueryCompilerFields(selection, true);
      } else {
        fieldSelection[selectionField] = {
          __typename: selectionField.includes("... on"),
          ...actionResultFieldSelection(modelSelectionField, selection, isBulkAction, returnTypeSelection.hasReturnType, depth + 1)
        };
      }
    }
  } else if (hasReturnType) {
    fieldSelection[isBulkAction && depth == 0 ? "results" : "result"] = true;
  } else if (selection) {
    fieldSelection[modelSelectionField] = fieldSelectionToQueryCompilerFields(selection, true);
  }
  return fieldSelection;
};
const actionOperation = (operation, defaultSelection, modelApiIdentifier, modelSelectionField, variables, options, namespace, isBulkAction, hasReturnType) => {
  const selection = (options == null ? void 0 : options.select) ? expandSelection(options.select, defaultSelection ?? {}) : defaultSelection;
  let fields = {
    [operation]: (0, import_tiny_graphql_query_compiler.Call)(
      variableOptionsToVariables(variables),
      actionResultFieldSelection(modelSelectionField, selection, isBulkAction, hasReturnType)
    )
  };
  fields = (0, import_support.namespacify)(namespace, fields);
  const actionOperation2 = {
    type: "mutation",
    name: operation,
    fields: {
      ...fields,
      ...(0, import_utils.hydrationSelection)(modelApiIdentifier, namespace)
    },
    directives: directivesForOptions(options)
  };
  return (0, import_tiny_graphql_query_compiler.compileWithVariableValues)(actionOperation2);
};
const backgroundActionResultOperation = (id, action, options) => {
  let fields = {};
  let resultType;
  const backgroundAction = action.isBulk && action.singleAction ? action.singleAction : action;
  let operationName = backgroundAction.operationName;
  if (backgroundAction.isBulk) {
    operationName = backgroundAction.operationName.replace(/^bulk/, "").replace(/s$/, "");
  }
  if (!backgroundAction.operationReturnType) {
    resultType = `${(0, import_support.camelize)(operationName)}Result`;
  } else {
    resultType = `${backgroundAction.operationReturnType}Result`;
  }
  switch (backgroundAction.type) {
    case "action": {
      const selection = (options == null ? void 0 : options.select) ? expandSelection(options.select, backgroundAction.defaultSelection ?? {}) : backgroundAction.defaultSelection;
      fields = {
        [`... on ${resultType}`]: actionResultFieldSelection(
          backgroundAction.modelApiIdentifier,
          selection,
          backgroundAction.isBulk,
          backgroundAction.hasReturnType
        )
      };
      break;
    }
    case "globalAction": {
      fields = {
        [`... on ${resultType}`]: globalActionFieldSelection()
      };
    }
  }
  const actionResultOperation2 = {
    type: "subscription",
    name: (0, import_support.capitalizeIdentifier)(operationName) + "BackgroundResult",
    fields: {
      backgroundAction: (0, import_tiny_graphql_query_compiler.Call)(
        { id: (0, import_tiny_graphql_query_compiler.Var)({ value: id, type: "String!" }) },
        {
          id: true,
          outcome: true,
          result: {
            ...fields
          }
        }
      )
    }
  };
  return (0, import_tiny_graphql_query_compiler.compileWithVariableValues)(actionResultOperation2);
};
const actionResultOperation = backgroundActionResultOperation;
const globalActionFieldSelection = () => {
  return {
    success: true,
    ...import_support.ErrorsSelection,
    result: true
  };
};
const globalActionOperation = (operation, variables, namespace, options) => {
  let fields = {
    [operation]: (0, import_tiny_graphql_query_compiler.Call)(variableOptionsToVariables(variables), globalActionFieldSelection())
  };
  fields = (0, import_support.namespacify)(namespace, fields);
  return (0, import_tiny_graphql_query_compiler.compileWithVariableValues)({
    type: "mutation",
    name: operation,
    fields,
    directives: directivesForOptions(options)
  });
};
const graphqlizeBackgroundOptions = (options) => {
  if (!options)
    return null;
  const obj = { ...options };
  if (typeof obj.retries == "number") {
    obj.retries = {
      retryCount: obj.retries
    };
  }
  if (typeof obj.queue == "string") {
    obj.queue = {
      name: obj.queue
    };
  }
  if (obj.startAt instanceof Date) {
    obj.startAt = obj.startAt.toISOString();
  }
  if (obj.priority) {
    obj.priority = obj.priority.toUpperCase();
  }
  for (const key of Object.keys(obj)) {
    if (["id", "retries", "queue", "priority", "startAt", "shopifyShop"].includes(key))
      continue;
    delete obj[key];
  }
  return obj;
};
const enqueueActionOperation = (operation, variables, namespace, options, isBulk) => {
  let fields = {
    [operation]: (0, import_tiny_graphql_query_compiler.Call)(
      {
        ...variableOptionsToVariables(variables),
        backgroundOptions: (0, import_tiny_graphql_query_compiler.Var)({
          type: "EnqueueBackgroundActionOptions",
          value: graphqlizeBackgroundOptions(options)
        })
      },
      {
        success: true,
        errors: {
          message: true,
          code: true
        },
        [isBulk ? "backgroundActions" : "backgroundAction"]: {
          id: true
        }
      }
    )
  };
  fields = (0, import_support.namespacify)(namespace, fields);
  return (0, import_tiny_graphql_query_compiler.compileWithVariableValues)({
    type: "mutation",
    name: "enqueue" + (0, import_support.camelize)(operation),
    fields: {
      background: fields
    }
  });
};
const cancelBackgroundActionOperation = (id) => {
  const fields = {
    cancel: (0, import_tiny_graphql_query_compiler.Call)(
      { id: (0, import_tiny_graphql_query_compiler.Var)({ value: id, type: "String!" }) },
      {
        success: true,
        errors: {
          code: true,
          message: true
        },
        backgroundAction: {
          id: true
        }
      }
    )
  };
  return (0, import_tiny_graphql_query_compiler.compileWithVariableValues)({
    type: "mutation",
    name: "cancelBackgroundAction",
    fields: {
      background: fields
    }
  });
};
const getBackgroundActionStatusOperation = (id) => {
  const statusOperation = {
    type: "subscription",
    name: "BackgroundActionStatus",
    fields: {
      backgroundAction: (0, import_tiny_graphql_query_compiler.Call)(
        { id: (0, import_tiny_graphql_query_compiler.Var)({ value: id, type: "String!" }) },
        {
          id: true,
          status: true
        }
      )
    }
  };
  return (0, import_tiny_graphql_query_compiler.compileWithVariableValues)(statusOperation);
};
const computedViewOperation = (gqlFieldName, variablesOptions = {}, namespace) => {
  let fields = {
    [gqlFieldName]: (0, import_tiny_graphql_query_compiler.Call)(variableOptionsToVariables(variablesOptions))
  };
  if (namespace) {
    fields = (0, import_support.namespacify)(namespace, fields);
  }
  return variablesOptions ? (0, import_tiny_graphql_query_compiler.compileWithVariableValues)({ type: "query", name: gqlFieldName, fields }) : { query: (0, import_tiny_graphql_query_compiler.compile)({ type: "query", name: gqlFieldName, fields }), variables: {} };
};
const inlineComputedViewOperation = (query, gqlFieldName, variables, namespace) => {
  const vars = {
    query: (0, import_tiny_graphql_query_compiler.Var)({ type: "String", value: query, required: true })
  };
  if (variables)
    vars["variables"] = (0, import_tiny_graphql_query_compiler.Var)({ type: "JSONObject", value: variables });
  let fields = {
    [gqlFieldName]: (0, import_tiny_graphql_query_compiler.Call)(variableOptionsToVariables(vars))
  };
  if (namespace)
    fields = (0, import_support.namespacify)(namespace, fields);
  return (0, import_tiny_graphql_query_compiler.compileWithVariableValues)({ type: "query", name: gqlFieldName, fields });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  actionOperation,
  actionResultOperation,
  backgroundActionResultOperation,
  cancelBackgroundActionOperation,
  computedViewOperation,
  enqueueActionOperation,
  expandSelection,
  findManyOperation,
  findOneByFieldOperation,
  findOneOperation,
  getBackgroundActionStatusOperation,
  globalActionOperation,
  graphqlizeBackgroundOptions,
  inlineComputedViewOperation
});
//# sourceMappingURL=operationBuilders.js.map
