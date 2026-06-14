/**
* Time components for precise type checking
*/ /**
* UTC time format: "HH:MM UTC"
* Examples: "10:00 UTC", "23:59 UTC", "0:0 UTC"
*/ /**
* Minutes on the hour format: "MM mins"
* Examples: "30 mins", "0 mins", "59 mins"
*/ /**
* Day of month format: "Day DD"
* Examples: "Day 1", "Day 15", "Day 31"
*/ /**
* Date in year format: "MMM DD"
* Examples: "Jan 1", "Dec 31", "Feb 29"
*/ /**
* Interval-based scheduler trigger options with precise typing
*/ /**
* Cron-based scheduler trigger options with typed expression
*/ /**
* Scheduler trigger item - supports both interval-based and cron-based scheduling
*/ /**
* Shopify trigger options
*/ /**
* BigCommerce trigger options
*/ /**
* A single table entry in a database trigger: either a table name string (all operations)
* or an object specifying the table and which operations to listen for
*/ /**
* External database trigger options - maps each database connection's API identifier
* to the list of tables (and optionally operations) to listen for changes on
*/ /**
* Trigger options for actions
*/ /** API trigger - allows the action to be called via the Gadget API */ /** Scheduler trigger - runs the action on a schedule */ /** Google OAuth sign in trigger */ /** Google OAuth sign up trigger */ /** Reset password trigger */ /** Send reset password trigger */ /** Verified email trigger */ /** Send verification email trigger */ /** Change password trigger */ /** Email sign up trigger */ /** Email sign in trigger */ /** Sign out trigger */ /** Shopify trigger - responds to Shopify webhooks */ /** BigCommerce trigger - responds to BigCommerce webhooks */ /** ChatGPT install trigger */ /** External database trigger - responds to INSERT, UPDATE, and DELETE events from a connected external database */ /**
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
*/ export { };
