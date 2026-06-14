import type { Delta } from "@n1ru4l/json-patch-plus";
import type { Repeater } from "../repeater/index.js";
export type ApplyPatchFunction<PatchPayload = unknown> = (previous: Record<string, unknown>, patch: PatchPayload) => Record<string, unknown>;
export declare const applyJSONDiffPatch: ApplyPatchFunction<Delta>;
export declare const applyLiveQueryJSONDiffPatch: <TExecutionResult = Record<string, unknown>>(source: AsyncIterable<TExecutionResult>) => Repeater<TExecutionResult>;
export { applyAsyncIterableIteratorToSink, makeAsyncIterableIteratorFromSink } from "@n1ru4l/push-pull-async-iterable-iterator";
