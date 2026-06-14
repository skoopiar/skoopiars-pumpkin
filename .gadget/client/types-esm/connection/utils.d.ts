import { type FieldSelection } from "tiny-graphql-query-compiler";
/**
 * Build a selection object to retrieve the hydrations for a model from the `gadgetMeta` API
 **/ export declare const hydrationSelection: (modelApiIdentifier: string, namespace?: string | string[] | null) => FieldSelection;
export type BuildOperationResult = {
    query: string;
    variables: Record<string, any>;
};
