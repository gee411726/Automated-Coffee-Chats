/* **************************************************************************************************************************************************************************
 * ****************************************************************************** CONSTANTS *********************************************************************************
 * ************************************************************************************************************************************************************************** */

const SPREADSHEET_ID = 'xxxxxx'; // replace with sheet ID of Google Sheet
const INTERFACE_TAB = 'Interface';
const DATA_TAB = 'Database';

const PREFS_TABLE_START_ROW = 2;
const PREFS_TABLE_START_COL = 1;
const PREFS_TABLE_ROWS = 14;

const MONTHS_LABEL_START_ROW = 2;

const DATA_TABLE_START_ROW = 3;
const DATA_TABLE_START_COL = 1;
const DATA_TABLE_FIRST_MONTH_COL = 7;

const ALERT_EMAILS = ['email_list']; // replace with email address of email list to receive alerts on program status

const SCHEDULING_ENABLED = true; // true = schedules events. use this to avoid scheduling a bunch of events when testing... o_O
const SEND_EVENT_INVITE = true; // send email to invitees (maybe turn this on once it's working)

const SCHEDULED_SUCCESS = '#d9ead3'; // shade cell upon successful schedule
const SCHEDULED_FAILURE = '#e6b8af'; // shade cell upon failed schedule
const SCHEDULED_MET = '#c9daf8'; // cell shaded by conditional formatting upon successful meeting
const EVENT_INTERVAL = 20; // must be a divisor of 60

const MAX_MATCHES = 5;
const MAX_MATCHES_PARTNERS = 1;
const MAX_MATCHES_MDS = 1;
const MAX_MATCHES_DIR = 1; 
