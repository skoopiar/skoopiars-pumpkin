import type { GadgetRecord as IGadgetRecord, RecordShape } from "@gadgetinc/core";
import { ChangeTracking } from "@gadgetinc/core";
/**
 * The overridden constructor below is TypeScript hijinx to make the generic GadgetRecord class include all the members of the wrapped generic Shape object
 * `GadgetRecord`s are generic because they can hold data of an arbitrary shape from the API, but TypeScript doesn't let the the class extend or implement anything without statically known members. The parameter is generic, so it's not statically known. So, we fake TypeScript out and create this pair of constructor and instance types that unions the instance of the class with the shape itself, making dot access of properties on the shape typecheck fine.
 */ export type GadgetRecord<Shape extends RecordShape> = IGadgetRecord<Shape>;
export { ChangeTracking } from "@gadgetinc/core";
/**
 * Instantiates a `GadgetRecord` with the attributes of your model. A `GadgetRecord` can be used to track changes to your model and persist those changes via Gadget actions.
 **/ export declare const GadgetRecord: (new <Shape extends RecordShape>(data: Shape) => GadgetRecord<Shape>) & {
    ChangeTracking: typeof ChangeTracking;
};
