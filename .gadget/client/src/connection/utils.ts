import { Call, type FieldSelection } from "tiny-graphql-query-compiler";

/**
 * Build a selection object to retrieve the hydrations for a model from the `gadgetMeta` API
 **/
export const hydrationSelection = (modelApiIdentifier: string, namespace?: string | string[] | null): FieldSelection => {
  const fullyQualifiedIdentifier = namespace
    ? [...(Array.isArray(namespace) ? namespace : [namespace]), modelApiIdentifier].join(".")
    : modelApiIdentifier;

  return {
    gadgetMeta: {
      hydrations: Call({ modelName: fullyQualifiedIdentifier }),
    },
  };
};

export type BuildOperationResult = {
  query: string;
  variables: Record<string, any>;
};
