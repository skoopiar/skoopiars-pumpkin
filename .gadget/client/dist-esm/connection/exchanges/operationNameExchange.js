import { mapExchange } from "@urql/core";
import { Kind } from "graphql";
const graphqlDocumentName = (doc) => {
  const lastDefinition = [...doc.definitions].reverse().find((definition) => definition.kind == Kind.OPERATION_DEFINITION);
  if (lastDefinition) {
    if (lastDefinition.name) {
      return lastDefinition.name.value;
    }
    const firstSelection = lastDefinition.selectionSet.selections.find((node) => node.kind == Kind.FIELD);
    return firstSelection.name.value;
  }
};
const operationNameExchange = mapExchange({
  onOperation: (operation) => {
    var _a;
    (_a = operation.context).operationName ?? (_a.operationName = graphqlDocumentName(operation.query) || "unknown");
  }
});
export {
  operationNameExchange
};
//# sourceMappingURL=operationNameExchange.js.map
