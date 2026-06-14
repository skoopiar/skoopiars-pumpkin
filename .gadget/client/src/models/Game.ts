import { GadgetRecord, GadgetRecordList, DefaultSelection, LimitToKnownKeys, Selectable, AvailableSelection, AllFieldsSelected, SomeFieldsSelected, Select, DeepFilterNever, FieldSelection, ProcessResultFunction, GQLBuilderResult } from "@gadgetinc/core"
import {
  Query,
  ExplicitNestingRequired,

  IDsList,
  PromiseOrLiveIterator,
  Game,
  AvailableGameSelection,
  GameSort,
  GameFilter,
  GameSearchFields,
  CreateGameInput,
  UpdateGameInput,
  Scalars,
  UpsertGameInput
} from "../types.js";
import { buildModelManager, type ModelManagerOperation, type StubbedActionOperation } from "../builder.js";

import { GadgetConnection } from "../connection/GadgetConnection.js";
import { actionRunner, findManyRunner, findOneRunner, findOneByFieldRunner } from "../connection/operationRunners.js";
import { GadgetNonUniqueDataError } from "../connection/support.js";

/**
* A type that holds only the selected fields (and nested fields) of game. The present fields in the result type of this are dynamic based on the options to each call that uses it.
* The selected fields are sometimes given by the `Options` at `Options["select"]`, and if a selection isn't made in the options, we use the default selection from above.
*/
export type SelectedGameOrDefault<Options extends Selectable<AvailableGameSelection>> = DeepFilterNever<
    Select<
      Game,
      DefaultSelection<
        AvailableGameSelection,
        Options,
        typeof DefaultGameSelection
      >
    >
  >;

/**
 * A type that represents a `GadgetRecord` type for game.
 * It selects all fields of the model by default. If you want to represent a record type with a subset of fields, you could pass in an object in the `Selection` type parameter.
 *
 * @example
 * ```ts
 * const someFunction = (record: GameRecord, recordWithName: GameRecord<{ select: { name: true; } }>) => {
 *   // The type of the `record` variable will include all fields of the model.
 *   const name = record.name;
 *   const otherField = record.otherField;
 *
 *   // The type of the `recordWithName` variable will only include the selected fields.
 *   const name = recordWithName.name;
 *   const otherField = recordWithName.otherField; // Type error: Property 'otherField' does not exist on type 'GadgetRecord<{ name: true; }>'.
 * }
 * ```
 */
export type GameRecord<Selection extends AvailableGameSelection | undefined = typeof DefaultGameSelection> = DeepFilterNever<
  GadgetRecord<
    SelectedGameOrDefault<{
      select: Selection;
    }>
  >
>;

export const DefaultGameSelection = {
     __typename: true,
     id: true,
     createdAt: true,
     messageId: true,
     objectName: true,
     updatedAt: true,
     userId: true
   } as const;
const modelApiIdentifier = "game" as const;
const pluralModelApiIdentifier = "games" as const;
/** Options that can be passed to the `GameManager#findOne` method */
 export interface FindOneGameOptions {
  /** Select fields other than the defaults of the record to return */
  select?: AvailableGameSelection;
  /** Run a realtime query instead of running the query only once. Returns an AsyncIterator of new results when the result changes on the backend. */
  live?: boolean;
};
/** Options that can be passed to the `GameManager#maybeFindOne` method */
 export interface MaybeFindOneGameOptions {
  /** Select fields other than the defaults of the record to return */
  select?: AvailableGameSelection;
  /** Run a realtime query instead of running the query only once. Returns an AsyncIterator of new results when the result changes on the backend. */
  live?: boolean;
};
/** Options that can be passed to the `GameManager#findMany` method */
 export interface FindManyGamesOptions {
  /** Select fields other than the defaults of the record to return */
  select?: AvailableGameSelection;
  /** Run a realtime query instead of running the query only once. Returns an AsyncIterator of new results when the result changes on the backend. */
  live?: boolean;
  /** Return records sorted by these sorts */
  sort?: GameSort | GameSort[] | null;
  /** Only return records matching these filters. */
  filter?: GameFilter | GameFilter[] | null;
  /** Search is not enabled for this model. It can be enabled in the model's index options.*/
  search?: never;
  /** Which fields on a record to search. If not specified, all searchable fields will be searched. */
  searchFields?: GameSearchFields | null;
  first?: number | null;
  last?: number | null;
  after?: string | null;
  before?: string | null;
};
/** Options that can be passed to the `GameManager#findFirst` method */
 export interface FindFirstGameOptions {
  /** Select fields other than the defaults of the record to return */
  select?: AvailableGameSelection;
  /** Run a realtime query instead of running the query only once. Returns an AsyncIterator of new results when the result changes on the backend. */
  live?: boolean;
  /** Return records sorted by these sorts */
  sort?: GameSort | GameSort[] | null;
  /** Only return records matching these filters. */
  filter?: GameFilter | GameFilter[] | null;
  /** Search is not enabled for this model. It can be enabled in the model's index options.*/
  search?: never;
  /** Which fields on a record to search. If not specified, all searchable fields will be searched. */
  searchFields?: GameSearchFields | null;
};
/** Options that can be passed to the `GameManager#maybeFindFirst` method */
 export interface MaybeFindFirstGameOptions {
  /** Select fields other than the defaults of the record to return */
  select?: AvailableGameSelection;
  /** Run a realtime query instead of running the query only once. Returns an AsyncIterator of new results when the result changes on the backend. */
  live?: boolean;
  /** Return records sorted by these sorts */
  sort?: GameSort | GameSort[] | null;
  /** Only return records matching these filters. */
  filter?: GameFilter | GameFilter[] | null;
  /** Search is not enabled for this model. It can be enabled in the model's index options.*/
  search?: never;
  /** Which fields on a record to search. If not specified, all searchable fields will be searched. */
  searchFields?: GameSearchFields | null;
};
export interface CreateGameOptions {
  /** Select fields other than the defaults of the record to return */
  select?: AvailableGameSelection;
};
export interface UpdateGameOptions {
  /** Select fields other than the defaults of the record to return */
  select?: AvailableGameSelection;
};
export interface DeleteGameOptions {

};
export interface UpsertGameOptions {
  /** Select fields other than the defaults of the record to return */
  select?: AvailableGameSelection;
};
/**
 * The fully-qualified, expanded form of the inputs for executing the create action.
 * The flattened style should be preferred over this style, but for models with ambiguous API identifiers, this style can be used to remove any ambiguity.
 **/
