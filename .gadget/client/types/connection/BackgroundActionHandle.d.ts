import type { ActionFunctionMetadata, ActionFunctionOptions, AnyBackgroundActionHandle, AnyConnection, BackgroundActionResult, BackgroundActionResultData, GlobalActionFunction } from "@gadgetinc/core";
/** The possible statuses of a background action */ export type BackgroundActionStatus = "scheduled" | "waiting" | "retrying" | "running" | "completed" | "failed" | "cancelled";
export declare const backgroundActionResultRunner: <SchemaT, Action extends ActionFunctionMetadata<any, any, any, SchemaT, any, any> | GlobalActionFunction<any>, Options extends ActionFunctionOptions<Action>, ResultData = BackgroundActionResultData<Action, Options>>(connection: AnyConnection, id: string, action: Action, options?: Options) => Promise<BackgroundActionResult<ResultData>>;
export declare const cancelBackgroundActionRunner: (connection: AnyConnection, id: string) => Promise<void>;
export declare const getBackgroundActionStatusRunner: (connection: AnyConnection, id: string) => Promise<BackgroundActionStatus>;
/** @deprecated previous export name, @see backgroundActionResultRunner */ export declare const actionResultRunner: typeof backgroundActionResultRunner;
/**
 * Represents a handle to a background action which has been enqueued
 **/ export declare class BackgroundActionHandle<SchemaT, Action extends ActionFunctionMetadata<any, any, any, SchemaT, any, any> | GlobalActionFunction<any>> implements AnyBackgroundActionHandle<SchemaT, Action> {
    readonly connection: AnyConnection;
    readonly action: Action;
    readonly id: string;
    constructor(connection: AnyConnection, action: Action, id: string);
    /** Wait for this background action to complete and return the result. */ result<Options extends ActionFunctionOptions<Action>, ResultData = BackgroundActionResultData<Action, Options>>(options?: Options): Promise<ResultData | null>;
    /** Cancel this background action by id. */ cancel(): Promise<void>;
    /** Get the current status of this background action. */ status(): Promise<BackgroundActionStatus>;
}
