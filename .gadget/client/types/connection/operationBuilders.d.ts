import type { ActionFunctionOptions, AnyActionFunction, BaseFindOptions, EnqueueBackgroundActionOptions, FieldSelection, FindManyOptions, HasReturnType, VariablesOptions } from "@gadgetinc/core";
import type { FieldSelection as BuilderFieldSelection, BuilderOperation, Variable } from "tiny-graphql-query-compiler";
import { type BuildOperationResult } from "./utils.js";
/**
 * When a user provides a select override with `true` for a field that requires sub-selections
 * (e.g. RichText, File, RoleAssignments), auto-expand it to use the default sub-selection.
 * This allows users to write `{ richTextField: true }` instead of `{ richTextField: { markdown: true, truncatedHTML: true } }`.
 */ export declare const expandSelection: (selection: FieldSelection, defaultSelection: FieldSelection) => FieldSelection;
export type FindFirstPaginationOptions = Omit<FindManyOptions, "first" | "last" | "before" | "after">;
export declare const findOneOperation: (operation: string, id: string | undefined, defaultSelection: FieldSelection, modelApiIdentifier: string, options?: BaseFindOptions | null, namespace?: string | string[] | null) => BuildOperationResult;
export declare const findOneByFieldOperation: (operation: string, fieldName: string, fieldValue: string, defaultSelection: FieldSelection, modelApiIdentifier: string, options?: BaseFindOptions | null, namespace?: string | string[] | null) => BuildOperationResult;
export declare const findManyOperation: (operation: string, defaultSelection: FieldSelection, modelApiIdentifier: string, options?: FindManyOptions, namespace?: string | string[] | null) => BuildOperationResult;
export declare const actionOperation: (operation: string, defaultSelection: FieldSelection | null, modelApiIdentifier: string, modelSelectionField: string, variables: VariablesOptions, options?: BaseFindOptions | null, namespace?: string | string[] | null, isBulkAction?: boolean | null, hasReturnType?: HasReturnType | null) => BuildOperationResult;
export declare const backgroundActionResultOperation: <Action extends AnyActionFunction, Options extends ActionFunctionOptions<Action>>(id: string, action: Action, options?: Options) => BuildOperationResult;
/** @deprecated previous export name, @see backgroundActionResultOperation */ export declare const actionResultOperation: typeof backgroundActionResultOperation;
export declare const globalActionOperation: (operation: string, variables: VariablesOptions, namespace?: string | string[] | null, options?: {
    live?: boolean;
}) => BuildOperationResult;
export interface GraphQLBackgroundActionOptions {
    shopifyShop?: string;
    retries?: {
        retryCount: number;
    };
    queue?: {
        name: string;
        maxConcurrency?: number;
    };
    priority?: "LOW" | "DEFAULT" | "HIGH";
    startAt?: string;
}
export declare const graphqlizeBackgroundOptions: (options?: EnqueueBackgroundActionOptions<any> | null) => GraphQLBackgroundActionOptions | null;
export declare const enqueueActionOperation: (operation: string, variables: VariablesOptions, namespace?: string | string[] | null, options?: EnqueueBackgroundActionOptions<any> | null, isBulk?: boolean) => BuildOperationResult;
export declare const cancelBackgroundActionOperation: (id: string) => BuildOperationResult;
export declare const getBackgroundActionStatusOperation: (id: string) => BuildOperationResult;
export declare const computedViewOperation: (gqlFieldName: string, variablesOptions?: VariablesOptions, namespace?: string | string[] | null) => BuildOperationResult;
export declare const inlineComputedViewOperation: (query: string, gqlFieldName: string, variables?: Record<string, any>, namespace?: string | string[] | null) => BuildOperationResult;
