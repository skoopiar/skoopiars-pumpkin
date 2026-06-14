import "path";

import { SignUpUserActionContext } from "./models/User.js";

import { SignInUserActionContext } from "./models/User.js";

import { SignOutUserActionContext } from "./models/User.js";

import { UpdateUserActionContext } from "./models/User.js";

import { DeleteUserActionContext } from "./models/User.js";

import { SendVerifyEmailUserActionContext } from "./models/User.js";

import { VerifyEmailUserActionContext } from "./models/User.js";

import { SendResetPasswordUserActionContext } from "./models/User.js";

import { ResetPasswordUserActionContext } from "./models/User.js";

import { ChangePasswordUserActionContext } from "./models/User.js";

import { CreateGameActionContext } from "./models/Game.js";

import { UpdateGameActionContext } from "./models/Game.js";

import { DeleteGameActionContext } from "./models/Game.js";

import { InspectDiscordCommandsGlobalActionContext } from "./global-actions.js";

import { RegisterCommandsGlobalActionContext } from "./global-actions.js";

import { RemoveCommandsGlobalActionContext } from "./global-actions.js";



// @ts-ignore 
declare module "../../../api/models/user/actions/signUp" {
  export type ActionRun = (params: SignUpUserActionContext) => Promise<any>;
  export type ActionOnSuccess = (params: SignUpUserActionContext) => Promise<any>;
}

// @ts-ignore 
declare module "../../../api/models/user/actions/signIn" {
  export type ActionRun = (params: SignInUserActionContext) => Promise<any>;
  export type ActionOnSuccess = (params: SignInUserActionContext) => Promise<any>;
}

// @ts-ignore 
declare module "../../../api/models/user/actions/signOut" {
  export type ActionRun = (params: SignOutUserActionContext) => Promise<any>;
  export type ActionOnSuccess = (params: SignOutUserActionContext) => Promise<any>;
}

// @ts-ignore 
declare module "../../../api/models/user/actions/update" {
  export type ActionRun = (params: UpdateUserActionContext) => Promise<any>;
  export type ActionOnSuccess = (params: UpdateUserActionContext) => Promise<any>;
}

// @ts-ignore 
declare module "../../../api/models/user/actions/delete" {
  export type ActionRun = (params: DeleteUserActionContext) => Promise<any>;
  export type ActionOnSuccess = (params: DeleteUserActionContext) => Promise<any>;
}

// @ts-ignore 
declare module "../../../api/models/user/actions/sendVerifyEmail" {
  export type ActionRun = (params: SendVerifyEmailUserActionContext) => Promise<any>;
  export type ActionOnSuccess = (params: SendVerifyEmailUserActionContext) => Promise<any>;
}

// @ts-ignore 
declare module "../../../api/models/user/actions/verifyEmail" {
  export type ActionRun = (params: VerifyEmailUserActionContext) => Promise<any>;
  export type ActionOnSuccess = (params: VerifyEmailUserActionContext) => Promise<any>;
}

// @ts-ignore 
declare module "../../../api/models/user/actions/sendResetPassword" {
  export type ActionRun = (params: SendResetPasswordUserActionContext) => Promise<any>;
  export type ActionOnSuccess = (params: SendResetPasswordUserActionContext) => Promise<any>;
}

// @ts-ignore 
declare module "../../../api/models/user/actions/resetPassword" {
  export type ActionRun = (params: ResetPasswordUserActionContext) => Promise<any>;
  export type ActionOnSuccess = (params: ResetPasswordUserActionContext) => Promise<any>;
}

// @ts-ignore 
declare module "../../../api/models/user/actions/changePassword" {
  export type ActionRun = (params: ChangePasswordUserActionContext) => Promise<any>;
  export type ActionOnSuccess = (params: ChangePasswordUserActionContext) => Promise<any>;
}

// @ts-ignore 
declare module "../../../api/models/game/actions/create" {
  export type ActionRun = (params: CreateGameActionContext) => Promise<any>;
  export type ActionOnSuccess = (params: CreateGameActionContext) => Promise<any>;
}

// @ts-ignore 
declare module "../../../api/models/game/actions/update" {
  export type ActionRun = (params: UpdateGameActionContext) => Promise<any>;
  export type ActionOnSuccess = (params: UpdateGameActionContext) => Promise<any>;
}

// @ts-ignore 
declare module "../../../api/models/game/actions/delete" {
  export type ActionRun = (params: DeleteGameActionContext) => Promise<any>;
  export type ActionOnSuccess = (params: DeleteGameActionContext) => Promise<any>;
}

// @ts-ignore 
declare module "../../../api/actions/inspectDiscordCommands" {
  export type ActionRun = (params: InspectDiscordCommandsGlobalActionContext) => Promise<any>;
  export type ActionOnSuccess = (params: InspectDiscordCommandsGlobalActionContext) => Promise<any>;
}

// @ts-ignore 
declare module "../../../api/actions/registerCommands" {
  export type ActionRun = (params: RegisterCommandsGlobalActionContext) => Promise<any>;
  export type ActionOnSuccess = (params: RegisterCommandsGlobalActionContext) => Promise<any>;
}

// @ts-ignore 
declare module "../../../api/actions/removeCommands" {
  export type ActionRun = (params: RemoveCommandsGlobalActionContext) => Promise<any>;
  export type ActionOnSuccess = (params: RemoveCommandsGlobalActionContext) => Promise<any>;
}

