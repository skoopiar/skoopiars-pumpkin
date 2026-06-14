import { filter, pipe, take, toPromise } from "wonka";
import { backgroundActionResultOperation, cancelBackgroundActionOperation, getBackgroundActionStatusOperation } from "./operationBuilders.js";
import { assertMutationSuccess, assertOperationSuccess, assertResponseSuccess, processActionResponse } from "./support.js";
const backgroundActionResultRunner = async (connection, id, action, options) => {
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
  return backgroundAction;
};
const cancelBackgroundActionRunner = async (connection, id) => {
  const plan = cancelBackgroundActionOperation(id);
  const response = await connection.currentClient.mutation(plan.query, plan.variables).toPromise();
  assertMutationSuccess(response, ["background", "cancel"]);
};
const getBackgroundActionStatusRunner = async (connection, id) => {
  const plan = getBackgroundActionStatusOperation(id);
  const subscription = connection.currentClient.subscription(plan.query, plan.variables);
  const response = await pipe(
    subscription,
    filter((result) => !result.stale && !result.hasNext),
    take(1),
    toPromise
  );
  const backgroundAction = assertOperationSuccess(response, ["backgroundAction"]);
  return backgroundAction.status;
};
const actionResultRunner = backgroundActionResultRunner;
class BackgroundActionHandle {
  constructor(connection, action, id) {
    this.connection = connection;
    this.action = action;
    this.id = id;
  }
  /** Wait for this background action to complete and return the result. */
  async result(options) {
    return (await backgroundActionResultRunner(this.connection, this.id, this.action, options)).result;
  }
  /** Cancel this background action by id. */
  async cancel() {
    await cancelBackgroundActionRunner(this.connection, this.id);
  }
  /** Get the current status of this background action. */
  async status() {
    return await getBackgroundActionStatusRunner(this.connection, this.id);
  }
}
export {
  BackgroundActionHandle,
  actionResultRunner,
  backgroundActionResultRunner,
  cancelBackgroundActionRunner,
  getBackgroundActionStatusRunner
};
//# sourceMappingURL=BackgroundActionHandle.js.map
