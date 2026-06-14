import type {
  ActionFunctionOptions,
  AnyActionFunction,
  BaseFindOptions,
  EnqueueBackgroundActionOptions,
  FieldSelection,
  FindManyOptions,
  HasReturnType,
  VariablesOptions,
} from "@gadgetinc/core";
import type { FieldSelection as BuilderFieldSelection, BuilderOperation, Variable } from "tiny-graphql-query-compiler";
import { Call, Var, compile, compileWithVariableValues } from "tiny-graphql-query-compiler";
import {
  ErrorsSelection,
  camelize,
  capitalizeIdentifier,
  filterTypeName,
  jsSearchFieldsToGqlSearchFields,
  namespacify,
  searchableFieldTypeName,
  sortTypeName,
} from "./support.js";
import { hydrationSelection, type BuildOperationResult } from "./utils.js";

const $args = Symbol.for("gadget/fieldArgs");

/**
 * When a user provides a select override with `true` for a field that requires sub-selections
 * (e.g. RichText, File, RoleAssignments), auto-expand it to use the default sub-selection.
 * This allows users to write `{ richTextField: true }` instead of `{ richTextField: { markdown: true, truncatedHTML: true } }`.
 */
export const expandSelection = (selection: FieldSelection, defaultSelection: FieldSelection): FieldSelection => {
  const result: FieldSelection = {};
  for (const [key, value] of Object.entries(selection)) {
    const defaultValue = defaultSelection[key];
    if (value === true && defaultValue != null && typeof defaultValue === "object") {
      // User passed `true` but the default has a sub-selection — auto-expand
      result[key] = defaultValue;
    } else {
      result[key] = value;
    }
  }
  return result;
};

/** Converts a single selection value to its query compiler equivalent */
const selectionValueToBuilderValue = (value: FieldSelection[string]): BuilderFieldSelection[string] => {
  if (typeof value !== "object" || value === null) {
    return value;
  }

  const fieldArgs = (value as any)[$args];
  const stringKeys = Object.keys(value);
  const nestedSelection: BuilderFieldSelection = {};
  for (const key of stringKeys) {
    nestedSelection[key] = selectionValueToBuilderValue(value[key]);
  }

  if (fieldArgs != null) {
    return stringKeys.length > 0 ? Call(fieldArgs, nestedSelection) : Call(fieldArgs);
  }

  return nestedSelection;
};

/**
 * Converts Selection nested object format to the tiny-graphql-query-compiler shape
 **/
const fieldSelectionToQueryCompilerFields = (selection: FieldSelection, includeTypename = false): BuilderFieldSelection => {
  const output: BuilderFieldSelection = {};
  for (const [key, value] of Object.entries(selection)) {
    output[key] = selectionValueToBuilderValue(value);
  }
  if (includeTypename) output.__typename = true;
  return output;
};

export type FindFirstPaginationOptions = Omit<FindManyOptions, "first" | "last" | "before" | "after">;

const directivesForOptions = (options?: BaseFindOptions | null) => {
  if (options?.live) return ["@live"];
  return undefined;
};

export const findOneOperation = (
  operation: string,
  id: string | undefined,
  defaultSelection: FieldSelection,
  modelApiIdentifier: string,
  options?: BaseFindOptions | null,
  namespace?: string | string[] | null
): BuildOperationResult => {
  const variables: Record<string, Variable> = {};
  if (typeof id !== "undefined") variables.id = Var({ type: "GadgetID!", value: id });

  let fields: BuilderFieldSelection = {
    [operation]: Call(
      variables,
      fieldSelectionToQueryCompilerFields(options?.select ? expandSelection(options.select, defaultSelection) : defaultSelection, true)
    ),
  };

  fields = namespacify(namespace, fields);

  return compileWithVariableValues({
    type: "query",
    name: operation,
    fields: {
      ...fields,
      ...hydrationSelection(modelApiIdentifier, namespace),
    },
    directives: directivesForOptions(options),
  });
};

export const findOneByFieldOperation = (
  operation: string,
  fieldName: string,
  fieldValue: string,
  defaultSelection: FieldSelection,
  modelApiIdentifier: string,
  options?: BaseFindOptions | null,
  namespace?: string | string[] | null
): BuildOperationResult => {
  return findManyOperation(
    operation,
    defaultSelection,
    modelApiIdentifier,
    {
      ...options,
      first: 2,
      filter: {
        [fieldName]: {
          equals: fieldValue,
        },
      },
    },
    namespace
  );
};

