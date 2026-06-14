/**
 * Code adopted from https://github.com/repeaterjs/repeater/blob/master/packages/repeater/src/repeater.ts after removing static classes.
 */ /** An error subclass which is thrown when there are too many pending push or next operations on a single repeater. */ export declare class RepeaterOverflowError extends Error {
    constructor(message: string);
}
/*** BUFFERS ***/ /** A special queue interface which allow multiple values to be pushed onto a repeater without having pushes wait or throw overflow errors, passed as the second argument to the repeater constructor. */ export interface RepeaterBuffer<TValue = unknown> {
    empty: boolean;
    full: boolean;
    add(value: TValue): unknown;
    remove(): TValue;
}
/** A buffer which allows you to push a set amount of values to the repeater without pushes waiting or throwing errors. */ export declare class FixedBuffer implements RepeaterBuffer {
    // capacity
    _c: number;
    // queue
    _q: Array<unknown>;
    constructor(capacity: number);
    get empty(): boolean;
    get full(): boolean;
    add(value: unknown): void;
    remove(): unknown;
}
// TODO: Use a circular buffer here.
/** Sliding buffers allow you to push a set amount of values to the repeater without pushes waiting or throwing errors. If the number of values exceeds the capacity set in the constructor, the buffer will discard the earliest values added. */ export declare class SlidingBuffer implements RepeaterBuffer {
    // capacity
    _c: number;
    // queue
    _q: Array<unknown>;
    constructor(capacity: number);
    get empty(): boolean;
    get full(): boolean;
    add(value: unknown): void;
    remove(): unknown;
}
/** Dropping buffers allow you to push a set amount of values to the repeater without the push function waiting or throwing errors. If the number of values exceeds the capacity set in the constructor, the buffer will discard the latest values added. */ export declare class DroppingBuffer implements RepeaterBuffer {
    // capacity
    _c: number;
    // queue
    _q: Array<unknown>;
    constructor(capacity: number);
    get empty(): boolean;
    get full(): boolean;
    add(value: unknown): void;
    remove(): unknown;
}
/*** TYPES ***/ /** The type of the first argument passed to the executor callback. */ type Push<T, TNext = unknown> = (value: PromiseLike<T> | T) => Promise<TNext | undefined>;
/** The type of the second argument passed to the executor callback. A callable promise. */ type Stop = ((err?: unknown) => undefined) & Promise<undefined>;
/** The type of the callback passed to the Repeater constructor. */ type RepeaterExecutor<T, TReturn = any, TNext = unknown> = (push: Push<T, TNext>, stop: Stop) => PromiseLike<TReturn> | TReturn;
/** The maximum number of push or next operations which may exist on a single repeater. */ export declare const MAX_QUEUE_LENGTH = 1024;
// NOTE: While repeaters implement and are assignable to the AsyncGenerator interface, and you can use the types interchangeably, we don’t use typescript’s implements syntax here because this would make supporting earlier versions of typescript trickier. This is because TypeScript version 3.6 changed the iterator types by adding the TReturn and TNext type parameters.
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export declare class Repeater<T, TReturn = any, TNext = unknown> {
    constructor(executor: RepeaterExecutor<T, TReturn, TNext>, buffer?: RepeaterBuffer | undefined);
    next(value?: PromiseLike<TNext> | TNext): Promise<IteratorResult<T, TReturn>>;
    return(value?: PromiseLike<TReturn> | TReturn): Promise<IteratorResult<T, TReturn>>;
    throw(err: unknown): Promise<IteratorResult<T, TReturn>>;
}
// Augment the class type to include the async iterator method for typing
export interface Repeater<T, TReturn = any, TNext = unknown> {
    [Symbol.asyncIterator](): this;
}
export { };
