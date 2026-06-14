import type { AnyActionFunction, AnyBulkActionFunction, AnyConnection, AnyModelManager, BaseFindOptions, EnqueueBackgroundActionOptions, FieldSelection, FindManyOptions, HasReturnType, RecordShape, VariablesOptions } from "@gadgetinc/core";
import { BackgroundActionHandle } from "./BackgroundActionHandle.js";
import type { GadgetRecord } from "./GadgetRecord.js";
import { GadgetRecordList } from "./GadgetRecordList.js";
type LiveResultForOptions<T, LiveOptions extends {
    live?: boolean | null;
}> = LiveOptions extends {
    live: true;
} ? AsyncIterable<T> : Promise<T>;
export declare const findOneRunner: <Shape extends RecordShape = any, Options extends BaseFindOptions = Record<string, never>>(modelManager: {
    connection: AnyConnection;
}, operation: string, id: string | undefined, defaultSelection: FieldSelection, modelApiIdentifier: string, options?: Options | null, throwOnEmptyData?: boolean, namespace?: string | string[] | null) => LiveResultForOptions<GadgetRecord<Shape>, Options>;
export declare const findOneByFieldRunner: <Shape extends RecordShape = any, Options extends FindManyOptions = Record<string, never>>(modelManager: {
    connection: AnyConnection;
}, operation: string, fieldName: string, fieldValue: string, defaultSelection: FieldSelection, modelApiIdentifier: string, options?: Options | null, throwOnEmptyData?: boolean, namespace?: string | string[] | null) => LiveResultForOptions<GadgetRecord<Shape> | null, Options>;
export declare const findManyRunner: <Shape extends RecordShape = any, Options extends FindManyOptions = Record<string, never>>(modelManager: AnyModelManager, operation: string, defaultSelection: FieldSelection, modelApiIdentifier: string, options?: Options, throwOnEmptyData?: boolean, namespace?: string | string[] | null) => LiveResultForOptions<GadgetRecordList<Shape>, Options>;
export declare const findAllRunner: <Shape extends RecordShape = any>(modelManager: AnyModelManager, operation: string, defaultSelection: FieldSelection, modelApiIdentifier: string, options?: FindManyOptions, namespace?: string | string[] | null) => Promise<GadgetRecord<Shape>[]>;
export declare const iterateAllRunner: <Shape extends RecordShape = any>(modelManager: AnyModelManager, operation: string, defaultSelection: FieldSelection, modelApiIdentifier: string, options?: FindManyOptions, namespace?: string | string[] | null) => AsyncIterable<GadgetRecord<Shape>>;
export interface ActionRunner {
    (modelManager: {
        connection: AnyConnection;
    }, operation: string, defaultSelection: FieldSelection | null, modelApiIdentifier: string, modelSelectionField: string, isBulkAction: false, variables: VariablesOptions, options?: BaseFindOptions | null, namespace?: string | string[] | null, hasReturnType?: HasReturnType) : Promise<any>;
    <Shape extends RecordShape = any>(modelManager: {
        connection: AnyConnection;
    }, operation: string, defaultSelection: FieldSelection | null, modelApiIdentifier: string, modelSelectionField: string, isBulkAction: false, variables: VariablesOptions, options?: BaseFindOptions | null, namespace?: string | string[] | null, hasReturnType?: false | null) : Promise<Shape extends void ? void : GadgetRecord<Shape>>;
    <Shape extends RecordShape = any>(modelManager: {
        connection: AnyConnection;
    }, operation: string, defaultSelection: FieldSelection | null, modelApiIdentifier: string, modelSelectionField: string, isBulkAction: false, variables: VariablesOptions, options?: BaseFindOptions | null, namespace?: string | string[] | null) : Promise<Shape extends void ? void : GadgetRecord<Shape>>;
    <Shape extends RecordShape = any>(modelManager: {
        connection: AnyConnection;
    }, operation: string, defaultSelection: FieldSelection | null, modelApiIdentifier: string, modelSelectionField: string, isBulkAction: true, variables: VariablesOptions, options?: BaseFindOptions | null, namespace?: string | string[] | null) : Promise<Shape extends void ? void : GadgetRecord<Shape>[]>;
    (modelManager: {
        connection: AnyConnection;
    }, operation: string, defaultSelection: FieldSelection | null, modelApiIdentifier: string, modelSelectionField: string, isBulkAction: true, variables: VariablesOptions, options?: BaseFindOptions | null, namespace?: string | string[] | null, hasReturnType?: HasReturnType) : Promise<any[]>;
    <Shape extends RecordShape = any>(modelManager: {
        connection: AnyConnection;
    }, operation: string, defaultSelection: FieldSelection | null, modelApiIdentifier: string, modelSelectionField: string, isBulkAction: true, variables: VariablesOptions, options?: BaseFindOptions | null, namespace?: string | string[] | null, hasReturnType?: false | null) : Promise<Shape extends void ? void : GadgetRecord<Shape>[]>;
}
export declare const actionRunner: ActionRunner;
export declare const globalActionRunner: (connection: AnyConnection, operation: string, variables: VariablesOptions, namespace?: string | string[] | null) => Promise<any>;
export declare function enqueueActionRunner<SchemaT, Action extends AnyBulkActionFunction, Result = BackgroundActionHandle<SchemaT, Action>>(connection: AnyConnection, action: Action, variables: Action["variablesType"], options?: EnqueueBackgroundActionOptions<Action>): Promise<Result[]>;
export declare function enqueueActionRunner<SchemaT, Action extends AnyActionFunction, Result = BackgroundActionHandle<SchemaT, Action>>(connection: AnyConnection, action: Action, variables: Action["variablesType"], options?: EnqueueBackgroundActionOptions<Action>): Promise<Result>;
export declare const inlineComputedViewRunner: (connection: AnyConnection, gqlFieldName: string, viewQuery: string, variables?: Record<string, any>, namespace?: string | string[] | null) => Promise<unknown>;
export declare const computedViewRunner: (connection: AnyConnection, gqlFieldName: string, variablesOptions?: VariablesOptions, namespace?: string | string[] | null) => Promise<any>;
export { };
