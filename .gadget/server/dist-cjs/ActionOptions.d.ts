
/**
* Time components for precise type checking
*/
type Hour = "00" | "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20" | "21" | "22" | "23" | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type Minute = "00" | "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20" | "21" | "22" | "23" | "24" | "25" | "26" | "27" | "28" | "29" | "30" | "31" | "32" | "33" | "34" | "35" | "36" | "37" | "38" | "39" | "40" | "41" | "42" | "43" | "44" | "45" | "46" | "47" | "48" | "49" | "50" | "51" | "52" | "53" | "54" | "55" | "56" | "57" | "58" | "59" | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type DayOfWeek = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
type Month = "Jan" | "Feb" | "Mar" | "Apr" | "May" | "Jun" | "Jul" | "Aug" | "Sep" | "Oct" | "Nov" | "Dec";
/**
* UTC time format: "HH:MM UTC"
* Examples: "10:00 UTC", "23:59 UTC", "0:0 UTC"
*/
type UTCTime = `${Hour}:${Minute} UTC`;
/**
* Minutes on the hour format: "MM mins"
* Examples: "30 mins", "0 mins", "59 mins"
*/
type MinutesOnHour = `${Minute} mins`;
/**
* Day of month format: "Day DD"
* Examples: "Day 1", "Day 15", "Day 31"
*/
type DayOfMonth = `Day ${number}`;
/**
* Date in year format: "MMM DD"
* Examples: "Jan 1", "Dec 31", "Feb 29"
*/
type DateInYear = `${Month} ${number}`;
/**
* Interval-based scheduler trigger options with precise typing
*/
export type IntervalScheduleItem = {
	every: "minute"
} | {
	every: "hour"
	at: MinutesOnHour
} | {
	every: "day"
	at: UTCTime
} | {
	every: "week"
	on: DayOfWeek
	at: UTCTime
} | {
	every: "month"
	on: DayOfMonth
	at: UTCTime
} | {
	every: "year"
	on: DateInYear
	at: UTCTime
};
/**
* Cron-based scheduler trigger options with typed expression
*/
export type CronScheduleItem = {
	cron: string
};
/**
* Scheduler trigger item - supports both interval-based and cron-based scheduling
*/
export type ScheduleItem = IntervalScheduleItem | CronScheduleItem;
/**
* Shopify trigger options
*/
export interface ShopifyTriggerOptions {
	webhooks?: string[];
	includeFields?: string[];
	shopifyFilter?: string;
	priority?: "high" | "default" | "low";
	triggerKey?: string;
}
/**
* BigCommerce trigger options
*/
export interface BigCommerceTriggerOptions {
	webhooks?: string[];
	priority?: "high" | "default" | "low";
}
/**
* A single table entry in a database trigger: either a table name string (all operations)
* or an object specifying the table and which operations to listen for
*/
export type DatabaseTriggerTableEntry = string | {
	table: string
	operations?: ("INSERT" | "UPDATE" | "DELETE")[]
};
/**
* External database trigger options - maps each database connection's API identifier
* to the list of tables (and optionally operations) to listen for changes on
*/
export type DatabaseTriggerOptions = Record<string, DatabaseTriggerTableEntry[]>;
/**
* Trigger options for actions
*/
export interface ActionTriggers {
	/** API trigger - allows the action to be called via the Gadget API */
	api?: boolean;
	/** Scheduler trigger - runs the action on a schedule */
	scheduler?: ScheduleItem[];
	/** Google OAuth sign in trigger */
	googleOAuthSignIn?: boolean;
	/** Google OAuth sign up trigger */
	googleOAuthSignUp?: boolean;
	/** Reset password trigger */
	resetPassword?: boolean;
	/** Send reset password trigger */
	sendResetPassword?: boolean;
	/** Verified email trigger */
	verifiedEmail?: boolean;
	/** Send verification email trigger */
	sendVerificationEmail?: boolean;
	/** Change password trigger */
	changePassword?: boolean;
	/** Email sign up trigger */
	emailSignUp?: boolean;
	/** Email sign in trigger */
	emailSignIn?: boolean;
	/** Sign out trigger */
	signOut?: boolean;
	/** Shopify trigger - responds to Shopify webhooks */
	shopify?: ShopifyTriggerOptions;
	/** BigCommerce trigger - responds to BigCommerce webhooks */
	bigcommerce?: BigCommerceTriggerOptions;
	/** ChatGPT install trigger */
	chatgptInstall?: boolean;
	/** External database trigger - responds to INSERT, UPDATE, and DELETE events from a connected external database */
	database?: DatabaseTriggerOptions;
}
/**
* Specifies action configurations in Gadget
*
* @property actionType - defines the behaviour of an action in a data model, which usually means changing the data on a
record (defaults to 'custom').
* @property transactional - indicates whether `run` function should be transactional or not (defaults to `true` for
model actions, and `false` for actions).
* @property timeoutMS - specifies max time in milliseconds for the action to run before being terminated (defaults to
180000ms[3 mins]).
* @property returnType - specifies if an action should return the result of the `run` function (defaults to `false` for
model actions and `true` for actions).
* @property triggers - specifies the triggers to an action.
*/
export interface ActionOptions {
	actionType?: "create" | "update" | "delete" | "custom";
	transactional?: boolean;
	timeoutMS?: number;
	returnType?: boolean;
	triggers?: ActionTriggers;
}
export {};
