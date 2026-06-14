import type { Exchange, Operation } from "@urql/core";
import type { DocumentNode } from "graphql";
import { DefinitionNode, DirectiveNode, Kind, OperationDefinitionNode, OperationTypeNode } from "graphql";
import { Maybe } from "graphql/jsutils/Maybe";
import { filter, merge, pipe, tap } from "wonka";

/**
 * Exchange that prevents duplicate execution of live queries while allowing proper teardown and re-establishment.
 *
 * Live queries are long-running special subscriptions that receive real-time updates from the server. When mutations occur, urql's cache exchange tries to re-execute any mounted queries that could be affected and so re-executes live queries. Live queries automatically update their own data using their own persistent connection, so they shouldn't be re-executed if already mounted.
 */
export const liveQueryExchange: Exchange = ({ forward }) => {
  const executed = new Set<number>();

  const getOperationId = (op: Operation<any, any>) => {
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

const getLiveDirectiveNode = (input: DefinitionNode): Maybe<DirectiveNode> => {
  if (input.kind !== Kind.OPERATION_DEFINITION || input.operation !== OperationTypeNode.QUERY) {
    return null;
  }
  return input.directives?.find((d) => d.name.value === "live");
};

export const isLiveQueryOperationDefinitionNode = (input: DefinitionNode): input is OperationDefinitionNode => {
  return !!getLiveDirectiveNode(input);
};

/**
 * Returns true if the given operation document contains a live query.
 *
 * urql v6 widened the request `query` type to `DocumentNode | PersistedDocument | TypedDocumentNode`, and
 * `PersistedDocument` doesn't structurally expose `definitions`. Gadget never sends persisted documents, so the
 * query always carries definitions -- narrow to graphql's `DocumentNode` to read them.
 */
export const documentContainsLiveQuery = (query: Operation["query"]): boolean => {
  return (query as DocumentNode).definitions.some(isLiveQueryOperationDefinitionNode);
};
