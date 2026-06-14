/* eslint-disable no-throw-literal */ /* eslint-disable @typescript-eslint/require-await */ import type { AnyInternalModelManager, AnyModelManager, GadgetRecordList as IGadgetRecordList, PaginationConfig, RecordShape } from "@gadgetinc/core";
import type { Jsonify } from "type-fest";
import type { GadgetRecord } from "./GadgetRecord.js";
/** Represents a list of objects returned from the API. Facilitates iterating and paginating. */ export declare class GadgetRecordList<Shape extends RecordShape> extends Array<GadgetRecord<Shape>> implements IGadgetRecordList<Shape> {
    modelManager!: AnyModelManager | AnyInternalModelManager<Shape>;
    pagination!: PaginationConfig;
    /** Internal method used to create a list. Should not be used by applications. */ static boot<Shape extends RecordShape>(modelManager: AnyModelManager | AnyInternalModelManager<Shape>, records: GadgetRecord<Shape>[], pagination: PaginationConfig): GadgetRecordList<Shape>;
    firstOrThrow(): NonNullable<GadgetRecord<Shape>>;
    toJSON(): Jsonify<Shape>[];
    get hasNextPage(): boolean;
    get hasPreviousPage(): boolean;
    get startCursor(): string;
    get endCursor(): string;
    nextPage(): Promise<GadgetRecordList<Shape>>;
    previousPage(): Promise<GadgetRecordList<Shape>>;
}
