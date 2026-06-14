import type { Exchange } from "@urql/core";
import { mapExchange } from "@urql/core";
import type { DocumentNode, OperationDefinitionNode } from "graphql";
import { Kind } from "graphql";

const graphqlDocumentName = (doc: DocumentNode) => {
  const lastDefinition: OperationDefinitionNode | undefined = [...doc.definitions]
    .reverse()
    .find((definition) => definition.kind == Kind.OPERATION_DEFINITION) as any;
  if (lastDefinition) {
    if (lastDefinition.name) {
      return lastDefinition.name.value;
    }
    const firstSelection = lastDefinition.selectionSet.selections.find((node) => node.kind == Kind.FIELD) as any;
    return firstSelection.name.value;
  }
};

export const operationNameExchange: Exchange = mapExchange({
  onOperation: (operation) => {
    // urql v6 widened `query` to `DocumentNode | PersistedDocument | TypedDocumentNode`; Gadget never sends
    // persisted documents, so narrow to graphql's `DocumentNode` to read the operation definitions.
    operation.context.operationName ??= graphqlDocumentName(operation.query as DocumentNode) || "unknown";
  },
});
