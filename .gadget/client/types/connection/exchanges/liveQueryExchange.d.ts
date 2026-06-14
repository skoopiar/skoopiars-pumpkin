import type { Exchange, Operation } from "@urql/core";
import type { DocumentNode } from "graphql";
import { DefinitionNode, OperationDefinitionNode } from "graphql";
/**
 * Exchange that prevents duplicate execution of live queries while allowing proper teardown and re-establishment.
 *
 * Live queries are long-running special subscriptions that receive real-time updates from the server. When mutations occur, urql's cache exchange tries to re-execute any mounted queries that could be affected and so re-executes live queries. Live queries automatically update their own data using their own persistent connection, so they shouldn't be re-executed if already mounted.
 */ export declare const liveQueryExchange: Exchange;
export declare const isLiveQueryOperationDefinitionNode: (input: DefinitionNode) => input is OperationDefinitionNode;
/**
 * Returns true if the given operation document contains a live query.
 *
 * urql v6 widened the request `query` type to `DocumentNode | PersistedDocument | TypedDocumentNode`, and
 * `PersistedDocument` doesn't structurally expose `definitions`. Gadget never sends persisted documents, so the
 * query always carries definitions -- narrow to graphql's `DocumentNode` to read them.
 */ export declare const documentContainsLiveQuery: (query: Operation["query"]) => boolean;
