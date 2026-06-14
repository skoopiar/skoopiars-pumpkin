import type { GadgetConnection } from "./connection/GadgetConnection.js";
import type { ActionFunction, ActionFunctionMetadata, AnyActionFunction, AnyModelFinderMetadata, AnyModelManager, BaseFindOptions, BulkActionFunction, FieldSelection, FindFirstFunction, FindManyFunction, FindManyOptions, FindOneFunction, GetFunction, GlobalActionFunction, ProcessResultFunction, VariablesOptions, ViewFunction, ViewFunctionWithoutVariables, ViewFunctionWithVariables } from "@gadgetinc/core";
/**
 * The metadata that we need for building the runtime version of a finderoperation
 * Excludes the type-time only keys
 */ export type AnyModelFinderRuntimeMetadata = Omit<AnyModelFinderMetadata, "schemaType" | "optionsType" | "variablesType" | "selectionType">;
/**
 * The metadata that we need for building the runtime version of a finder operation
 * Excludes the type-time only keys
 */ export type AnyActionFunctionRuntimeMetadata = Omit<ActionFunctionMetadata<any, any, any, any, any, any>, "schemaType" | "optionsType" | "variablesType" | "selectionType" | "plan" | "processResult">;
export type FindOneOperation = {
    type: "findOne";
    findByVariableName: "id";
} & AnyModelFinderRuntimeMetadata;
export type MaybeFindOneOperation = {
    type: "maybeFindOne";
    findByVariableName: "id";
} & AnyModelFinderRuntimeMetadata;
export type FindManyOperation = {
    type: "findMany";
} & AnyModelFinderRuntimeMetadata;
export type FindFirstOperation = {
    type: "findFirst";
} & AnyModelFinderRuntimeMetadata;
export type MaybeFindFirstOperation = {
    type: "maybeFindFirst";
} & AnyModelFinderRuntimeMetadata;
export type FindOneByFieldOperation = {
    type: "findOne";
    findByVariableName: string;
    findByField: string;
    functionName: string;
} & AnyModelFinderRuntimeMetadata;
export type MaybeFindOneByFieldOperation = {
    type: "maybeFindOne";
    findByVariableName: string;
    findByField: string;
    functionName: string;
} & AnyModelFinderRuntimeMetadata;
export type SingletonGetOperation = {
    type: "get";
} & AnyModelFinderRuntimeMetadata;
export type ActionOperation = {
    type: "action";
    functionName: string;
    isBulk: false;
    isDeleter: boolean;
} & AnyActionFunctionRuntimeMetadata;
export type BulkActionOperation = {
    type: "action";
    functionName: string;
    isBulk: true;
    singleActionFunctionName: string;
    isDeleter: boolean;
} & AnyActionFunctionRuntimeMetadata;
export type GlobalActionOperation = {
    type: "globalAction";
    functionName: string;
    operationName: string;
    operationReturnType?: string;
    namespace: string | string[] | null;
    variables: VariablesOptions;
};
type ComputedViewOperationRuntimeMetadata<VariablesT, ResultT> = Omit<ViewFunction<VariablesT, ResultT>, "plan" | "processResult" | "resultType" | "variablesType">;
export type ComputedViewOperation<VariablesT = any, ResultT = any> = ComputedViewOperationRuntimeMetadata<VariablesT, ResultT> & {
    type: "computedView";
    operationName: string;
    functionName: string;
    gqlFieldName: string;
    namespace: string | string[] | null;
    /**
   * The list of GraphQL typenames that contribute to this view's expression
   * The view should be invalidated and refreshed client side when changes are made to these typenames
   */ referencedTypenames?: string[];
    /**
   * List of model keys that contribute to this view's expression
   */ referencedModelKeys?: string[];
    variables?: VariablesOptions;
};
export type StubbedComputedViewOperation = {
    type: "stubbedComputedView";
    operationName: string;
    functionName: string;
    gqlFieldName: string;
    namespace: string | string[] | null;
    errorMessage: string;
};
export type StubbedActionReason = "MissingApiTrigger";
export type StubbedActionOperation = {
    type: "stubbedAction";
    functionName: string;
    operationName?: string;
    errorMessage: string;
    actionApiIdentifier: string;
    modelApiIdentifier?: string;
    variables: VariablesOptions;
    reason: StubbedActionReason;
    dataPath: string;
};
export type ModelManagerOperation = FindOneOperation | MaybeFindOneOperation | FindManyOperation | FindFirstOperation | MaybeFindFirstOperation | FindOneByFieldOperation | MaybeFindOneByFieldOperation | SingletonGetOperation | ActionOperation | BulkActionOperation | StubbedActionOperation | ComputedViewOperation | StubbedComputedViewOperation;
/**
 * Construct a model manager class out of the metadatas generated on the server
 **/ export declare const buildModelManager: (apiIdentifier: string, pluralApiIdentifier: string, defaultSelection: FieldSelection, operationGroup: ModelManagerOperation[] | readonly ModelManagerOperation[]) => AnyModelManager;
export declare const buildGlobalAction: (client: {
    connection: GadgetConnection;
}, operation: GlobalActionOperation | StubbedActionOperation) => AnyActionFunction;
export declare function buildStubbedComputedView(operation: StubbedComputedViewOperation): () => Promise<never>;
export declare function buildComputedView<VariablesT, ResultT, Op extends ComputedViewOperation<VariablesT, ResultT>>(client: {
    connection: GadgetConnection;
}, operation: Op): Op extends {
    variables: VariablesOptions;
} ? ViewFunctionWithVariables<VariablesT, ResultT> : ViewFunctionWithoutVariables<ResultT>;
export declare function buildModelComputedView<ResultT>(operation: ComputedViewOperation<any, ResultT>): ViewFunctionWithoutVariables<ResultT>;
export declare function buildModelComputedView<VariablesT, ResultT>(operation: ComputedViewOperation<VariablesT, ResultT>): ViewFunctionWithVariables<VariablesT, ResultT>;
export declare function buildInlineComputedView(client: {
    connection: GadgetConnection;
}, operation: ComputedViewOperation): any;
export declare function buildInlineModelComputedView(operation: ComputedViewOperation): any;
export declare function isInlineComputedView(operation: ComputedViewOperation): boolean;
export { };
