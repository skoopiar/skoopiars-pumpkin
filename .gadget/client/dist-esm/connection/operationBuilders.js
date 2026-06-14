import { Call, Var, compile, compileWithVariableValues } from "tiny-graphql-query-compiler";
import {
  ErrorsSelection,
  camelize,
  capitalizeIdentifier,
  filterTypeName,
  jsSearchFieldsToGqlSearchFields,
  namespacify,
  searchableFieldTypeName,
  sortTypeName
} from "./support.js";
import { hydrationSelection } from "./utils.js";
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
    return stringKeys.length > 0 ? Call(fieldArgs, nestedSelection) : Call(fieldArgs);
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
  if (options?.live)
    return ["@live"];
  return void 0;
};
const findOneOperation = (operation, id, defaultSelection, modelApiIdentifier, options, namespace) => {
  const variables = {};
  if (typeof id !== "undefined")
    variables.id = Var({ type: "GadgetID!", value: id });
  let fields = {
    [operation]: Call(
      variables,
      fieldSelectionToQueryCompilerFields(options?.select ? expandSelection(options.select, defaultSelection) : defaultSelection, true)
    )
  };
  fields = namespacify(namespace, fields);
  return compileWithVariableValues({
    type: "query",
    name: operation,
    fields: {
      ...fields,
      ...hydrationSelection(modelApiIdentifier, namespace)
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
    [operation]: Call(
      {
        after: Var({ value: options?.after, type: "String" }),
        first: Var({ value: options?.first, type: "Int" }),
        before: Var({ value: options?.before, type: "String" }),
        last: Var({ value: options?.last, type: "Int" }),
        sort: options?.sort ? Var({ value: options.sort, type: `[${sortTypeName(modelApiIdentifier, namespace)}!]` }) : void 0,
        filter: options?.filter ? Var({ value: options.filter, type: `[${filterTypeName(modelApiIdentifier, namespace)}!]` }) : void 0,
        search: options?.search ? Var({ value: options.search, type: "String" }) : void 0,
        searchFields: options?.searchFields ? Var({
          value: jsSearchFieldsToGqlSearchFields(options.searchFields),
          type: `${searchableFieldTypeName(modelApiIdentifier, namespace)}`
        }) : void 0
      },
      {
        pageInfo: { hasNextPage: true, hasPreviousPage: true, startCursor: true, endCursor: true },
        edges: {
          cursor: true,
          node: fieldSelectionToQueryCompilerFields(
            options?.select ? expandSelection(options.select, defaultSelection) : defaultSelection,
            true
          )
        }
      }
    )
  };
  if (namespace) {
    fields = namespacify(namespace, fields);
  }
  return compileWithVariableValues({
    type: "query",
    name: operation,
    fields: {
      ...fields,
      ...hydrationSelection(modelApiIdentifier, namespace)
    },
    directives: directivesForOptions(options)
  });
};
const variableOptionsToVariables = (variables) => {
  return Object.fromEntries(Object.entries(variables).map(([name, options]) => [name, Var(options)]));
};
const actionResultFieldSelection = (modelSelectionField, selection, isBulkAction, hasReturnType, depth = 0) => {
  const fieldSelection = depth == 0 ? {
    success: true,
    ...ErrorsSelection
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
  const selection = options?.select ? expandSelection(options.select, defaultSelection ?? {}) : defaultSelection;
  let fields = {
    [operation]: Call(
      variableOptionsToVariables(variables),
      actionResultFieldSelection(modelSelectionField, selection, isBulkAction, hasReturnType)
    )
  };
  fields = namespacify(namespace, fields);
  const actionOperation2 = {
    type: "mutation",
    name: operation,
    fields: {
      ...fields,
      ...hydrationSelection(modelApiIdentifier, namespace)
    },
    directives: directivesForOptions(options)
  };
  return compileWithVariableValues(actionOperation2);
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
    resultType = `${camelize(operationName)}Result`;
  } else {
    resultType = `${backgroundAction.operationReturnType}Result`;
  }
  switch (backgroundAction.type) {
    case "action": {
      const selection = options?.select ? expandSelection(options.select, backgroundAction.defaultSelection ?? {}) : backgroundAction.defaultSelection;
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
    name: capitalizeIdentifier(operationName) + "BackgroundResult",
    fields: {
      backgroundAction: Call(
        { id: Var({ value: id, type: "String!" }) },
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
  return compileWithVariableValues(actionResultOperation2);
};
const actionResultOperation = backgroundActionResultOperation;
const globalActionFieldSelection = () => {
  return {
    success: true,
    ...ErrorsSelection,
    result: true
  };
};
const globalActionOperation = (operation, variables, namespace, options) => {
  let fields = {
    [operation]: Call(variableOptionsToVariables(variables), globalActionFieldSelection())
  };
  fields = namespacify(namespace, fields);
  return compileWithVariableValues({
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
    [operation]: Call(
      {
        ...variableOptionsToVariables(variables),
        backgroundOptions: Var({
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
  fields = namespacify(namespace, fields);
  return compileWithVariableValues({
    type: "mutation",
    name: "enqueue" + camelize(operation),
    fields: {
      background: fields
    }
  });
};
const cancelBackgroundActionOperation = (id) => {
  const fields = {
    cancel: Call(
      { id: Var({ value: id, type: "String!" }) },
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
  return compileWithVariableValues({
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
      backgroundAction: Call(
        { id: Var({ value: id, type: "String!" }) },
        {
          id: true,
          status: true
        }
      )
    }
  };
  return compileWithVariableValues(statusOperation);
};
const computedViewOperation = (gqlFieldName, variablesOptions = {}, namespace) => {
  let fields = {
    [gqlFieldName]: Call(variableOptionsToVariables(variablesOptions))
  };
  if (namespace) {
    fields = namespacify(namespace, fields);
  }
  return variablesOptions ? compileWithVariableValues({ type: "query", name: gqlFieldName, fields }) : { query: compile({ type: "query", name: gqlFieldName, fields }), variables: {} };
};
const inlineComputedViewOperation = (query, gqlFieldName, variables, namespace) => {
  const vars = {
    query: Var({ type: "String", value: query, required: true })
  };
  if (variables)
    vars["variables"] = Var({ type: "JSONObject", value: variables });
  let fields = {
    [gqlFieldName]: Call(variableOptionsToVariables(vars))
  };
  if (namespace)
    fields = namespacify(namespace, fields);
  return compileWithVariableValues({ type: "query", name: gqlFieldName, fields });
};
export {
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
};
//# sourceMappingURL=operationBuilders.js.map
