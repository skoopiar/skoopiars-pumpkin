import { Call } from "tiny-graphql-query-compiler";
const hydrationSelection = (modelApiIdentifier, namespace) => {
  const fullyQualifiedIdentifier = namespace ? [...Array.isArray(namespace) ? namespace : [namespace], modelApiIdentifier].join(".") : modelApiIdentifier;
  return {
    gadgetMeta: {
      hydrations: Call({ modelName: fullyQualifiedIdentifier })
    }
  };
};
export {
  hydrationSelection
};
//# sourceMappingURL=utils.js.map
