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
var BackgroundActionHandle_exports = {};
__export(BackgroundActionHandle_exports, {
  BackgroundActionHandle: () => BackgroundActionHandle,
  actionResultRunner: () => actionResultRunner,
  backgroundActionResultRunner: () => backgroundActionResultRunner,
  cancelBackgroundActionRunner: () => cancelBackgroundActionRunner,
  getBackgroundActionStatusRunner: () => getBackgroundActionStatusRunner
});
module.exports = __toCommonJS(BackgroundActionHandle_exports);
var import_wonka = require("wonka");
var import_operationBuilders = require("./operationBuilders.js");
var import_support = require("./support.js");
const backgroundActionResultRunner = async (connection, id, action, options) => {
  const plan = (0, import_operationBuilders.backgroundActionResultOperation)(id, action, options);
  const subscription = connection.currentClient.subscription(plan.query, plan.variables);
  const response = await (0, import_wonka.pipe)(
    subscription,
    (0, import_wonka.filter)((operation) => {
      var _a, _b;
      return operation.error || ((_b = (_a = operation.data) == null ? void 0 : _a.backgroundAction) == null ? void 0 : _b.outcome);
    }),
    (0, import_wonka.take)(1),
    import_wonka.toPromise
  );
  const backgroundAction = (0, import_support.assertOperationSuccess)(response, ["backgroundAction"]);
  (0, import_support.assertResponseSuccess)(backgroundAction.result);
  switch (action.type) {
    case "action": {
      backgroundAction.result = (0, import_support.processActionResponse)(
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
  const plan = (0, import_operationBuilders.cancelBackgroundActionOperation)(id);
  const response = await connection.currentClient.mutation(plan.query, plan.variables).toPromise();
  (0, import_support.assertMutationSuccess)(response, ["background", "cancel"]);
};
const getBackgroundActionStatusRunner = async (connection, id) => {
  const plan = (0, import_operationBuilders.getBackgroundActionStatusOperation)(id);
  const subscription = connection.currentClient.subscription(plan.query, plan.variables);
  const response = await (0, import_wonka.pipe)(
    subscription,
    (0, import_wonka.filter)((result) => !result.stale && !result.hasNext),
    (0, import_wonka.take)(1),
    import_wonka.toPromise
  );
  const backgroundAction = (0, import_support.assertOperationSuccess)(response, ["backgroundAction"]);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BackgroundActionHandle,
  actionResultRunner,
  backgroundActionResultRunner,
  cancelBackgroundActionRunner,
  getBackgroundActionStatusRunner
});
//# sourceMappingURL=BackgroundActionHandle.js.map
