import type {
  AnyActionFunction,
  AnyBulkActionFunction,
  AnyConnection,
  AnyModelManager,
  BaseFindOptions,
  EnqueueBackgroundActionOptions,
  FieldSelection,
  FindManyOptions,
  HasReturnType,
  RecordShape,
  VariablesOptions,
} from "@gadgetinc/core";
import type { OperationResult } from "@urql/core";
import type { Source } from "wonka";
import { filter, pipe, take, toAsyncIterable, toPromise } from "wonka";
import { BackgroundActionHandle } from "./BackgroundActionHandle.js";
import type { GadgetRecord } from "./GadgetRecord.js";
import { GadgetRecordList } from "./GadgetRecordList.js";
import {
  actionOperation,
  computedViewOperation,
  enqueueActionOperation,
  findManyOperation,
  findOneByFieldOperation,
  findOneOperation,
  globalActionOperation,
  inlineComputedViewOperation,
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
  setVariableOptionValues,
} from "./support.js";

type LiveResultForOptions<T, LiveOptions extends { live?: boolean | null }> = LiveOptions extends { live: true }
  ? AsyncIterable<T>
  : Promise<T>;

const mapAsyncIterable = <T, U>(source: AsyncIterable<T>, mapper: (item: T) => U): AsyncIterable<U> => {
  return {
    [Symbol.asyncIterator]() {
      const iter = source[Symbol.asyncIterator]();

      return {
        async next(): Promise<IteratorResult<U>> {
          const { done, value } = await iter.next();

          return {
            done,
            value: typeof value != "undefined" ? mapper(value) : undefined,
          } as any;
        },
        async return(value: any): Promise<IteratorReturnResult<any>> {
          return (await iter.return?.(value)) as any;
        },
      };
    },
  };
};

/** Given a stream, return an async iterable when live querying, and a promise resolving to the last value otherwise */
function maybeLiveStream<T extends OperationResult, U, LiveOptions extends { live?: boolean | null }>(
  $result: Source<T>,
  mapper: (value: T) => U,
  options?: LiveOptions | null
): LiveResultForOptions<U, LiveOptions> {
  if (options?.live) {
    return mapAsyncIterable<T, U>(toAsyncIterable($result), mapper) as unknown as LiveResultForOptions<U, LiveOptions>;
  } else {
    const promise = pipe(
      $result,
      filter((result) => !result.stale && !result.hasNext),
      take(1),
      toPromise
    );

    return promise.then((value) => mapper(value)) as LiveResultForOptions<U, LiveOptions>;
  }
}

export const findOneRunner = <Shape extends RecordShape = any, Options extends BaseFindOptions = Record<string, never>>(
  modelManager: { connection: AnyConnection },
  operation: string,
  id: string | undefined,
  defaultSelection: FieldSelection,
  modelApiIdentifier: string,
  options?: Options | null,
  throwOnEmptyData = true,
  namespace?: string | string[] | null
): LiveResultForOptions<GadgetRecord<Shape>, Options> => {
  const plan = findOneOperation(operation, id, defaultSelection, modelApiIdentifier, options, namespace);
  const $results = modelManager.connection.currentClient.query(plan.query, plan.variables);

  return maybeLiveStream(
    $results,
    (response) => {
      const assertSuccess = throwOnEmptyData ? assertOperationSuccess : assertNullableOperationSuccess;
      const dataPath = namespaceDataPath([operation], namespace);
      const record = assertSuccess(response, dataPath);
      return hydrateRecord<Shape>(response, record);
    },
    options
  );
};

