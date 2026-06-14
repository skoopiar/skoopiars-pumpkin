"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var InternalModelManager_exports = {};
__export(InternalModelManager_exports, {
  InternalModelManager: () => InternalModelManager,
  internalBulkCreateMutation: () => internalBulkCreateMutation,
  internalCreateMutation: () => internalCreateMutation,
  internalDeleteManyMutation: () => internalDeleteManyMutation,
  internalDeleteMutation: () => internalDeleteMutation,
  internalFindFirstQuery: () => internalFindFirstQuery,
  internalFindManyQuery: () => internalFindManyQuery,
  internalFindOneQuery: () => internalFindOneQuery,
  internalUpdateMutation: () => internalUpdateMutation,
  internalUpsertMutation: () => internalUpsertMutation
});
module.exports = __toCommonJS(InternalModelManager_exports);
var import_tiny_graphql_query_compiler = require("tiny-graphql-query-compiler");
var import_GadgetRecordList = require("./GadgetRecordList.js");
var import_support = require("./support.js");
var import_utils = require("./utils.js");
const internalFindOneQuery = (apiIdentifier, id, namespace, select) => {
  const capitalizedApiIdentifier = (0, import_support.capitalizeIdentifier)(apiIdentifier);
  return (0, import_tiny_graphql_query_compiler.compileWithVariableValues)({
    type: "query",
    name: `InternalFind${capitalizedApiIdentifier}`,
    fields: {
      internal: (0, import_support.namespacify)(namespace, {
        [apiIdentifier]: (0, import_tiny_graphql_query_compiler.Call)({
          id: (0, import_tiny_graphql_query_compiler.Var)({ value: id, type: "GadgetID!" }),
          select: (0, import_tiny_graphql_query_compiler.Var)({ value: formatInternalSelectVariable(select), type: `[String!]` })
        })
      }),
      ...(0, import_utils.hydrationSelection)(apiIdentifier, namespace)
    }
  });
};
const internalFindListVariables = (apiIdentifier, namespace, options) => {
  return {
    search: (options == null ? void 0 : options.search) ? (0, import_tiny_graphql_query_compiler.Var)({ value: options == null ? void 0 : options.search, type: "String" }) : void 0,
    sort: (options == null ? void 0 : options.sort) ? (0, import_tiny_graphql_query_compiler.Var)({ value: options == null ? void 0 : options.sort, type: `[${(0, import_support.sortTypeName)(apiIdentifier, namespace)}!]` }) : void 0,
    filter: (options == null ? void 0 : options.filter) ? (0, import_tiny_graphql_query_compiler.Var)({ value: options == null ? void 0 : options.filter, type: `[${(0, import_support.filterTypeName)(apiIdentifier, namespace)}!]` }) : void 0,
    select: (options == null ? void 0 : options.select) ? (0, import_tiny_graphql_query_compiler.Var)({ value: formatInternalSelectVariable(options == null ? void 0 : options.select), type: `[String!]` }) : void 0,
    searchFields: (options == null ? void 0 : options.searchFields) ? (0, import_tiny_graphql_query_compiler.Var)({ value: (0, import_support.jsSearchFieldsToGqlSearchFields)(options.searchFields), type: `${(0, import_support.searchableFieldTypeName)(apiIdentifier, namespace)}` }) : void 0
  };
};
const internalFindFirstQuery = (apiIdentifier, namespace, options) => {
  const capitalizedApiIdentifier = (0, import_support.capitalizeIdentifier)(apiIdentifier);
  const defaultVariables = internalFindListVariables(capitalizedApiIdentifier, namespace, options);
  return (0, import_tiny_graphql_query_compiler.compileWithVariableValues)({
    type: "query",
    name: `InternalFindFirst${capitalizedApiIdentifier}`,
    fields: {
      internal: (0, import_support.namespacify)(namespace, {
        [`list${capitalizedApiIdentifier}`]: (0, import_tiny_graphql_query_compiler.Call)(
          {
            ...defaultVariables,
            first: (0, import_tiny_graphql_query_compiler.Var)({ value: 1, type: "Int" })
          },
          {
            edges: {
              node: true
            }
          }
        )
      }),
      ...(0, import_utils.hydrationSelection)(apiIdentifier, namespace)
    }
  });
};
const internalFindManyQuery = (apiIdentifier, namespace, options) => {
  const capitalizedApiIdentifier = (0, import_support.capitalizeIdentifier)(apiIdentifier);
  const defaultVariables = internalFindListVariables(capitalizedApiIdentifier, namespace, options);
  return (0, import_tiny_graphql_query_compiler.compileWithVariableValues)({
    type: "query",
    name: `InternalFindMany${capitalizedApiIdentifier}`,
    fields: {
      internal: (0, import_support.namespacify)(namespace, {
        [`list${capitalizedApiIdentifier}`]: (0, import_tiny_graphql_query_compiler.Call)(
          {
            ...defaultVariables,
            after: (options == null ? void 0 : options.after) ? (0, import_tiny_graphql_query_compiler.Var)({ value: options.after, type: "String" }) : void 0,
            before: (options == null ? void 0 : options.before) ? (0, import_tiny_graphql_query_compiler.Var)({ value: options == null ? void 0 : options.before, type: "String" }) : void 0,
            first: (options == null ? void 0 : options.first) ? (0, import_tiny_graphql_query_compiler.Var)({ value: options == null ? void 0 : options.first, type: "Int" }) : void 0,
            last: (options == null ? void 0 : options.last) ? (0, import_tiny_graphql_query_compiler.Var)({ value: options == null ? void 0 : options.last, type: "Int" }) : void 0
          },
          {
            pageInfo: { hasNextPage: true, hasPreviousPage: true, startCursor: true, endCursor: true },
            edges: { cursor: true, node: true }
          }
        )
      }),
      ...(0, import_utils.hydrationSelection)(apiIdentifier, namespace)
    }
  });
};
const internalInputTypeName = (apiIdentifier, namespace) => `Internal${(0, import_support.namespacedGraphQLTypeName)(apiIdentifier, namespace)}Input`;
const internalCreateMutation = (apiIdentifier, namespace, record) => {
  const capitalizedApiIdentifier = (0, import_support.capitalizeIdentifier)(apiIdentifier);
  return (0, import_tiny_graphql_query_compiler.compileWithVariableValues)({
    type: "mutation",
    name: `InternalCreate${capitalizedApiIdentifier}`,
    fields: {
      internal: (0, import_support.namespacify)(namespace, {
        [`create${capitalizedApiIdentifier}`]: (0, import_tiny_graphql_query_compiler.Call)(
          {
            [apiIdentifier]: (0, import_tiny_graphql_query_compiler.Var)({ value: record, type: internalInputTypeName(apiIdentifier, namespace) })
          },
          {
            success: true,
            ...import_support.ErrorsSelection,
            [apiIdentifier]: true
          }
        )
      }),
      ...(0, import_utils.hydrationSelection)(apiIdentifier, namespace)
    }
  });
};
const internalBulkCreateMutation = (apiIdentifier, pluralApiIdentifier, namespace, records) => {
  const capitalizedPluralApiIdentifier = (0, import_support.capitalizeIdentifier)(pluralApiIdentifier);
  return (0, import_tiny_graphql_query_compiler.compileWithVariableValues)({
    type: "mutation",
    name: `InternalBulkCreate${capitalizedPluralApiIdentifier}`,
    fields: {
      internal: (0, import_support.namespacify)(namespace, {
        [`bulkCreate${capitalizedPluralApiIdentifier}`]: (0, import_tiny_graphql_query_compiler.Call)(
          {
            [pluralApiIdentifier]: (0, import_tiny_graphql_query_compiler.Var)({ value: records, type: `[${internalInputTypeName(apiIdentifier, namespace)}]!` })
          },
          {
            success: true,
            ...import_support.ErrorsSelection,
            [pluralApiIdentifier]: true
          }
        )
      }),
      ...(0, import_utils.hydrationSelection)(apiIdentifier, namespace)
    }
  });
};
const internalUpdateMutation = (apiIdentifier, namespace, id, record) => {
  const capitalizedApiIdentifier = (0, import_support.capitalizeIdentifier)(apiIdentifier);
  return (0, import_tiny_graphql_query_compiler.compileWithVariableValues)({
    type: "mutation",
    name: `InternalUpdate${capitalizedApiIdentifier}`,
    fields: {
      internal: (0, import_support.namespacify)(namespace, {
        [`update${capitalizedApiIdentifier}`]: (0, import_tiny_graphql_query_compiler.Call)(
          {
            id: (0, import_tiny_graphql_query_compiler.Var)({ value: id, type: "GadgetID!" }),
            [apiIdentifier]: (0, import_tiny_graphql_query_compiler.Var)({ value: record, type: internalInputTypeName(apiIdentifier, namespace) })
          },
          {
            success: true,
            ...import_support.ErrorsSelection,
            [apiIdentifier]: true
          }
        )
      }),
      ...(0, import_utils.hydrationSelection)(apiIdentifier, namespace)
    }
  });
};
const internalUpsertMutation = (apiIdentifier, namespace, on, record) => {
  const capitalizedApiIdentifier = (0, import_support.capitalizeIdentifier)(apiIdentifier);
  return (0, import_tiny_graphql_query_compiler.compileWithVariableValues)({
    type: "mutation",
    name: `InternalUpsert${capitalizedApiIdentifier}`,
    fields: {
      internal: (0, import_support.namespacify)(namespace, {
        [`upsert${capitalizedApiIdentifier}`]: (0, import_tiny_graphql_query_compiler.Call)(
          {
            on: (0, import_tiny_graphql_query_compiler.Var)({ value: on, type: "[String!]" }),
            [apiIdentifier]: (0, import_tiny_graphql_query_compiler.Var)({ value: record, type: internalInputTypeName(apiIdentifier, namespace) })
          },
          {
            success: true,
            ...import_support.ErrorsSelection,
            [apiIdentifier]: true
          }
        )
      }),
      ...(0, import_utils.hydrationSelection)(apiIdentifier, namespace)
    }
  });
};
const internalDeleteMutation = (apiIdentifier, namespace, id) => {
  const capitalizedApiIdentifier = (0, import_support.capitalizeIdentifier)(apiIdentifier);
  return (0, import_tiny_graphql_query_compiler.compileWithVariableValues)({
    type: "mutation",
    name: `InternalDelete${capitalizedApiIdentifier}`,
    fields: {
      internal: (0, import_support.namespacify)(namespace, {
        [`delete${capitalizedApiIdentifier}`]: (0, import_tiny_graphql_query_compiler.Call)(
          {
            id: (0, import_tiny_graphql_query_compiler.Var)({ value: id, type: "GadgetID!" })
          },
          {
            success: true,
            ...import_support.ErrorsSelection
          }
        )
      })
    }
  });
};
const internalDeleteManyMutation = (apiIdentifier, namespace, options) => {
  const capitalizedApiIdentifier = (0, import_support.capitalizeIdentifier)(apiIdentifier);
  return (0, import_tiny_graphql_query_compiler.compileWithVariableValues)({
    type: "mutation",
    name: `InternalDeleteMany${capitalizedApiIdentifier}`,
    fields: {
      internal: (0, import_support.namespacify)(namespace, {
        [`deleteMany${capitalizedApiIdentifier}`]: (0, import_tiny_graphql_query_compiler.Call)(
          {
            search: (options == null ? void 0 : options.search) ? (0, import_tiny_graphql_query_compiler.Var)({ value: options == null ? void 0 : options.search, type: "String" }) : void 0,
            filter: (options == null ? void 0 : options.filter) ? (0, import_tiny_graphql_query_compiler.Var)({ value: options == null ? void 0 : options.filter, type: `[${(0, import_support.filterTypeName)(apiIdentifier, namespace)}!]` }) : void 0
          },
          {
            success: true,
            ...import_support.ErrorsSelection
          }
        )
      })
    }
  });
};
class InternalModelManager {
  constructor(apiIdentifier, connection, options) {
    this.apiIdentifier = apiIdentifier;
    this.connection = connection;
    this.options = options;
    this.capitalizedApiIdentifier = (0, import_support.camelize)(apiIdentifier);
    this.namespace = (options == null ? void 0 : options.namespace) || [];
  }
  validateRecord(record) {
    if (!this.options || !this.options.hasAmbiguousIdentifiers) {
      return true;
    }
    const keys = Object.keys(record);
    return keys.every((key) => key === this.apiIdentifier);
  }
  getRecordFromData(record, functionName) {
    let recordData = record;
    if (!this.validateRecord(record)) {
      throw new import_support.GadgetOperationError(
        `Invalid arguments found in variables. Did you mean to use ${functionName}({ ${this.apiIdentifier}: { ... } })?`,
        "GGT_INVALID_RECORD_DATA"
      );
    }
    if (this.apiIdentifier in record) {
      recordData = recordData[this.apiIdentifier];
    }
    return recordData;
  }
  /**
   * Find a single record by ID. Throws an error by default if the record with the given ID is not found.
   *
   * @example
   * // returns post with id 10
   * const post = await api.internal.post.findOne(10);
   *
   * @param id The ID of the record to find
   * @param options Options for the find operation
   * @param throwOnEmptyData Whether or not to throw an error if the record is not found
   * @returns The record, if found
   */
  async findOne(id, options, throwOnEmptyData = true) {
    const plan = internalFindOneQuery(this.apiIdentifier, id, this.namespace, formatInternalSelectVariable(options == null ? void 0 : options.select));
    const response = await this.connection.currentClient.query(plan.query, plan.variables).toPromise();
    const assertSuccess = throwOnEmptyData ? import_support.assertOperationSuccess : import_support.assertNullableOperationSuccess;
    const result = assertSuccess(response, this.dataPath(this.apiIdentifier));
    return (0, import_support.hydrateRecord)(response, result);
  }
  /**
   * Find a single record by ID. Returns null if the record doesn't exist.
   *
   * @example
   * // returns post with id 10 if it exists, null otherwise
   * const post = await api.internal.post.maybeFindOne(10);
   *
   * @param id The ID of the record to find
   * @param options Options for the find operation
   * @returns The record, if found, null otherwise
   */
  async maybeFindOne(id, options) {
    const record = await this.findOne(id, options, false);
    return record.isEmpty() ? null : record;
  }
  /**
   * Find a list of records matching the given options
   *
   * @example
   * // returns the first page of published posts
   * const posts = await api.internal.post.findMany({ filter: { published: { equals: true }}});
   *
   * @param options Options for the find operation, like sorts, filters, and pagination
   * @returns The record, if found, null otherwise
   */
  async findMany(options) {
    const plan = internalFindManyQuery(this.apiIdentifier, this.namespace, options);
    const response = await this.connection.currentClient.query(plan.query, plan.variables).toPromise();
    const connection = (0, import_support.assertNullableOperationSuccess)(response, this.dataPath(`list${this.capitalizedApiIdentifier}`));
    const records = (0, import_support.hydrateConnection)(response, connection);
    return import_GadgetRecordList.GadgetRecordList.boot(this, records, { options, pageInfo: connection.pageInfo });
  }
  /**
   * Find the first record matching the given options. Throws an error by default if no records matching the options are found.
   *
   * @example
   * // returns the first published post or throws if none found
   * const post = await api.internal.post.findFirst({ filter: { published: { equals: true }}});
   *
   * @param options Options for the find operation, like sorts, filters, and pagination
   * @returns The first record matching the options
   */
  async findFirst(options, throwOnEmptyData = true) {
    const plan = internalFindFirstQuery(this.apiIdentifier, this.namespace, options);
    const response = await this.connection.currentClient.query(plan.query, plan.variables).toPromise();
    const dataPath = this.dataPath(`list${this.capitalizedApiIdentifier}`);
    let connection;
    if (throwOnEmptyData === false) {
      connection = (0, import_support.assertNullableOperationSuccess)(response, dataPath);
    } else {
      connection = (0, import_support.assertOperationSuccess)(response, dataPath, throwOnEmptyData);
    }
    const records = (0, import_support.hydrateConnection)(response, connection);
    const recordList = import_GadgetRecordList.GadgetRecordList.boot(this, records, { options, pageInfo: connection.pageInfo });
    return recordList[0];
  }
  /**
   * Find the first record matching the given options. Returns null if no records matching the options are found.
   *
   * @example
   * // returns the first published post or null if none are published
   * const post = await api.internal.post.maybeFindFirst({ filter: { published: { equals: true }}});
   *
   * @param options Options for the find operation, like sorts, filters, and pagination
   * @returns The first record matching the options, null otherwise
   */
  async maybeFindFirst(options) {
    return await this.findFirst(options, false);
  }
  /**
   * Creates a new record in the backend datastore for this model using the Internal API
   *
   * Does *not* run actions -- use the Public API for that.
   *
   * @example
   * // creates a new post record in the database
   * const post = await api.internal.post.create({ title: "A new post" });
   *
   * @param record The data for the record to create
   * @returns The created record
   */
  async create(record) {
    const plan = internalCreateMutation(this.apiIdentifier, this.namespace, this.getRecordFromData(record, "create"));
    const response = await this.connection.currentClient.mutation(plan.query, plan.variables).toPromise();
    const result = (0, import_support.assertMutationSuccess)(response, this.dataPath(`create${this.capitalizedApiIdentifier}`));
    return (0, import_support.hydrateRecord)(response, result[this.apiIdentifier]);
  }
  /**
   * Creates a set of new records in the backend datastore for this model using the Internal API. Creates in bulk within the same database transaction for performance.
   *
   * Does *not* run actions -- use the Public API for that.
   *
   * @example
   * // creates 2 new post records in the database
   * const posts = await api.internal.post.bulkCreate([
   *   { title: "A new post" },
   *   { title: "Another new post" }
   * ]);
   *
   * @param record An array of data for the records to create
   * @returns The created records
   */
  async bulkCreate(records) {
    var _a;
    if (!((_a = this.options) == null ? void 0 : _a.pluralApiIdentifier)) {
      throw new import_support.GadgetClientError("Cannot perform bulkCreate without a pluralApiIdentifier");
    }
    const capitalizedPluralApiIdentifier = (0, import_support.capitalizeIdentifier)(this.options.pluralApiIdentifier);
    const plan = internalBulkCreateMutation(this.apiIdentifier, this.options.pluralApiIdentifier, this.namespace, records);
    const response = await this.connection.currentClient.mutation(plan.query, plan.variables).toPromise();
    const result = (0, import_support.assertMutationSuccess)(response, this.dataPath(`bulkCreate${capitalizedPluralApiIdentifier}`));
    return (0, import_support.hydrateRecordArray)(response, result[this.options.pluralApiIdentifier]);
  }
  /**
   * Updates an existing record in the backend datastore for this model using the Internal API
   *
   * Does *not* run actions -- use the Public API for that.
   *
   * @example
   * // updates post with id 10 in the database
   * const post = await api.internal.post.update(10, { title: "A new post title" });
   *
   * @param record The data for the record to update
   * @returns The updated record
   */
  async update(id, record) {
    (0, import_support.assert)(id, `Can't update a record without an ID passed`);
    const plan = internalUpdateMutation(this.apiIdentifier, this.namespace, id, this.getRecordFromData(record, "update"));
    const response = await this.connection.currentClient.mutation(plan.query, plan.variables).toPromise();
    const result = (0, import_support.assertMutationSuccess)(response, this.dataPath(`update${this.capitalizedApiIdentifier}`));
    return (0, import_support.hydrateRecord)(response, result[this.apiIdentifier]);
  }
  /**
   * Upserts a record in the backend datastore for this model using the Internal API.
   * If a matching record exists, it will be updated. If it doesn't exist, it will be created.
   * By default records will be matched by the `id` field, but you can specify a different field to match on.
   *
   * Does *not* run actions -- use the Public API for that.
   *
   * @example
   * // upserts post with id 10 in the database
   * // if a post with id 10 exists, it will be updated
   * // if a post with id 10 does not exist, it will be created
   * const post = await api.internal.post.upsert({ id: "10", title: "A new post title" });
   *
   * @example
   * // upserts post with slug "new-post" in the database
   * // if a post with slug "new-post" exists, it will be updated
   * // if a post with slug "new-post" does not exist, it will be created
   * const post = await api.internal.post.upsert({ post: {slug: "new-post", title: "A new post title" }, on: ["slug"] });
   *
   * @param record The data for the record to update
   * @returns The upserted record
   */
  async upsert(record) {
    const { on, ...recordData } = record;
    if (on) {
      (0, import_support.assert)(on.length > 0, `Must specify at least one field to upsert on`);
    }
    const plan = internalUpsertMutation(this.apiIdentifier, this.namespace, on, this.getRecordFromData(recordData, "upsert"));
    const response = await this.connection.currentClient.mutation(plan.query, plan.variables).toPromise();
    const result = (0, import_support.assertMutationSuccess)(response, this.dataPath(`upsert${this.capitalizedApiIdentifier}`));
    return (0, import_support.hydrateRecord)(response, result[this.apiIdentifier]);
  }
  /**
   * Deletes an existing record in the backend datastore for this model using the Internal API
   *
   * Does *not* run actions -- use the Public API for that.
   *
   * @example
   * // removes the post with id 10 in the database
   * await api.internal.post.delete(10);
   *
   * @param id The id of the record to delete
   */
  async delete(id) {
    (0, import_support.assert)(id, `Can't delete a record without an ID`);
    const plan = internalDeleteMutation(this.apiIdentifier, this.namespace, id);
    const response = await this.connection.currentClient.mutation(plan.query, plan.variables).toPromise();
    (0, import_support.assertMutationSuccess)(response, this.dataPath(`delete${this.capitalizedApiIdentifier}`));
  }
  /**
   * Deletes the records in the backend datastore that match the given filter criteria. Uses the Internal API.
   *
   * Does *not* run actions -- use the Public API for that.
   *
   * @example
   * // removes all unpublished posts from the database
   * await api.internal.post.deleteMany({filter: { published: { equals: false } } });
   *
   * @param options Search and filter options for the records to delete
   */
  async deleteMany(options) {
    const plan = internalDeleteManyMutation(this.apiIdentifier, this.namespace, options);
    const response = await this.connection.currentClient.mutation(plan.query, plan.variables).toPromise();
    (0, import_support.assertMutationSuccess)(response, this.dataPath(`deleteMany${this.capitalizedApiIdentifier}`));
  }
  dataPath(dataPath) {
    return ["internal", ...(0, import_support.namespaceDataPath)([dataPath], this.namespace)];
  }
}
function formatInternalSelectVariable(select) {
  if (!select)
    return;
  if (Array.isArray(select))
    return select;
  const result = [];
  for (const [key, value] of Object.entries(select)) {
    if (value) {
      result.push(key);
    }
  }
  return result;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  InternalModelManager,
  internalBulkCreateMutation,
  internalCreateMutation,
  internalDeleteManyMutation,
  internalDeleteMutation,
  internalFindFirstQuery,
  internalFindManyQuery,
  internalFindOneQuery,
  internalUpdateMutation,
  internalUpsertMutation
});
//# sourceMappingURL=InternalModelManager.js.map
