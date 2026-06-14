import { patch } from "@n1ru4l/json-patch-plus";
import { createApplyLiveQueryPatch } from "./createApplyLiveQueryPatch.js";
const applyJSONDiffPatch = (left, delta) => patch({
  left,
  delta
});
const applyLiveQueryJSONDiffPatch = createApplyLiveQueryPatch(applyJSONDiffPatch);
import { applyAsyncIterableIteratorToSink, makeAsyncIterableIteratorFromSink } from "@n1ru4l/push-pull-async-iterable-iterator";
export {
  applyAsyncIterableIteratorToSink,
  applyJSONDiffPatch,
  applyLiveQueryJSONDiffPatch,
  makeAsyncIterableIteratorFromSink
};
//# sourceMappingURL=index.js.map
