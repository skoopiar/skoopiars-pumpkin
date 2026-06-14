import type {
  ActionFunctionMetadata,
  ActionFunctionOptions,
  AnyBackgroundActionHandle,
  AnyConnection,
  BackgroundActionResult,
  BackgroundActionResultData,
  GlobalActionFunction,
} from "@gadgetinc/core";
import { filter, pipe, take, toPromise } from "wonka";
import { backgroundActionResultOperation, cancelBackgroundActionOperation, getBackgroundActionStatusOperation } from "./operationBuilders.js";
import { assertMutationSuccess, assertOperationSuccess, assertResponseSuccess, processActionResponse } from "./support.js";

/** The possible statuses of a background action */
export type BackgroundActionStatus = "scheduled" | "waiting" | "retrying" | "running" | "completed" | "failed" | "cancelled";

export const backgroundActionResultRunner = async <
  SchemaT,
  Action extends ActionFunctionMetadata<any, any, any, SchemaT, any, any> | GlobalActionFunction<any>,
  Options extends ActionFunctionOptions<Action>,
  ResultData = BackgroundActionResultData<Action, Options>,
>(
  connection: AnyConnection,
  id: string,
  action: Action,
  options?: Options
): Promise<BackgroundActionResult<ResultData>> => {
  const plan = backgroundActionResultOperation(id, action, options);
  const subscription = connection.currentClient.subscription(plan.query, plan.variables);

  const response = await pipe(
    subscription,
    filter((operation) => operation.error || operation.data?.backgroundAction?.outcome),
    take(1),
    toPromise
  );

  const backgroundAction = assertOperationSuccess(response, ["backgroundAction"]);

  assertResponseSuccess(backgroundAction.result);

  switch (action.type) {
    case "action": {
      backgroundAction.result = processActionResponse(
        action.defaultSelection,
        response.data,
        backgroundAction.result,
        action.isBulk ? action.modelApiIdentifier : action.modelSelectionField,
        action.hasReturnType
      );
      break;
    }
    case "globalAction": {
      backgroundAction.result = backgroundAction.result.result;
      break;
    }
  }

  return backgroundAction as BackgroundActionResult<ResultData>;
};

export const cancelBackgroundActionRunner = async (connection: AnyConnection, id: string): Promise<void> => {
  const plan = cancelBackgroundActionOperation(id);
  const response = await connection.currentClient.mutation(plan.query, plan.variables).toPromise();
  assertMutationSuccess(response, ["background", "cancel"]);
};

export const getBackgroundActionStatusRunner = async (connection: AnyConnection, id: string): Promise<BackgroundActionStatus> => {
  const plan = getBackgroundActionStatusOperation(id);
  const subscription = connection.currentClient.subscription(plan.query, plan.variables);

  const response = await pipe(
    subscription,
    filter((result) => !result.stale && !result.hasNext),
    take(1),
    toPromise
  );

  const backgroundAction = assertOperationSuccess(response, ["backgroundAction"]);
  return backgroundAction.status as BackgroundActionStatus;
};

/** @deprecated previous export name, @see backgroundActionResultRunner */
export const actionResultRunner: typeof backgroundActionResultRunner = backgroundActionResultRunner;

/**
 * Represents a handle to a background action which has been enqueued
 **/
export class BackgroundActionHandle<
  SchemaT,
  Action extends ActionFunctionMetadata<any, any, any, SchemaT, any, any> | GlobalActionFunction<any>,
> implements AnyBackgroundActionHandle<SchemaT, Action> {
  constructor(
    readonly connection: AnyConnection,
    readonly action: Action,
    readonly id: string
  ) {}

  /** Wait for this background action to complete and return the result. */
  async result<Options extends ActionFunctionOptions<Action>, ResultData = BackgroundActionResultData<Action, Options>>(
    options?: Options
  ): Promise<ResultData | null> {
    return (await backgroundActionResultRunner<SchemaT, Action, Options, ResultData>(this.connection, this.id, this.action, options))
      .result;
  }

  /** Cancel this background action by id. */
  async cancel(): Promise<void> {
    await cancelBackgroundActionRunner(this.connection, this.id);
  }

  /** Get the current status of this background action. */
  async status(): Promise<BackgroundActionStatus> {
    return await getBackgroundActionStatusRunner(this.connection, this.id);
  }
}
