import { buildModelManager } from "../builder.js";
const DefaultGameSelection = {
  __typename: true,
  id: true,
  createdAt: true,
  messageId: true,
  objectName: true,
  updatedAt: true,
  userId: true
};
const modelApiIdentifier = "game";
const pluralModelApiIdentifier = "games";
;
;
;
;
;
;
;
;
;
const operations = [
  {
    type: "findOne",
    operationName: modelApiIdentifier,
    modelApiIdentifier,
    findByVariableName: "id",
    defaultSelection: DefaultGameSelection,
    namespace: null
  },
  {
    type: "maybeFindOne",
    operationName: modelApiIdentifier,
    modelApiIdentifier,
    findByVariableName: "id",
    defaultSelection: DefaultGameSelection,
    namespace: null
  },
  {
    type: "findMany",
    operationName: pluralModelApiIdentifier,
    modelApiIdentifier,
    defaultSelection: DefaultGameSelection,
    namespace: null
  },
  {
    type: "findFirst",
    operationName: pluralModelApiIdentifier,
    modelApiIdentifier,
    defaultSelection: DefaultGameSelection,
    namespace: null
  },
  {
    type: "maybeFindFirst",
    operationName: pluralModelApiIdentifier,
    modelApiIdentifier,
    defaultSelection: DefaultGameSelection,
    namespace: null
  },
  {
    type: "findOne",
    operationName: pluralModelApiIdentifier,
    functionName: "findById",
    findByField: "id",
    findByVariableName: "id",
    modelApiIdentifier,
    defaultSelection: DefaultGameSelection,
    namespace: null
  },
  {
    type: "maybeFindOne",
    operationName: pluralModelApiIdentifier,
    functionName: "maybeFindById",
    findByField: "id",
    findByVariableName: "id",
    modelApiIdentifier,
    defaultSelection: DefaultGameSelection,
    namespace: null
  },
  {
    type: "action",
    operationName: "createGame",
    operationReturnType: "CreateGame",
    functionName: "create",
    namespace: null,
    modelApiIdentifier,
    operatesWithRecordIdentity: false,
    modelSelectionField: modelApiIdentifier,
    isBulk: false,
    isDeleter: false,
    variables: { game: { required: false, type: "CreateGameInput" } },
    hasAmbiguousIdentifier: false,
    paramOnlyVariables: [],
    hasReturnType: false,
    acceptsModelInput: true,
    hasCreateOrUpdateEffect: true,
    defaultSelection: DefaultGameSelection
  },
  {
    type: "action",
    operationName: "bulkCreateGames",
    functionName: "bulkCreate",
    isBulk: true,
    isDeleter: false,
    hasReturnType: false,
    acceptsModelInput: true,
    operatesWithRecordIdentity: false,
    singleActionFunctionName: "create",
    modelApiIdentifier,
    modelSelectionField: pluralModelApiIdentifier,
    namespace: null,
    variables: { inputs: { required: true, type: "[BulkCreateGamesInput!]" } },
    paramOnlyVariables: [],
    defaultSelection: DefaultGameSelection
  },
  {
    type: "action",
    operationName: "updateGame",
    operationReturnType: "UpdateGame",
    functionName: "update",
    namespace: null,
    modelApiIdentifier,
    operatesWithRecordIdentity: true,
    modelSelectionField: modelApiIdentifier,
    isBulk: false,
    isDeleter: false,
    variables: {
      id: { required: true, type: "GadgetID" },
      game: { required: false, type: "UpdateGameInput" }
    },
    hasAmbiguousIdentifier: false,
    paramOnlyVariables: [],
    hasReturnType: false,
    acceptsModelInput: true,
    hasCreateOrUpdateEffect: true,
    defaultSelection: DefaultGameSelection
  },
  {
    type: "action",
    operationName: "bulkUpdateGames",
    functionName: "bulkUpdate",
    isBulk: true,
    isDeleter: false,
    hasReturnType: false,
    acceptsModelInput: true,
    operatesWithRecordIdentity: true,
    singleActionFunctionName: "update",
    modelApiIdentifier,
    modelSelectionField: pluralModelApiIdentifier,
    namespace: null,
    variables: { inputs: { required: true, type: "[BulkUpdateGamesInput!]" } },
    paramOnlyVariables: [],
    defaultSelection: DefaultGameSelection
  },
  {
    type: "action",
    operationName: "deleteGame",
    operationReturnType: "DeleteGame",
    functionName: "delete",
    namespace: null,
    modelApiIdentifier,
    operatesWithRecordIdentity: true,
    modelSelectionField: modelApiIdentifier,
    isBulk: false,
    isDeleter: true,
    variables: { id: { required: true, type: "GadgetID" } },
    hasAmbiguousIdentifier: false,
    paramOnlyVariables: [],
    hasReturnType: false,
    acceptsModelInput: false,
    hasCreateOrUpdateEffect: false,
    defaultSelection: null
  },
  {
    type: "action",
    operationName: "bulkDeleteGames",
    functionName: "bulkDelete",
    isBulk: true,
    isDeleter: true,
    hasReturnType: false,
    acceptsModelInput: false,
    operatesWithRecordIdentity: true,
    singleActionFunctionName: "delete",
    modelApiIdentifier,
    modelSelectionField: pluralModelApiIdentifier,
    namespace: null,
    variables: { ids: { required: true, type: "[GadgetID!]" } },
    paramOnlyVariables: [],
    defaultSelection: null
  },
  {
    type: "action",
    operationName: "upsertGame",
    operationReturnType: "UpsertGame",
    functionName: "upsert",
    namespace: null,
    modelApiIdentifier,
    operatesWithRecordIdentity: false,
    modelSelectionField: modelApiIdentifier,
    isBulk: false,
    isDeleter: false,
    variables: {
      on: { required: false, type: "[String!]" },
      game: { required: false, type: "UpsertGameInput" }
    },
    hasAmbiguousIdentifier: false,
    paramOnlyVariables: ["on"],
    hasReturnType: {
      "... on CreateGameResult": { hasReturnType: false },
      "... on UpdateGameResult": { hasReturnType: false }
    },
    acceptsModelInput: true,
    hasCreateOrUpdateEffect: true,
    defaultSelection: DefaultGameSelection
  },
  {
    type: "action",
    operationName: "bulkUpsertGames",
    functionName: "bulkUpsert",
    isBulk: true,
    isDeleter: false,
    hasReturnType: false,
    acceptsModelInput: true,
    operatesWithRecordIdentity: false,
    singleActionFunctionName: "upsert",
    modelApiIdentifier,
    modelSelectionField: pluralModelApiIdentifier,
    namespace: null,
    variables: { inputs: { required: true, type: "[BulkUpsertGamesInput!]" } },
    paramOnlyVariables: ["on"],
    defaultSelection: DefaultGameSelection
  },
  {
    type: "computedView",
    operationName: "view",
    functionName: "view",
    gqlFieldName: "gameGellyView",
    namespace: null,
    variables: {
      query: { type: "String", required: true },
      args: { type: "JSONObject" }
    }
  }
];
const GameManager = buildModelManager(
  modelApiIdentifier,
  pluralModelApiIdentifier,
  DefaultGameSelection,
  operations
);
export {
  DefaultGameSelection,
  GameManager
};
//# sourceMappingURL=Game.js.map