export const findManyOperation = (
  operation: string,
  defaultSelection: FieldSelection,
  modelApiIdentifier: string,
  options?: FindManyOptions,
  namespace?: string | string[] | null
): BuildOperationResult => {
  let fields: BuilderFieldSelection = {
    [operation]: Call(
      {
        after: Var({ value: options?.after, type: "String" }),
        first: Var({ value: options?.first, type: "Int" }),
        before: Var({ value: options?.before, type: "String" }),
        last: Var({ value: options?.last, type: "Int" }),
        sort: options?.sort ? Var({ value: options.sort, type: `[${sortTypeName(modelApiIdentifier, namespace)}!]` }) : undefined,
        filter: options?.filter ? Var({ value: options.filter, type: `[${filterTypeName(modelApiIdentifier, namespace)}!]` }) : undefined,
        search: options?.search ? Var({ value: options.search, type: "String" }) : undefined,
        searchFields: options?.searchFields
          ? Var({
              value: jsSearchFieldsToGqlSearchFields(options.searchFields),
              type: `${searchableFieldTypeName(modelApiIdentifier, namespace)}`,
            })
          : undefined,
      },
      {
        pageInfo: { hasNextPage: true, hasPreviousPage: true, startCursor: true, endCursor: true },
        edges: {
          cursor: true,
          node: fieldSelectionToQueryCompilerFields(
            options?.select ? expandSelection(options.select, defaultSelection) : defaultSelection,
            true
          ),
        },
      }
    ),
  };

  if (namespace) {
    fields = namespacify(namespace, fields);
  }

  return compileWithVariableValues({
    type: "query",
    name: operation,
    fields: {
      ...fields,
      ...hydrationSelection(modelApiIdentifier, namespace),
    },
    directives: directivesForOptions(options),
  });
};

const variableOptionsToVariables = (variables: VariablesOptions) => {
  return Object.fromEntries(Object.entries(variables).map(([name, options]) => [name, Var(options)]));
};

const actionResultFieldSelection = (
  modelSelectionField: string,
  selection: FieldSelection,
  isBulkAction?: boolean | null,
  hasReturnType?: HasReturnType | null,
  depth = 0
) => {
  const fieldSelection: BuilderFieldSelection =
    depth == 0
      ? {
          success: true,
          ...ErrorsSelection,
        }
      : {};

  if (hasReturnType && typeof hasReturnType != "boolean") {
    for (const [selectionField, returnTypeSelection] of Object.entries(hasReturnType)) {
      if ("select" in returnTypeSelection) {
        fieldSelection[selectionField] = fieldSelectionToQueryCompilerFields(selection, true);
      } else {
        fieldSelection[selectionField] = {
          __typename: selectionField.includes("... on"),
          ...actionResultFieldSelection(modelSelectionField, selection, isBulkAction, returnTypeSelection.hasReturnType, depth + 1),
        };
      }
    }
  } else if (hasReturnType) {
    fieldSelection[isBulkAction && depth == 0 ? "results" : "result"] = true;
  } else if (selection) {
    fieldSelection[modelSelectionField] = fieldSelectionToQueryCompilerFields(selection, true);
  }

  return fieldSelection as FieldSelection;
};

export const actionOperation = (
  operation: string,
  defaultSelection: FieldSelection | null,
  modelApiIdentifier: string,
  modelSelectionField: string,
  variables: VariablesOptions,
  options?: BaseFindOptions | null,
  namespace?: string | string[] | null,
  isBulkAction?: boolean | null,
  hasReturnType?: HasReturnType | null
): BuildOperationResult => {
  const selection = options?.select ? expandSelection(options.select, defaultSelection ?? {}) : defaultSelection;

  let fields: BuilderFieldSelection = {
    [operation]: Call(
      variableOptionsToVariables(variables),
      actionResultFieldSelection(modelSelectionField, selection!, isBulkAction, hasReturnType)
    ),
  };

  fields = namespacify(namespace, fields);

  const actionOperation: BuilderOperation = {
    type: "mutation",
    name: operation,
    fields: {
      ...fields,
      ...hydrationSelection(modelApiIdentifier, namespace),
    },
    directives: directivesForOptions(options),
  };

  return compileWithVariableValues(actionOperation);
};

export const backgroundActionResultOperation = <Action extends AnyActionFunction, Options extends ActionFunctionOptions<Action>>(
  id: string,
  action: Action,
  options?: Options
): BuildOperationResult => {
  let fields: FieldSelection = {};
  let resultType: string;

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
      const selection = options?.select
        ? expandSelection(options.select, backgroundAction.defaultSelection ?? {})
        : backgroundAction.defaultSelection;

      fields = {
        [`... on ${resultType}`]: actionResultFieldSelection(
          backgroundAction.modelApiIdentifier,
          selection,
          backgroundAction.isBulk,
          backgroundAction.hasReturnType
        ),
      };
      break;
    }
    case "globalAction": {
      fields = {
        [`... on ${resultType}`]: globalActionFieldSelection(),
      };
    }
  }

  const actionResultOperation: BuilderOperation = {
    type: "subscription",
    name: capitalizeIdentifier(operationName) + "BackgroundResult",
    fields: {
      backgroundAction: Call(
        { id: Var({ value: id, type: "String!" }) },
        {
          id: true,
          outcome: true,
          result: {
            ...fields,
          },
        }
      ),
    },
  };

  return compileWithVariableValues(actionResultOperation);
};