export type FullyQualifiedCreateGameVariables = {
  game?: CreateGameInput;
}
/**
 * The inputs for executing create on game.
 * This is the flattened style of inputs, suitable for general use, and should be preferred.
 **/
export type CreateGameVariables = CreateGameInput;
/**
 * The return value from executing create on game
 * Is a GadgetRecord of the model's type.
 **/
export type CreateGameResult<Options extends CreateGameOptions> = SelectedGameOrDefault<Options> extends void ?
      void :
      GadgetRecord<SelectedGameOrDefault<Options>>;
/**
 * The fully-qualified, expanded form of the inputs for executing the update action.
 * The flattened style should be preferred over this style, but for models with ambiguous API identifiers, this style can be used to remove any ambiguity.
 **/
export type FullyQualifiedUpdateGameVariables = {
  game?: UpdateGameInput;
}
/**
 * The inputs for executing update on game.
 * This is the flattened style of inputs, suitable for general use, and should be preferred.
 **/
export type UpdateGameVariables = UpdateGameInput;
/**
 * The return value from executing update on game
 * Is a GadgetRecord of the model's type.
 **/
export type UpdateGameResult<Options extends UpdateGameOptions> = SelectedGameOrDefault<Options> extends void ?
      void :
      GadgetRecord<SelectedGameOrDefault<Options>>;
/**
 * The return value from executing delete on game
 * Is void because this action deletes the record
 **/
export type DeleteGameResult<Options extends DeleteGameOptions> = void;
/**
 * The fully-qualified, expanded form of the inputs for executing the upsert action.
 * The flattened style should be preferred over this style, but for models with ambiguous API identifiers, this style can be used to remove any ambiguity.
 **/
export type FullyQualifiedUpsertGameVariables = {
  on?: ((Scalars['String'] | null))[];
  game?: UpsertGameInput;
}
/**
 * The inputs for executing upsert on game.
 * This is the flattened style of inputs, suitable for general use, and should be preferred.
 **/
export type UpsertGameVariables = Omit<
     UpsertGameInput,
     "on"
   > & {
     on?: ((Scalars['String'] | null))[];
   };
/**
 * The return value from executing upsert on game
 *
 **/
export type UpsertGameResult<Options extends UpsertGameOptions> = SelectedGameOrDefault<Options> extends void ?
      void :
      GadgetRecord<SelectedGameOrDefault<Options>>;

/**
 * A manager for the game model with all the available operations for reading and writing to it.*/
