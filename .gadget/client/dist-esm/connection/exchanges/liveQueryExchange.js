import { Kind, OperationTypeNode } from "graphql";
import { filter, merge, pipe, tap } from "wonka";
const liveQueryExchange = ({ forward }) => {
  const executed = /* @__PURE__ */ new Set();
  const getOperationId = (op) => {
    return op.key;
  };
  return (operations$) => {
    const notLive = pipe(
      operations$,
      filter((op) => !documentContainsLiveQuery(op.query))
    );
    const live = pipe(
      operations$,
      filter((op) => documentContainsLiveQuery(op.query)),
      filter((op) => {
        const opId = getOperationId(op);
        return !executed.has(opId) || op.kind !== "query";
      }),
      tap((op) => {
        const opId = getOperationId(op);
        if (op.kind === "query") {
          executed.add(opId);
        } else if (op.kind === "teardown") {
          executed.delete(opId);
        }
      })
    );
    return forward(merge([live, notLive]));
  };
};
const getLiveDirectiveNode = (input) => {
  if (input.kind !== Kind.OPERATION_DEFINITION || input.operation !== OperationTypeNode.QUERY) {
    return null;
  }
  return input.directives?.find((d) => d.name.value === "live");
};
const isLiveQueryOperationDefinitionNode = (input) => {
  return !!getLiveDirectiveNode(input);
};
const documentContainsLiveQuery = (query) => {
  return query.definitions.some(isLiveQueryOperationDefinitionNode);
};
export {
  documentContainsLiveQuery,
  isLiveQueryOperationDefinitionNode,
  liveQueryExchange
};
//# sourceMappingURL=liveQueryExchange.js.map
