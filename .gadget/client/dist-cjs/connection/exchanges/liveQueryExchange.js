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
var liveQueryExchange_exports = {};
__export(liveQueryExchange_exports, {
  documentContainsLiveQuery: () => documentContainsLiveQuery,
  isLiveQueryOperationDefinitionNode: () => isLiveQueryOperationDefinitionNode,
  liveQueryExchange: () => liveQueryExchange
});
module.exports = __toCommonJS(liveQueryExchange_exports);
var import_graphql = require("graphql");
var import_wonka = require("wonka");
const liveQueryExchange = ({ forward }) => {
  const executed = /* @__PURE__ */ new Set();
  const getOperationId = (op) => {
    return op.key;
  };
  return (operations$) => {
    const notLive = (0, import_wonka.pipe)(
      operations$,
      (0, import_wonka.filter)((op) => !documentContainsLiveQuery(op.query))
    );
    const live = (0, import_wonka.pipe)(
      operations$,
      (0, import_wonka.filter)((op) => documentContainsLiveQuery(op.query)),
      (0, import_wonka.filter)((op) => {
        const opId = getOperationId(op);
        return !executed.has(opId) || op.kind !== "query";
      }),
      (0, import_wonka.tap)((op) => {
        const opId = getOperationId(op);
        if (op.kind === "query") {
          executed.add(opId);
        } else if (op.kind === "teardown") {
          executed.delete(opId);
        }
      })
    );
    return forward((0, import_wonka.merge)([live, notLive]));
  };
};
const getLiveDirectiveNode = (input) => {
  var _a;
  if (input.kind !== import_graphql.Kind.OPERATION_DEFINITION || input.operation !== import_graphql.OperationTypeNode.QUERY) {
    return null;
  }
  return (_a = input.directives) == null ? void 0 : _a.find((d) => d.name.value === "live");
};
const isLiveQueryOperationDefinitionNode = (input) => {
  return !!getLiveDirectiveNode(input);
};
const documentContainsLiveQuery = (query) => {
  return query.definitions.some(isLiveQueryOperationDefinitionNode);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  documentContainsLiveQuery,
  isLiveQueryOperationDefinitionNode,
  liveQueryExchange
});
//# sourceMappingURL=liveQueryExchange.js.map