export type GameManager = {
  readonly connection: GadgetConnection;

  findOne: {
      /**
       * Finds one game by ID. Returns a `Promise` that resolves to the record if found and rejects the promise if the record isn't found.
       **/
      <Options extends FindOneGameOptions>(id: string, options?: LimitToKnownKeys<Options, FindOneGameOptions>): PromiseOrLiveIterator<Options,GameRecord<Options["select"]>>;
      type: 'findOne';
      operationName: typeof modelApiIdentifier;
      modelApiIdentifier: typeof modelApiIdentifier;
      findByVariableName: 'id';
      defaultSelection: typeof DefaultGameSelection;
      namespace: null;
      optionsType: FindOneGameOptions;
      selectionType: AvailableGameSelection;
      schemaType: Query["game"];
      plan: <Options extends FindOneGameOptions>(fieldValue: string, options?: LimitToKnownKeys<Options, FindOneGameOptions>) => GQLBuilderResult;
      processResult: ProcessResultFunction;
    }
  maybeFindOne: {
      /**
       * Finds one game by ID. Returns a `Promise` that resolves to the record if found and returns null otherwise.
       **/
      <Options extends MaybeFindOneGameOptions>(id: string, options?: LimitToKnownKeys<Options, MaybeFindOneGameOptions>): PromiseOrLiveIterator<Options,GameRecord<Options["select"]> | null>;
      type: 'maybeFindOne';
      operationName: typeof modelApiIdentifier;
      modelApiIdentifier: typeof modelApiIdentifier;
      optionsType: MaybeFindOneGameOptions;
      findByVariableName: 'id';
      defaultSelection: typeof DefaultGameSelection;
      namespace: null;
      selectionType: AvailableGameSelection;
      schemaType: Query["game"];
      plan: <Options extends MaybeFindOneGameOptions>(fieldValue: string, options?: LimitToKnownKeys<Options, MaybeFindOneGameOptions>) => GQLBuilderResult;
      processResult: ProcessResultFunction;
    }
  findMany: {
      /**
       * Finds many game. Returns a `Promise` for a `GadgetRecordList` of objects according to the passed `options`. Optionally filters the returned records using `filter` option, sorts records using the `sort` option, searches using the `search` options, and paginates using the `last`/`before` and `first`/`after` pagination options.
       **/
      <Options extends FindManyGamesOptions>(options?: LimitToKnownKeys<Options, FindManyGamesOptions>): PromiseOrLiveIterator<Options,GadgetRecordList<GameRecord<Options["select"]>>>;
      type: 'findMany';
      operationName: typeof pluralModelApiIdentifier;
      modelApiIdentifier: typeof modelApiIdentifier;
      optionsType: FindManyGamesOptions;
      defaultSelection: typeof DefaultGameSelection;
      namespace: null;
      selectionType: AvailableGameSelection;
      schemaType: Query["game"];
      plan: <Options extends FindManyGamesOptions>(options?: LimitToKnownKeys<Options, FindManyGamesOptions>) => GQLBuilderResult;
      processResult: ProcessResultFunction;
    }
  findFirst: {
      /**
       * Finds the first matching game. Returns a `Promise` that resolves to a record if found and rejects the promise if a record isn't found, according to the passed `options`. Optionally filters the searched records using `filter` option, sorts records using the `sort` option, searches using the `search` options, and paginates using the `last`/`before` and `first`/`after` pagination options.
       **/
      <Options extends FindFirstGameOptions>(options?: LimitToKnownKeys<Options, FindFirstGameOptions>): PromiseOrLiveIterator<Options,GameRecord<Options["select"]>>;
      type: 'findFirst';
      operationName: typeof pluralModelApiIdentifier;
      optionsType: FindFirstGameOptions;
      modelApiIdentifier: typeof modelApiIdentifier;
      defaultSelection: typeof DefaultGameSelection;
      namespace: null;
      selectionType: AvailableGameSelection;
      schemaType: Query["game"];
      plan: <Options extends FindFirstGameOptions>(options?: LimitToKnownKeys<Options, FindFirstGameOptions>) => GQLBuilderResult;
      processResult: ProcessResultFunction;
    }
  maybeFindFirst: {
      /**
       * Finds the first matching game. Returns a `Promise` that resolves to a record if found, or null if a record isn't found, according to the passed `options`. Optionally filters the searched records using `filter` option, sorts records using the `sort` option, searches using the `search` options, and paginates using the `last`/`before` pagination options.
       **/
      <Options extends MaybeFindFirstGameOptions>(options?: LimitToKnownKeys<Options, MaybeFindFirstGameOptions>): PromiseOrLiveIterator<Options,GameRecord<Options["select"]> | null>;
      type: 'maybeFindFirst';
      operationName: typeof pluralModelApiIdentifier;
      optionsType: MaybeFindFirstGameOptions;
      modelApiIdentifier: typeof modelApiIdentifier;
      defaultSelection: typeof DefaultGameSelection;
      namespace: null;
      selectionType: AvailableGameSelection;
      schemaType: Query["game"];
      plan: <Options extends MaybeFindFirstGameOptions>(options?: LimitToKnownKeys<Options, MaybeFindFirstGameOptions>) => GQLBuilderResult;
      processResult: ProcessResultFunction;
    }
  findById: {
      /**
      * Finds one game by its id. Returns a Promise that resolves to the record if found and rejects the promise if the record isn't found.
      **/
      <Options extends FindOneGameOptions>(value: string, options?: LimitToKnownKeys<Options, FindOneGameOptions>): PromiseOrLiveIterator<Options,GameRecord<Options["select"]>>;
      type: 'findOne';
      operationName: typeof pluralModelApiIdentifier;
      findByField: 'id';
      findByVariableName: 'id';
      optionsType: FindOneGameOptions;
      modelApiIdentifier: typeof modelApiIdentifier;
      defaultSelection: typeof DefaultGameSelection;
      namespace: null;
      selectionType: AvailableGameSelection;
      schemaType: Query["game"];
      plan: <Options extends FindOneGameOptions>(value: string, options?: LimitToKnownKeys<Options, FindOneGameOptions>) => GQLBuilderResult;
      processResult: ProcessResultFunction;
    }
  maybeFindById: {
      /**
      * Finds one game by its id. Returns a Promise that resolves to the record if found and returns null if the record isn't found.
      **/
      <Options extends MaybeFindOneGameOptions>(value: string, options?: LimitToKnownKeys<Options, MaybeFindOneGameOptions>): Promise<GameRecord<Options["select"]> | null>;
      type: 'maybeFindOne';
      operationName: typeof pluralModelApiIdentifier;
      findByField: 'id';
      findByVariableName: 'id';
      optionsType: MaybeFindOneGameOptions;
      modelApiIdentifier: typeof modelApiIdentifier;
      defaultSelection: typeof DefaultGameSelection;
      namespace: null;
      selectionType: AvailableGameSelection;
      schemaType: Query["game"];
      plan: <Options extends MaybeFindOneGameOptions>(value: string, options?: LimitToKnownKeys<Options, MaybeFindOneGameOptions>) => GQLBuilderResult;
      processResult: ProcessResultFunction;
    }
  create: {
      /**
       * Executes the create action.Accepts the parameters for the action via the `variables` argument.Runs the action and returns a Promise for the updated record.
      *
      * This is the flat style, all-params-together overload that most use cases should use.
      *
      * @example
      * * const gameRecord = await api.game.create({
        *   messageId: "example value for messageId",
        *   objectName: "example value for objectName",
        *   userId: "example value for userId",
        * });
      **/
      <Options extends CreateGameOptions>(
      
        variables: CreateGameVariables,
        options?: LimitToKnownKeys<Options, CreateGameOptions>
      ): Promise<CreateGameResult<Options>>;
      /**
       * Executes the create action.Accepts the parameters for the action via the `variables` argument.Runs the action and returns a Promise for the updated record.
      *
      * This is the fully qualified, nested api identifier style overload that should be used when there's an ambiguity between an action param and a model field.
      *
      * @example
      * * const gameRecord = await api.game.create({
        *   game: {
        *     messageId: "example value for messageId",
        *     objectName: "example value for objectName",
        *     userId: "example value for userId",
        *   },
        * });
      **/
      <Options extends CreateGameOptions>(
      
        variables: FullyQualifiedCreateGameVariables,
        options?: LimitToKnownKeys<Options, CreateGameOptions>
      ): Promise<CreateGameResult<Options>>;
      type: 'action';
      operationName: 'createGame';
      operationReturnType: 'CreateGame';
      namespace: null;
      modelApiIdentifier: typeof modelApiIdentifier;
      operatesWithRecordIdentity: false;
      modelSelectionField: typeof modelApiIdentifier;
      isBulk: false;
      isDeleter: false;
      variables: { game: { required: false, type: 'CreateGameInput' } };
      variablesType: ((
               
               & (FullyQualifiedCreateGameVariables | CreateGameVariables)
             ) | undefined);
      hasAmbiguousIdentifier: false;
      paramOnlyVariables: [];
      hasReturnType: false;
      acceptsModelInput: true;
      hasCreateOrUpdateEffect: true;
      imports: [ 'CreateGameInput' ];
      optionsType: CreateGameOptions;
      selectionType: AvailableGameSelection;
      schemaType: Query["game"];
      defaultSelection: typeof DefaultGameSelection;
      plan: <Options extends CreateGameOptions>(options?: LimitToKnownKeys<Options, CreateGameOptions>) => GQLBuilderResult;
      processResult: ProcessResultFunction;
    }
  bulkCreate: {
      /**
        * Executes the bulkCreate action with the given inputs.
        */
       <Options extends CreateGameOptions>(
          inputs: (FullyQualifiedCreateGameVariables | CreateGameVariables)[],
          options?: LimitToKnownKeys<Options, CreateGameOptions>
       ): Promise<CreateGameResult<Options>[]>
      type: 'action';
      operationName: 'bulkCreateGames';
      isBulk: true;
      isDeleter: false;
      hasReturnType: false;
      acceptsModelInput: true;
      operatesWithRecordIdentity: false;
      singleActionFunctionName: 'create';
      modelApiIdentifier: typeof modelApiIdentifier;
      modelSelectionField: typeof pluralModelApiIdentifier;
      optionsType: CreateGameOptions;
      namespace: null;
      variables: { inputs: { required: true, type: '[BulkCreateGamesInput!]' } };
      variablesType: (FullyQualifiedCreateGameVariables | CreateGameVariables)[];
      paramOnlyVariables: [];
      selectionType: AvailableGameSelection;
      schemaType: Query["game"];
      defaultSelection: typeof DefaultGameSelection;
      plan: <Options extends CreateGameOptions>(options?: LimitToKnownKeys<Options, CreateGameOptions>) => GQLBuilderResult;
      processResult: ProcessResultFunction;
    }
  update: {
      /**
       * Executes the update actionon one record specified by `id`.Runs the action and returns a Promise for the updated record.
      *
      * This is the flat style, all-params-together overload that most use cases should use.
      *
      * @example
      * * const gameRecord = await api.game.update("1", {
        *   messageId: "example value for messageId",
        *   objectName: "example value for objectName",
        *   userId: "example value for userId",
        * });
      **/
      <Options extends UpdateGameOptions>(
        id: string,
        variables: UpdateGameVariables,
        options?: LimitToKnownKeys<Options, UpdateGameOptions>
      ): Promise<UpdateGameResult<Options>>;
      /**
       * Executes the update actionon one record specified by `id`.Runs the action and returns a Promise for the updated record.
      *
      * This is the fully qualified, nested api identifier style overload that should be used when there's an ambiguity between an action param and a model field.
      *
      * @example
      * * const gameRecord = await api.game.update("1", {
        *   game: {
        *     messageId: "example value for messageId",
        *     objectName: "example value for objectName",
        *     userId: "example value for userId",
        *   },
        * });
      **/
      <Options extends UpdateGameOptions>(
        id: string,
        variables: FullyQualifiedUpdateGameVariables,
        options?: LimitToKnownKeys<Options, UpdateGameOptions>
      ): Promise<UpdateGameResult<Options>>;
      type: 'action';
      operationName: 'updateGame';
      operationReturnType: 'UpdateGame';
      namespace: null;
      modelApiIdentifier: typeof modelApiIdentifier;
      operatesWithRecordIdentity: true;
      modelSelectionField: typeof modelApiIdentifier;
      isBulk: false;
      isDeleter: false;
      variables: {
          id: { required: true, type: 'GadgetID' },
          game: { required: false, type: 'UpdateGameInput' }
        };
      variablesType: (
              { id: string }
              & (FullyQualifiedUpdateGameVariables | UpdateGameVariables)
            );
      hasAmbiguousIdentifier: false;
      paramOnlyVariables: [];
      hasReturnType: false;
      acceptsModelInput: true;
      hasCreateOrUpdateEffect: true;
      imports: [ 'UpdateGameInput' ];
      optionsType: UpdateGameOptions;
      selectionType: AvailableGameSelection;
      schemaType: Query["game"];
      defaultSelection: typeof DefaultGameSelection;
      plan: <Options extends UpdateGameOptions>(options?: LimitToKnownKeys<Options, UpdateGameOptions>) => GQLBuilderResult;
      processResult: ProcessResultFunction;
    }
  bulkUpdate: {
      /**
        * Executes the bulkUpdate action with the given inputs.
        */
       <Options extends UpdateGameOptions>(
          inputs: (FullyQualifiedUpdateGameVariables | UpdateGameVariables & { id: string })[],
          options?: LimitToKnownKeys<Options, UpdateGameOptions>
       ): Promise<UpdateGameResult<Options>[]>
      type: 'action';
      operationName: 'bulkUpdateGames';
      isBulk: true;
      isDeleter: false;
      hasReturnType: false;
      acceptsModelInput: true;
      operatesWithRecordIdentity: true;
      singleActionFunctionName: 'update';
      modelApiIdentifier: typeof modelApiIdentifier;
      modelSelectionField: typeof pluralModelApiIdentifier;
      optionsType: UpdateGameOptions;
      namespace: null;
      variables: { inputs: { required: true, type: '[BulkUpdateGamesInput!]' } };
      variablesType: (FullyQualifiedUpdateGameVariables | UpdateGameVariables & { id: string })[];
      paramOnlyVariables: [];
      selectionType: AvailableGameSelection;
      schemaType: Query["game"];
      defaultSelection: typeof DefaultGameSelection;
      plan: <Options extends UpdateGameOptions>(options?: LimitToKnownKeys<Options, UpdateGameOptions>) => GQLBuilderResult;
      processResult: ProcessResultFunction;
    }
  delete: {
      /**
       * Executes the delete actionon one record specified by `id`.Deletes the record on the server. Returns a Promise that resolves if the delete succeeds.
      *
      * This is the fully qualified, nested api identifier style overload that should be used when there's an ambiguity between an action param and a model field.
      *
      * @example
      * * await api.game.delete("1");
      **/
      <Options extends DeleteGameOptions>(
        id: string,
      
        options?: LimitToKnownKeys<Options, DeleteGameOptions>
      ): Promise<DeleteGameResult<Options>>;
      type: 'action';
      operationName: 'deleteGame';
      operationReturnType: 'DeleteGame';
      namespace: null;
      modelApiIdentifier: typeof modelApiIdentifier;
      operatesWithRecordIdentity: true;
      modelSelectionField: typeof modelApiIdentifier;
      isBulk: false;
      isDeleter: true;
      variables: { id: { required: true, type: 'GadgetID' } };
      variablesType: (
              { id: string }
              
            );
      hasAmbiguousIdentifier: false;
      paramOnlyVariables: [];
      hasReturnType: false;
      acceptsModelInput: false;
      hasCreateOrUpdateEffect: false;
      imports: [];
      optionsType: DeleteGameOptions;
      selectionType: Record<string, never>;
      schemaType: null;
      defaultSelection: null;
      plan: <Options extends DeleteGameOptions>(options?: LimitToKnownKeys<Options, DeleteGameOptions>) => GQLBuilderResult;
      processResult: ProcessResultFunction;
    }
  bulkDelete: {
      /**
        * Executes the bulkDelete action with the given inputs.Deletes the records on the server.
        */
       <Options extends DeleteGameOptions>(
          ids: string[],
          options?: LimitToKnownKeys<Options, DeleteGameOptions>
       ): Promise<DeleteGameResult<Options>[]>
      type: 'action';
      operationName: 'bulkDeleteGames';
      isBulk: true;
      isDeleter: true;
      hasReturnType: false;
      acceptsModelInput: false;
      operatesWithRecordIdentity: true;
      singleActionFunctionName: 'delete';
      modelApiIdentifier: typeof modelApiIdentifier;
      modelSelectionField: typeof pluralModelApiIdentifier;
      optionsType: DeleteGameOptions;
      namespace: null;
      variables: { ids: { required: true, type: '[GadgetID!]' } };
      variablesType: IDsList | undefined;
      paramOnlyVariables: [];
      selectionType: Record<string, never>;
      schemaType: null;
      defaultSelection: null;
      plan: <Options extends DeleteGameOptions>(options?: LimitToKnownKeys<Options, DeleteGameOptions>) => GQLBuilderResult;
      processResult: ProcessResultFunction;
    }
  upsert: {
      /**
       * Executes the upsert action.Accepts the parameters for the action via the `variables` argument.Runs the action and returns a Promise for the updated record.
      *
      * This is the flat style, all-params-together overload that most use cases should use.
      *
      * @example
      * * const result = await api.game.upsert({
        *   id: "1",
        *   messageId: "example value for messageId",
        *   objectName: "example value for objectName",
        *   userId: "example value for userId",
        * });
      **/
      <Options extends UpsertGameOptions>(
      
        variables: UpsertGameVariables,
        options?: LimitToKnownKeys<Options, UpsertGameOptions>
      ): Promise<UpsertGameResult<Options>>;
      /**
       * Executes the upsert action.Accepts the parameters for the action via the `variables` argument.Runs the action and returns a Promise for the updated record.
      *
      * This is the fully qualified, nested api identifier style overload that should be used when there's an ambiguity between an action param and a model field.
      *
      * @example
      * * const result = await api.game.upsert({
        *   game: {
        *     id: "1",
        *     messageId: "example value for messageId",
        *     objectName: "example value for objectName",
        *     userId: "example value for userId",
        *   },
        * });
      **/
      <Options extends UpsertGameOptions>(
      
        variables: FullyQualifiedUpsertGameVariables,
        options?: LimitToKnownKeys<Options, UpsertGameOptions>
      ): Promise<UpsertGameResult<Options>>;
      type: 'action';
      operationName: 'upsertGame';
      operationReturnType: 'UpsertGame';
      namespace: null;
      modelApiIdentifier: typeof modelApiIdentifier;
      operatesWithRecordIdentity: false;
      modelSelectionField: typeof modelApiIdentifier;
      isBulk: false;
      isDeleter: false;
      variables: {
          on: { required: false, type: '[String!]' },
          game: { required: false, type: 'UpsertGameInput' }
        };
      variablesType: ((
               
               & (FullyQualifiedUpsertGameVariables | UpsertGameVariables)
             ) | undefined);
      hasAmbiguousIdentifier: false;
      paramOnlyVariables: [ 'on' ];
      hasReturnType: {
          '... on CreateGameResult': { hasReturnType: false },
          '... on UpdateGameResult': { hasReturnType: false }
        };
      acceptsModelInput: true;
      hasCreateOrUpdateEffect: true;
      imports: [ 'Scalars', 'UpsertGameInput' ];
      optionsType: UpsertGameOptions;
      selectionType: AvailableGameSelection;
      schemaType: Query["game"];
      defaultSelection: typeof DefaultGameSelection;
      plan: <Options extends UpsertGameOptions>(options?: LimitToKnownKeys<Options, UpsertGameOptions>) => GQLBuilderResult;
      processResult: ProcessResultFunction;
    }
  bulkUpsert: {
      /**
        * Executes the bulkUpsert action with the given inputs.
        */
       <Options extends UpsertGameOptions>(
          inputs: (FullyQualifiedUpsertGameVariables | UpsertGameVariables)[],
          options?: LimitToKnownKeys<Options, UpsertGameOptions>
       ): Promise<any[]>
      type: 'action';
      operationName: 'bulkUpsertGames';
      isBulk: true;
      isDeleter: false;
      hasReturnType: false;
      acceptsModelInput: true;
      operatesWithRecordIdentity: false;
      singleActionFunctionName: 'upsert';
      modelApiIdentifier: typeof modelApiIdentifier;
      modelSelectionField: typeof pluralModelApiIdentifier;
      optionsType: UpsertGameOptions;
      namespace: null;
      variables: { inputs: { required: true, type: '[BulkUpsertGamesInput!]' } };
      variablesType: (FullyQualifiedUpsertGameVariables | UpsertGameVariables)[];
      paramOnlyVariables: [ 'on' ];
      selectionType: AvailableGameSelection;
      schemaType: Query["game"];
      defaultSelection: typeof DefaultGameSelection;
      plan: <Options extends UpsertGameOptions>(options?: LimitToKnownKeys<Options, UpsertGameOptions>) => GQLBuilderResult;
      processResult: ProcessResultFunction;
    }
  view: {
      (query: string, variables?: Record<string, unknown>): Promise<unknown>
      type: 'computedView';
      operationName: 'view';
      gqlFieldName: 'gameGellyView';
      namespace: null;
      imports: [];
      variables: {
          query: { type: 'String', required: true },
          args: { type: 'JSONObject' }
        };
      variablesType: Record<string, unknown>;
      resultType: Promise<unknown>;
      plan: never;
    }
  /**
   * Finds all game records matching the given options, paging through all pages of results to return a flat array of records.
   * Can be slow and memory-intensive for large datasets; consider using `iterateAll` instead for better performance with large result sets.
   * Supports `filter`, `sort`, `search`, and `select` options. `first` controls the page size (default 250). `after` allows starting from a specific cursor.
   **/
  findAll: <Options extends FindManyGamesOptions>(options?: LimitToKnownKeys<Options, FindManyGamesOptions>) => Promise<Array<GameRecord<Options["select"]>>>;
  /**
   * Iterates through all game records matching the given options, lazily fetching pages as needed.
   * Recommended for large datasets as records are yielded one at a time without accumulating all results in memory.
   * Supports `filter`, `sort`, `search`, and `select` options. `first` controls the page size (default 250). `after` allows starting from a specific cursor.
   * @example
   * for await (const record of api.game.iterateAll()) {
   *   // process record
   * }
   **/
  iterateAll: <Options extends FindManyGamesOptions>(options?: LimitToKnownKeys<Options, FindManyGamesOptions>) => AsyncIterable<GameRecord<Options["select"]>>;
};