export const findOneByFieldRunner = <Shape extends RecordShape = any, Options extends FindManyOptions = Record<string, never>>(
  modelManager: { connection: AnyConnection },
  operation: string,
  fieldName: string,
  fieldValue: string,
  defaultSelection: FieldSelection,
  modelApiIdentifier: string,
  options?: Options | null,
  throwOnEmptyData = true,
  namespace?: string | string[] | null
): LiveResultForOptions<GadgetRecord<Shape> | null, Options> => {
  const plan = findOneByFieldOperation(operation, fieldName, fieldValue, defaultSelection, modelApiIdentifier, options, namespace);
  const dataPath = namespaceDataPath([operation], namespace);
  const $results = modelManager.connection.currentClient.query(plan.query, plan.variables);

  return maybeLiveStream(
    $results,
    (response) => {
      const connectionObject = assertOperationSuccess(response, dataPath);
      const records = hydrateConnection<Shape>(response, connectionObject);

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

export const findManyRunner = <Shape extends RecordShape = any, Options extends FindManyOptions = Record<string, never>>(
  modelManager: AnyModelManager,
  operation: string,
  defaultSelection: FieldSelection,
  modelApiIdentifier: string,
  options?: Options,
  throwOnEmptyData?: boolean,
  namespace?: string | string[] | null
): LiveResultForOptions<GadgetRecordList<Shape>, Options> => {
  const plan = findManyOperation(operation, defaultSelection, modelApiIdentifier, options, namespace);
  const $results = modelManager.connection.currentClient.query(plan.query, plan.variables);
  const dataPath = namespaceDataPath([operation], namespace);

  return maybeLiveStream(
    $results,
    (response) => {
      let connectionObject;
      if (throwOnEmptyData === false) {
        // If this is a nullable operation, don't throw errors on empty
        connectionObject = assertNullableOperationSuccess(response, dataPath);
      } else {
        // Otherwise, passthrough the `throwOnEmptyData` flag, to account for
        // `findMany` (allows empty arrays) vs `findFirst` (no empty result) usage.
        connectionObject = assertOperationSuccess(response, dataPath, throwOnEmptyData);
      }

      const records = hydrateConnection<Shape>(response, connectionObject);
      return GadgetRecordList.boot<Shape>(modelManager, records, { options, pageInfo: connectionObject.pageInfo });
    },
    options
  );
};

export const findAllRunner = async <Shape extends RecordShape = any>(
  modelManager: AnyModelManager,
  operation: string,
  defaultSelection: FieldSelection,
  modelApiIdentifier: string,
  options?: FindManyOptions,
  namespace?: string | string[] | null
): Promise<GadgetRecord<Shape>[]> => {
  // Default to max page size for throughput, force forward-only pagination
  const { last: _last, before: _before, live: _live, ...cleanOptions } = options ?? ({} as FindManyOptions);
  const pageSize = cleanOptions.first ?? 250;

  const allRecords: GadgetRecord<Shape>[] = [];
  let after = cleanOptions.after;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const page: GadgetRecordList<Shape> = await findManyRunner(
      modelManager,
      operation,
      defaultSelection,
      modelApiIdentifier,
      { ...cleanOptions, first: pageSize, after },
      undefined,
      namespace
    );

    allRecords.push(...page);

    if (!page.hasNextPage) break;
    after = page.endCursor;
  }

  return allRecords;
};

export const iterateAllRunner = <Shape extends RecordShape = any>(
  modelManager: AnyModelManager,
  operation: string,
  defaultSelection: FieldSelection,
  modelApiIdentifier: string,
  options?: FindManyOptions,
  namespace?: string | string[] | null
): AsyncIterable<GadgetRecord<Shape>> => {
  // Default to max page size for throughput, force forward-only pagination
  const { last: _last, before: _before, live: _live, ...cleanOptions } = options ?? ({} as FindManyOptions);
  const pageSize = cleanOptions.first ?? 250;

  return {
    [Symbol.asyncIterator]() {
      let currentPage: GadgetRecordList<Shape> | null = null;
      let index = 0;
      let after = cleanOptions.after;
      let done = false;

      return {
        async next(): Promise<IteratorResult<GadgetRecord<Shape>>> {
          // If we have records left in the current page, yield the next one
          if (currentPage && index < currentPage.length) {
            return { done: false, value: currentPage[index++] };
          }

          // If we've already fetched a page and there's no next page, we're done
          if (currentPage && !currentPage.hasNextPage) {
            done = true;
            return { done: true, value: undefined };
          }

          if (done) {
            return { done: true, value: undefined };
          }

          // Fetch the next page
          if (currentPage) {
            after = currentPage.endCursor;
          }

          currentPage = await findManyRunner(
            modelManager,
            operation,
            defaultSelection,
            modelApiIdentifier,
            { ...cleanOptions, first: pageSize, after },
            undefined,
            namespace
          );
          index = 0;

          if (currentPage.length === 0) {
            done = true;
            return { done: true, value: undefined };
          }

          return { done: false, value: currentPage[index++] };
        },
      };
    },
  };
};

export interface ActionRunner {
  (
    modelManager: { connection: AnyConnection },
    operation: string,
    defaultSelection: FieldSelection | null,
    modelApiIdentifier: string,
    modelSelectionField: string,
    isBulkAction: false,
    variables: VariablesOptions,
    options?: BaseFindOptions | null,
    namespace?: string | string[] | null,
    hasReturnType?: HasReturnType
  ): Promise<any>;

  <Shape extends RecordShape = any>(
    modelManager: { connection: AnyConnection },
    operation: string,
    defaultSelection: FieldSelection | null,
    modelApiIdentifier: string,
    modelSelectionField: string,
    isBulkAction: false,
    variables: VariablesOptions,
    options?: BaseFindOptions | null,
    namespace?: string | string[] | null,
    hasReturnType?: false | null
  ): Promise<Shape extends void ? void : GadgetRecord<Shape>>;

  <Shape extends RecordShape = any>(
    modelManager: { connection: AnyConnection },
    operation: string,
    defaultSelection: FieldSelection | null,
    modelApiIdentifier: string,
    modelSelectionField: string,
    isBulkAction: false,
    variables: VariablesOptions,
    options?: BaseFindOptions | null,
    namespace?: string | string[] | null
  ): Promise<Shape extends void ? void : GadgetRecord<Shape>>;

  <Shape extends RecordShape = any>(
    modelManager: { connection: AnyConnection },
    operation: string,
    defaultSelection: FieldSelection | null,
    modelApiIdentifier: string,
    modelSelectionField: string,
    isBulkAction: true,
    variables: VariablesOptions,
    options?: BaseFindOptions | null,
    namespace?: string | string[] | null
  ): Promise<Shape extends void ? void : GadgetRecord<Shape>[]>;

  (
    modelManager: { connection: AnyConnection },
    operation: string,
    defaultSelection: FieldSelection | null,
    modelApiIdentifier: string,
    modelSelectionField: string,
    isBulkAction: true,
    variables: VariablesOptions,
    options?: BaseFindOptions | null,
    namespace?: string | string[] | null,
    hasReturnType?: HasReturnType
  ): Promise<any[]>;

  <Shape extends RecordShape = any>(
    modelManager: { connection: AnyConnection },
    operation: string,
    defaultSelection: FieldSelection | null,
    modelApiIdentifier: string,
    modelSelectionField: string,
    isBulkAction: true,
    variables: VariablesOptions,
    options?: BaseFindOptions | null,
    namespace?: string | string[] | null,
    hasReturnType?: false | null
  ): Promise<Shape extends void ? void : GadgetRecord<Shape>[]>;
}

export const actionRunner: ActionRunner = async (
  modelManager: { connection: AnyConnection },
  operation: string,
  defaultSelection: FieldSelection | null,
  modelApiIdentifier: string,
  modelSelectionField: string,
  isBulkAction: boolean,
  variables: VariablesOptions,
  options?: BaseFindOptions | null,
  namespace?: string | string[] | null,
  hasReturnType?: HasReturnType | null
) => {
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

  // pass bulk responses through without any assertions since we can have a success: false response but still want
  // to process it in a similar fashion since some of the records could have been processed
  if (!isBulkAction) {
    const mutationTriple = assertMutationSuccess(response, dataPath);

    return processActionResponse(defaultSelection, response, mutationTriple, modelSelectionField, hasReturnType);
  } else {
    const mutationTriple = get(response.data, dataPath);

    const results = processBulkActionResponse(defaultSelection, response, mutationTriple, modelSelectionField, hasReturnType);
    if (mutationTriple.errors) {
      const errors = mutationTriple.errors.map((error: any) => gadgetErrorFor(error));
      throw new GadgetErrorGroup(errors, results);
    }

    return results;
  }
};

export const globalActionRunner = async (
  connection: AnyConnection,
  operation: string,
  variables: VariablesOptions,
  namespace?: string | string[] | null
): Promise<any> => {
  const plan = globalActionOperation(operation, variables, namespace);
  const response = await connection.currentClient.mutation(plan.query, plan.variables).toPromise();
  const dataPath = namespaceDataPath([operation], namespace);
  return assertMutationSuccess(response, dataPath).result;
};

export async function enqueueActionRunner<SchemaT, Action extends AnyBulkActionFunction, Result = BackgroundActionHandle<SchemaT, Action>>(
  connection: AnyConnection,
  action: Action,
  variables: Action["variablesType"],
  options?: EnqueueBackgroundActionOptions<Action>
): Promise<Result[]>;
export async function enqueueActionRunner<SchemaT, Action extends AnyActionFunction, Result = BackgroundActionHandle<SchemaT, Action>>(
  connection: AnyConnection,
  action: Action,
  variables: Action["variablesType"],
  options?: EnqueueBackgroundActionOptions<Action>
): Promise<Result>;
export async function enqueueActionRunner<SchemaT, Action extends AnyActionFunction, Result = BackgroundActionHandle<SchemaT, Action>>(
  connection: AnyConnection,
  action: Action,
  variables: Action["variablesType"],
  options: EnqueueBackgroundActionOptions<Action> = {}
): Promise<Result | Result[]> {
  const normalizedVariableValues = action.isBulk
    ? disambiguateBulkActionVariables(action, variables)
    : disambiguateActionVariables(action, variables);
  const variableOptions = setVariableOptionValues(action.variables, normalizedVariableValues);

  const plan = enqueueActionOperation(action.operationName, variableOptions, action.namespace, options, action.isBulk);
  const response = await connection.currentClient.mutation(plan.query, plan.variables, options).toPromise();
  const dataPath = ["background", ...namespaceDataPath([action.operationName], action.namespace)];

  try {
    const result = assertMutationSuccess(response, dataPath);
    if (action.isBulk) {
      return result.backgroundActions.map((result: { id: string }) => new BackgroundActionHandle(connection, action, result.id));
    } else {
      return new BackgroundActionHandle(connection, action, result.backgroundAction.id) as Result;
    }
  } catch (error: any) {
    if ("code" in error && error.code == "GGT_DUPLICATE_BACKGROUND_ACTION_ID" && options?.id && options.onDuplicateID == "ignore") {
      return new BackgroundActionHandle(connection, action, options.id) as Result;
    }
    throw error;
  }
}

export const inlineComputedViewRunner = async (
  connection: AnyConnection,
  gqlFieldName: string,
  viewQuery: string,
  variables?: Record<string, any>,
  namespace?: string | string[] | null
): Promise<unknown> => {
  const { query, variables: vars } = inlineComputedViewOperation(viewQuery, gqlFieldName, variables, namespace);
  const response = await connection.currentClient.query(query, vars);
  const dataPath = namespaceDataPath([gqlFieldName], namespace);
  return assertOperationSuccess(response, dataPath);
};

export const computedViewRunner = async (
  connection: AnyConnection,
  gqlFieldName: string,
  variablesOptions?: VariablesOptions,
  namespace?: string | string[] | null
): Promise<any> => {
  const { query, variables } = computedViewOperation(gqlFieldName, variablesOptions, namespace);
  const response = await connection.currentClient.query(query, variables);
  const dataPath = namespaceDataPath([gqlFieldName], namespace);
  return assertOperationSuccess(response, dataPath);
};
