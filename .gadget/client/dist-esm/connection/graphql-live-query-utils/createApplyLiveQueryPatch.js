import { Repeater } from "../repeater/index.js";
const createApplyLiveQueryPatch = (applyPatch) => (source) => new Repeater(async (push, stop) => {
  const iterator = source[Symbol.asyncIterator]();
  stop.then(() => iterator.return?.()).catch(console.log);
  let mutableData = null;
  let lastRevision = 0;
  let next;
  while ((next = await iterator.next()).done === false) {
    if ("revision" in next.value && next.value.revision) {
      const valueToPublish = {};
      if (next.value.revision === 1) {
        if (next.value.data !== void 0) {
          valueToPublish.data = next.value.data;
          mutableData = next.value.data;
          lastRevision = 1;
        } else {
          throw new Error("Missing data.");
        }
      } else {
        if (!mutableData) {
          throw new Error("No previousData available.");
        }
        if (!next.value.patch) {
          throw new Error("Missing patch.");
        }
        if (lastRevision + 1 !== next.value.revision) {
          throw new Error("Wrong revision received.");
        }
        mutableData = applyPatch(mutableData, next.value.patch);
        valueToPublish.data = { ...mutableData };
        lastRevision++;
      }
      if (next.value.extensions) {
        valueToPublish.extensions = next.value.extensions;
      }
      if (next.value.errors) {
        valueToPublish.errors = next.value.errors;
      }
      await push(valueToPublish);
      continue;
    }
    await push(next.value);
  }
  stop();
});
export {
  createApplyLiveQueryPatch
};
//# sourceMappingURL=createApplyLiveQueryPatch.js.map