const operations: ModelManagerOperation[] = [
                                              {
                                                type: 'findOne',
                                                operationName: modelApiIdentifier,
                                                modelApiIdentifier: modelApiIdentifier,
                                                findByVariableName: 'id',
                                                defaultSelection: DefaultGameSelection,
                                                namespace: null
                                              },
                                              {
                                                type: 'maybeFindOne',
                                                operationName: modelApiIdentifier,
                                                modelApiIdentifier: modelApiIdentifier,
                                                findByVariableName: 'id',
                                                defaultSelection: DefaultGameSelection,
                                                namespace: null
                                              },
                                              {
                                                type: 'findMany',
                                                operationName: pluralModelApiIdentifier,
                                                modelApiIdentifier: modelApiIdentifier,
                                                defaultSelection: DefaultGameSelection,
                                                namespace: null
                                              },
                                              {
                                                type: 'findFirst',
                                                operationName: pluralModelApiIdentifier,
                                                modelApiIdentifier: modelApiIdentifier,
                                                defaultSelection: DefaultGameSelection,
                                                namespace: null
                                              },
                                              {
                                                type: 'maybeFindFirst',
                                                operationName: pluralModelApiIdentifier,
                                                modelApiIdentifier: modelApiIdentifier,
                                                defaultSelection: DefaultGameSelection,
                                                namespace: null
                                              },
                                              {
                                                type: 'findOne',
                                                operationName: pluralModelApiIdentifier,
                                                functionName: 'findById',
                                                findByField: 'id',
                                                findByVariableName: 'id',
                                                modelApiIdentifier: modelApiIdentifier,
                                                defaultSelection: DefaultGameSelection,
                                                namespace: null
                                              },
                                              {
                                                type: 'maybeFindOne',
                                                operationName: pluralModelApiIdentifier,
                                                functionName: 'maybeFindById',
                                                findByField: 'id',
                                                findByVariableName: 'id',
                                                modelApiIdentifier: modelApiIdentifier,
                                                defaultSelection: DefaultGameSelection,
                                                namespace: null
                                              },
                                              {
                                                type: 'action',
                                                operationName: 'createGame',
                                                operationReturnType: 'CreateGame',
                                                functionName: 'create',
                                                namespace: null,
                                                modelApiIdentifier: modelApiIdentifier,
                                                operatesWithRecordIdentity: false,
                                                modelSelectionField: modelApiIdentifier,
                                                isBulk: false,
                                                isDeleter: false,
                                                variables: { game: { required: false, type: 'CreateGameInput' } },
                                                hasAmbiguousIdentifier: false,
                                                paramOnlyVariables: [],
                                                hasReturnType: false,
                                                acceptsModelInput: true,
                                                hasCreateOrUpdateEffect: true,
                                                defaultSelection: DefaultGameSelection
                                              },
                                              {
                                                type: 'action',
                                                operationName: 'bulkCreateGames',
                                                functionName: 'bulkCreate',
                                                isBulk: true,
                                                isDeleter: false,
                                                hasReturnType: false,
                                                acceptsModelInput: true,
                                                operatesWithRecordIdentity: false,
                                                singleActionFunctionName: 'create',
                                                modelApiIdentifier: modelApiIdentifier,
                                                modelSelectionField: pluralModelApiIdentifier,
                                                namespace: null,
                                                variables: { inputs: { required: true, type: '[BulkCreateGamesInput!]' } },
                                                paramOnlyVariables: [],
                                                defaultSelection: DefaultGameSelection
                                              },
                                              {
                                                type: 'action',
                                                operationName: 'updateGame',
                                                operationReturnType: 'UpdateGame',
                                                functionName: 'update',
                                                namespace: null,
                                                modelApiIdentifier: modelApiIdentifier,
                                                operatesWithRecordIdentity: true,
                                                modelSelectionField: modelApiIdentifier,
                                                isBulk: false,
                                                isDeleter: false,
                                                variables: {
                                                  id: { required: true, type: 'GadgetID' },
                                                  game: { required: false, type: 'UpdateGameInput' }
                                                },
                                                hasAmbiguousIdentifier: false,
                                                paramOnlyVariables: [],
                                                hasReturnType: false,
                                                acceptsModelInput: true,
                                                hasCreateOrUpdateEffect: true,
                                                defaultSelection: DefaultGameSelection
                                              },
                                              {
                                                type: 'action',
                                                operationName: 'bulkUpdateGames',
                                                functionName: 'bulkUpdate',
                                                isBulk: true,
                                                isDeleter: false,
                                                hasReturnType: false,
                                                acceptsModelInput: true,
                                                operatesWithRecordIdentity: true,
                                                singleActionFunctionName: 'update',
                                                modelApiIdentifier: modelApiIdentifier,
                                                modelSelectionField: pluralModelApiIdentifier,
                                                namespace: null,
                                                variables: { inputs: { required: true, type: '[BulkUpdateGamesInput!]' } },
                                                paramOnlyVariables: [],
                                                defaultSelection: DefaultGameSelection
                                              },
                                              {
                                                type: 'action',
                                                operationName: 'deleteGame',
                                                operationReturnType: 'DeleteGame',
                                                functionName: 'delete',
                                                namespace: null,
                                                modelApiIdentifier: modelApiIdentifier,
                                                operatesWithRecordIdentity: true,
                                                modelSelectionField: modelApiIdentifier,
                                                isBulk: false,
                                                isDeleter: true,
                                                variables: { id: { required: true, type: 'GadgetID' } },
                                                hasAmbiguousIdentifier: false,
                                                paramOnlyVariables: [],
                                                hasReturnType: false,
                                                acceptsModelInput: false,
                                                hasCreateOrUpdateEffect: false,
                                                defaultSelection: null
                                              },
                                              {
                                                type: 'action',
                                                operationName: 'bulkDeleteGames',
                                                functionName: 'bulkDelete',
                                                isBulk: true,
                                                isDeleter: true,
                                                hasReturnType: false,
                                                acceptsModelInput: false,
                                                operatesWithRecordIdentity: true,
                                                singleActionFunctionName: 'delete',
                                                modelApiIdentifier: modelApiIdentifier,
                                                modelSelectionField: pluralModelApiIdentifier,
                                                namespace: null,
                                                variables: { ids: { required: true, type: '[GadgetID!]' } },
                                                paramOnlyVariables: [],
                                                defaultSelection: null
                                              },
                                              {
                                                type: 'action',
                                                operationName: 'upsertGame',
                                                operationReturnType: 'UpsertGame',
                                                functionName: 'upsert',
                                                namespace: null,
                                                modelApiIdentifier: modelApiIdentifier,
                                                operatesWithRecordIdentity: false,
                                                modelSelectionField: modelApiIdentifier,
                                                isBulk: false,
                                                isDeleter: false,
                                                variables: {
                                                  on: { required: false, type: '[String!]' },
                                                  game: { required: false, type: 'UpsertGameInput' }
                                                },
                                                hasAmbiguousIdentifier: false,
                                                paramOnlyVariables: [ 'on' ],
                                                hasReturnType: {
                                                  '... on CreateGameResult': { hasReturnType: false },
                                                  '... on UpdateGameResult': { hasReturnType: false }
                                                },
                                                acceptsModelInput: true,
                                                hasCreateOrUpdateEffect: true,
                                                defaultSelection: DefaultGameSelection
                                              },
                                              {
                                                type: 'action',
                                                operationName: 'bulkUpsertGames',
                                                functionName: 'bulkUpsert',
                                                isBulk: true,
                                                isDeleter: false,
                                                hasReturnType: false,
                                                acceptsModelInput: true,
                                                operatesWithRecordIdentity: false,
                                                singleActionFunctionName: 'upsert',
                                                modelApiIdentifier: modelApiIdentifier,
                                                modelSelectionField: pluralModelApiIdentifier,
                                                namespace: null,
                                                variables: { inputs: { required: true, type: '[BulkUpsertGamesInput!]' } },
                                                paramOnlyVariables: [ 'on' ],
                                                defaultSelection: DefaultGameSelection
                                              },
                                              {
                                                type: 'computedView',
                                                operationName: 'view',
                                                functionName: 'view',
                                                gqlFieldName: 'gameGellyView',
                                                namespace: null,
                                                variables: {
                                                  query: { type: 'String', required: true },
                                                  args: { type: 'JSONObject' }
                                                }
                                              }
                                            ] as const;


/**
 * A manager for the game model with all the available operations for reading and writing to it.*/
export const GameManager = buildModelManager(
  modelApiIdentifier,
  pluralModelApiIdentifier,
  DefaultGameSelection,
  operations
) as unknown as {
  // Gadget generates these model manager classes at runtime dynamically, which means there is no source code for the class. This is done to make the bundle size of the client as small as possible, avoiding a bunch of repeated source code in favour of one small builder function. The TypeScript types above document the exact interface of the constructed class.
  new(connection: GadgetConnection): GameManager;
};