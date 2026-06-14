// All the generated types for the "games" model preconditions, actions, params, etc
import { AmbientContext } from "../AmbientContext";
import { ActionExecutionScope, NotYetTyped, ValidationErrors, ActionTrigger, TriggerWithType } from "../types";
import type { Scalars } from "@gadget-client/skoopiar";
import { GadgetRecord, Game } from "@gadget-client/skoopiar";
import type { Select } from "@gadgetinc/core";

export type DefaultGameServerSelection = {
  readonly __typename: true;
      readonly id: true;
      readonly createdAt: true;
      readonly updatedAt: true;
      readonly messageId: true;
      readonly userId: true;
      readonly objectName: true;
  };

  
/** Context of the `create` action on the `game` model. */
export interface CreateGameActionContext extends AmbientContext {
  /**
  * The model this action is operating on
  */
  model: NotYetTyped;
  /**
  * An object specifying the `game` record this action is operating on.
  */
  record: GadgetRecord<Select<Game, DefaultGameServerSelection>>;
  /**
  * @deprecated Use 'return' instead.
  */
  scope: ActionExecutionScope;
  /**
  * An object specifying the trigger to this action (e.g. API call, webhook events etc.).
  */
  trigger: TriggerWithType<"api"> | TriggerWithType<"background-action">;
  /**
  * An object containing the incoming data(this models fields) passed by triggers or user inputs.
  */
  params: {
game?: { messageId?: string;userId?: string;objectName?: string; };
};
  /**
  * @private The context of this action.
  */
  context: CreateGameActionContext;
};


    
/** Context of the `update` action on the `game` model. */
export interface UpdateGameActionContext extends AmbientContext {
  /**
  * The model this action is operating on
  */
  model: NotYetTyped;
  /**
  * An object specifying the `game` record this action is operating on.
  */
  record: GadgetRecord<Select<Game, DefaultGameServerSelection>>;
  /**
  * @deprecated Use 'return' instead.
  */
  scope: ActionExecutionScope;
  /**
  * An object specifying the trigger to this action (e.g. API call, webhook events etc.).
  */
  trigger: TriggerWithType<"api"> | TriggerWithType<"background-action">;
  /**
  * An object containing the incoming data(this models fields) passed by triggers or user inputs.
  */
  params: {
game?: { messageId?: string;userId?: string;objectName?: string; };    
id?: string;
};
  /**
  * @private The context of this action.
  */
  context: UpdateGameActionContext;
};


    
/** Context of the `delete` action on the `game` model. */
export interface DeleteGameActionContext extends AmbientContext {
  /**
  * The model this action is operating on
  */
  model: NotYetTyped;
  /**
  * An object specifying the `game` record this action is operating on.
  */
  record: GadgetRecord<Select<Game, DefaultGameServerSelection>>;
  /**
  * @deprecated Use 'return' instead.
  */
  scope: ActionExecutionScope;
  /**
  * An object specifying the trigger to this action (e.g. API call, webhook events etc.).
  */
  trigger: TriggerWithType<"api"> | TriggerWithType<"background-action">;
  /**
  * An object containing the incoming data(this models fields) passed by triggers or user inputs.
  */
  params: {
id?: string;
};
  /**
  * @private The context of this action.
  */
  context: DeleteGameActionContext;
};


  