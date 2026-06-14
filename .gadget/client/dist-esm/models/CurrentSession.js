import { buildModelManager } from "../builder.js";
const DefaultSessionSelection = {
  __typename: true,
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true
};
const modelApiIdentifier = "session";
const pluralModelApiIdentifier = "sessions";
;
const operations = [
  {
    type: "get",
    operationName: "currentSession",
    defaultSelection: DefaultSessionSelection,
    modelApiIdentifier,
    namespace: null
  }
];
const CurrentSessionManager = buildModelManager(
  modelApiIdentifier,
  pluralModelApiIdentifier,
  DefaultSessionSelection,
  operations
);
export {
  CurrentSessionManager,
  DefaultSessionSelection
};
//# sourceMappingURL=CurrentSession.js.map
