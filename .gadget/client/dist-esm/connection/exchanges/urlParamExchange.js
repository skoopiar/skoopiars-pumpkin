import { mapExchange } from "@urql/core";
const addUrlParams = (url, paramsToAdd) => {
  const [start, params] = url.split("?");
  const paramsObj = new URLSearchParams(params);
  for (const [key, value] of Object.entries(paramsToAdd)) {
    paramsObj.set(key, value);
  }
  return `${start}?${paramsObj.toString()}`;
};
const urlParamExchange = mapExchange({
  onOperation: (operation) => {
    if (operation.context.url && operation.context.operationName) {
      try {
        operation.context.url = addUrlParams(operation.context.url, { kind: operation.kind, operation: operation.context.operationName });
      } catch (error) {
      }
    }
  }
});
export {
  addUrlParams,
  urlParamExchange
};
//# sourceMappingURL=urlParamExchange.js.map