/** @deprecated previous export name, @see backgroundActionResultOperation */
export const actionResultOperation: typeof backgroundActionResultOperation = backgroundActionResultOperation;

const globalActionFieldSelection = () => {
  return {
    success: true,
    ...ErrorsSelection,
    result: true,
  } as FieldSelection;
};

export const globalActionOperation = (
  operation: string,
  variables: VariablesOptions,
  namespace?: string | string[] | null,
  options?: { live?: boolean }
): BuildOperationResult => {
  let fields: BuilderFieldSelection = {
    [operation]: Call(variableOptionsToVariables(variables), globalActionFieldSelection()),
  };

  fields = namespacify(namespace, fields);

  return compileWithVariableValues({
    type: "mutation",
    name: operation,
    fields,
    directives: directivesForOptions(options),
  });
};

export interface GraphQLBackgroundActionOptions {
  shopifyShop?: string;
  retries?: { retryCount: number };
  queue?: { name: string; maxConcurrency?: number };
  priority?: "LOW" | "DEFAULT" | "HIGH";
  startAt?: string;
}

export const graphqlizeBackgroundOptions = (
  options?: EnqueueBackgroundActionOptions<any> | null
): GraphQLBackgroundActionOptions | null => {
  if (!options) return null;

  const obj = { ...options };
  if (typeof obj.retries == "number") {
    obj.retries = {
      retryCount: obj.retries,
    };
  }

  if (typeof obj.queue == "string") {
    obj.queue = {
      name: obj.queue,
    };
  }

  if (obj.startAt instanceof Date) {
    obj.startAt = obj.startAt.toISOString();
  }

  if (obj.priority) {
    obj.priority = obj.priority.toUpperCase() as "LOW" | "DEFAULT" | "HIGH";
  }

  for (const key of Object.keys(obj)) {
    if (["id", "retries", "queue", "priority", "startAt", "shopifyShop"].includes(key)) continue;
    delete obj[key];
  }

  return obj as GraphQLBackgroundActionOptions;
};

export const enqueueActionOperation = (
  operation: string,
  variables: VariablesOptions,
  namespace?: string | string[] | null,
  options?: EnqueueBackgroundActionOptions<any> | null,
  isBulk?: boolean
): BuildOperationResult => {
  let fields: BuilderFieldSelection = {
    [operation]: Call(
      {
        ...variableOptionsToVariables(variables),
        backgroundOptions: Var({
          type: "EnqueueBackgroundActionOptions",
          value: graphqlizeBackgroundOptions(options),
        }),
      },
      {
        success: true,
        errors: {
          message: true,
          code: true,
        },
        [isBulk ? "backgroundActions" : "backgroundAction"]: {
          id: true,
        },
      }
    ),
  };

  fields = namespacify(namespace, fields);

  return compileWithVariableValues({
    type: "mutation",
    name: "enqueue" + camelize(operation),
    fields: {
      background: fields,
    },
  });
};

export const cancelBackgroundActionOperation = (id: string): BuildOperationResult => {
  const fields = {
    cancel: Call(
      { id: Var({ value: id, type: "String!" }) },
      {
        success: true,
        errors: {
          code: true,
          message: true,
        },
        backgroundAction: {
          id: true,
        },
      }
    ),
  } as BuilderFieldSelection;

  return compileWithVariableValues({
    type: "mutation",
    name: "cancelBackgroundAction",
    fields: {
      background: fields,
    },
  });
};

export const getBackgroundActionStatusOperation = (id: string): BuildOperationResult => {
  const statusOperation: BuilderOperation = {
    type: "subscription",
    name: "BackgroundActionStatus",
    fields: {
      backgroundAction: Call(
        { id: Var({ value: id, type: "String!" }) },
        {
          id: true,
          status: true,
        }
      ),
    },
  };

  return compileWithVariableValues(statusOperation);
};

export const computedViewOperation = (
  gqlFieldName: string,
  variablesOptions: VariablesOptions = {},
  namespace?: string | string[] | null
): BuildOperationResult => {
  let fields: BuilderFieldSelection = {
    [gqlFieldName]: Call(variableOptionsToVariables(variablesOptions)),
  };

  if (namespace) {
    fields = namespacify(namespace, fields);
  }

  return variablesOptions
    ? compileWithVariableValues({ type: "query", name: gqlFieldName, fields })
    : { query: compile({ type: "query", name: gqlFieldName, fields }), variables: {} };
};

export const inlineComputedViewOperation = (
  query: string,
  gqlFieldName: string,
  variables?: Record<string, any>,
  namespace?: string | string[] | null
): BuildOperationResult => {
  const vars: Record<string, Variable> = {
    query: Var({ type: "String", value: query, required: true }),
  };
  if (variables) vars["variables"] = Var({ type: "JSONObject", value: variables });
  let fields: BuilderFieldSelection = {
    [gqlFieldName]: Call(variableOptionsToVariables(vars)),
  };
  if (namespace) fields = namespacify(namespace, fields);
  return compileWithVariableValues({ type: "query", name: gqlFieldName, fields });
};
