import type { ExecutionResult } from "graphql";
import { Repeater } from "../repeater/index.js";
export type ExecutionLivePatchResult<PatchPayload = unknown> = {
    errors?: ExecutionResult["errors"];
    /* data must be included in the first result */ data?: ExecutionResult["data"];
    /* patch must be present in the next results */ patch?: PatchPayload;
    revision?: number;
    extensions?: ExecutionResult["extensions"];
};
export type ApplyPatchFunction<PatchPayload = unknown> = (previous: Record<string, unknown>, patch: PatchPayload) => Record<string, unknown>;
/**
 * Create a middleware generator function for applying live query patches on the client.
 */ export declare const createApplyLiveQueryPatch: <PatchPayload = unknown>(/* Function which is used for generating the patches */ applyPatch: ApplyPatchFunction<PatchPayload>) => (<TExecutionResult = Record<string, unknown>>(source: AsyncIterable<TExecutionResult>) => Repeater<TExecutionResult>);
