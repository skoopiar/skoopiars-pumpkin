/* eslint-disable no-throw-literal */
/* eslint-disable @typescript-eslint/require-await */
import type {
  AnyInternalModelManager,
  AnyModelManager,
  GadgetRecordList as IGadgetRecordList,
  PaginationConfig,
  RecordShape,
} from "@gadgetinc/core";
import type { Jsonify } from "type-fest";
import type { GadgetRecord } from "./GadgetRecord.js";
import { GadgetClientError, GadgetOperationError } from "./support.js";

/** Represents a list of objects returned from the API. Facilitates iterating and paginating. */
export class GadgetRecordList<Shape extends RecordShape> extends Array<GadgetRecord<Shape>> implements IGadgetRecordList<Shape> {
  modelManager!: AnyModelManager | AnyInternalModelManager<Shape>;
  pagination!: PaginationConfig;

  /** Internal method used to create a list. Should not be used by applications. */
  static boot<Shape extends RecordShape>(
    modelManager: AnyModelManager | AnyInternalModelManager<Shape>,
    records: GadgetRecord<Shape>[],
    pagination: PaginationConfig
  ): GadgetRecordList<Shape> {
    const list = new GadgetRecordList<Shape>();
    list.push(...records);
    // Define modelManager as non-enumerable so it doesn't show up in util.inspect / REPL output
    Object.defineProperty(list, "modelManager", { value: modelManager, enumerable: false, writable: true, configurable: true });
    list.pagination = pagination;
    Object.freeze(list);
    return list;
  }

  firstOrThrow(): NonNullable<GadgetRecord<Shape>> {
    if (!this[0]) {
      throw new GadgetOperationError("No records found.", "GGT_RECORD_NOT_FOUND");
    }
    return this[0];
  }

  toJSON(): Jsonify<Shape>[] {
    return this.map((record) => record.toJSON());
  }

  get hasNextPage(): boolean {
    return this.pagination.pageInfo.hasNextPage;
  }

  get hasPreviousPage(): boolean {
    return this.pagination.pageInfo.hasPreviousPage;
  }

  get startCursor(): string {
    return this.pagination.pageInfo.startCursor;
  }

  get endCursor(): string {
    return this.pagination.pageInfo.endCursor;
  }

  async nextPage(): Promise<GadgetRecordList<Shape>> {
    if (!this.hasNextPage)
      throw new GadgetClientError("Cannot request next page because there isn't one, should check 'hasNextPage' to see if it exists");
    // Our current implementation of paging determines paging direction based on if "first" is defined. We can pass both "before" and "after" as options but only after is respected if first is sent. One of "before" or "after" is ignored depending on whether "first" is defined.
    const { first, last, before: _before, ...options } = this.pagination.options ?? {};
    const nextPage = this.modelManager.findMany({
      ...options,
      after: this.pagination.pageInfo.endCursor,
      first: first || last,
    }) as Promise<GadgetRecordList<Shape>>;
    return await nextPage;
  }

  async previousPage(): Promise<GadgetRecordList<Shape>> {
    if (!this.hasPreviousPage)
      throw new GadgetClientError(
        "Cannot request previous page because there isn't one, should check 'hasPreviousPage' to see if it exists"
      );
    // Our current implementation of paging determines paging direction based on if "first" is defined. We can pass both "before" and "after" as options but only after is respected if first is sent. One of "before" or "after" is ignored depending on whether "first" is defined.
    const { first, last, after: _after, ...options } = this.pagination.options ?? {};
    const prevPage = this.modelManager.findMany({
      ...options,
      before: this.pagination.pageInfo.startCursor,
      last: last || first,
    }) as Promise<GadgetRecordList<Shape>>;
    return await prevPage;
  }
}

Object.defineProperty(GadgetRecordList, Symbol.species, {
  get() {
    return Array;
  },
});
