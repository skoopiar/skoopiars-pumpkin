
import { AnyInternalModelManager } from "@gadgetinc/core";
export declare class Session {
	#private;
	private _modelApiIdentifier;
	private _id;
	static fromInput(modelApiIdentifier: string | null, input?: Record<string, any>): Session | undefined;
	changedKeys: Set<string>;
	ended: boolean;
	touched: boolean;
	constructor(_modelApiIdentifier: string | null, _id: string | null, obj: Record<string, any>);
	get(key: string): any;
	set(key: string, value: any): void;
	touch(): void;
	delete(key: string): void;
	end(): void;
	clearChanges(): void;
	get changed(): boolean;
	persist(modelManager?: AnyInternalModelManager): Promise<void>;
	toJSON(): Record<string, any>;
	toChangedJSON(): Record<string, any>;
	get id(): string | null;
	set id(value: string | null);
}
