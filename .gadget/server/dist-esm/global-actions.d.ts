
import type { AmbientContext } from "./AmbientContext.js";
import type { TriggerWithType, ActionExecutionScope } from "./types.js";
/** Context of the `inspectDiscordCommands` action. */
export interface InspectDiscordCommandsGlobalActionContext extends AmbientContext {
	/**
	* @deprecated Use 'returnType' instead.
	* Useful for returning data from this action by setting `scope.result`.
	*/
	scope: ActionExecutionScope;
	/**
	* An object specifying the trigger to this action (e.g. API call, custom params).
	*/
	params: {};
	/**
	* An object specifying the trigger to this action (e.g. api call, scheduler etc.)
	*/
	trigger: TriggerWithType<"api"> | TriggerWithType<"background-action">;
	/**
	* @private The context of this action.
	*/
	context: InspectDiscordCommandsGlobalActionContext;
}
/** Context of the `registerCommands` action. */
export interface RegisterCommandsGlobalActionContext extends AmbientContext {
	/**
	* @deprecated Use 'returnType' instead.
	* Useful for returning data from this action by setting `scope.result`.
	*/
	scope: ActionExecutionScope;
	/**
	* An object specifying the trigger to this action (e.g. API call, custom params).
	*/
	params: {};
	/**
	* An object specifying the trigger to this action (e.g. api call, scheduler etc.)
	*/
	trigger: TriggerWithType<"api"> | TriggerWithType<"background-action">;
	/**
	* @private The context of this action.
	*/
	context: RegisterCommandsGlobalActionContext;
}
/** Context of the `removeCommands` action. */
export interface RemoveCommandsGlobalActionContext extends AmbientContext {
	/**
	* @deprecated Use 'returnType' instead.
	* Useful for returning data from this action by setting `scope.result`.
	*/
	scope: ActionExecutionScope;
	/**
	* An object specifying the trigger to this action (e.g. API call, custom params).
	*/
	params: {};
	/**
	* An object specifying the trigger to this action (e.g. api call, scheduler etc.)
	*/
	trigger: TriggerWithType<"api"> | TriggerWithType<"background-action">;
	/**
	* @private The context of this action.
	*/
	context: RemoveCommandsGlobalActionContext;
}
