/* **************************************************************************************************************************************************************************
 * ********************************************************************************** MAIN **********************************************************************************
 * ************************************************************************************************************************************************************************** */

/*
 * Main function which executes all logic:
 * 1. get users from google group
 * 2. update users in spreadsheet
 * 3. create and schedule matches
 */
function main() {

  /*
  * Empty function to trigger any permission-granting needed
  */
  function allowPermissions() {
    const autoSpreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID); // sheet in workspace
    autoSpreadsheet.toast('Permissions enabled!');
  }

  // load up sheet

  const autoSpreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID); // sheet in workspace
  const autoSheet = autoSpreadsheet.getSheetByName(DATA_TAB);
  autoSheet.activate();
  
  autoSpreadsheet.toast('Script started!', null, -1);
  
  // get prefs

  const prefs = getPrefs(autoSpreadsheet);
  
  // get list of staff in sheet and data table dimensions

  let tableRowLength = autoSheet.getLastRow() - DATA_TABLE_START_ROW + 1;
  let tableColLength = autoSheet.getLastColumn();
  
  let staffList = autoSheet.getRange(DATA_TABLE_START_ROW, DATA_TABLE_START_COL, tableRowLength, tableColLength);
  let staffListArr = staffList.getValues();

  // update users

  updateUsers(autoSheet, staffListArr, prefs);
  
  // load new data

  tableRowLength = autoSheet.getLastRow() - DATA_TABLE_START_ROW + 1;
  tableColLength = autoSheet.getLastColumn();
  staffList = autoSheet.getRange(DATA_TABLE_START_ROW, DATA_TABLE_START_COL, tableRowLength, tableColLength);
  staffListArr = staffList.getValues();
  
  // set matches

  const staffRows = assignMatches(autoSheet, staffListArr, prefs, tableRowLength, tableColLength);
  
  // schedule invites

  scheduleMatches(autoSheet, staffRows, prefs);

  autoSpreadsheet.toast('Script completed succesfully!');

}

/*
 * Wrapper function to ONLY update user list
 */
function updateUsersWrapper() {
  
  // load up sheet
  
  const autoSpreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID); // sheet in workspace
  const autoSheet = autoSpreadsheet.getSheetByName(DATA_TAB);
  autoSheet.activate();
  
  autoSpreadsheet.toast('Script started!', null, -1);
  
  // get prefs
  
  const prefs = getPrefs(autoSpreadsheet);
  
  // get list of staff in sheet
  
  let tableRowLength = autoSheet.getLastRow() - DATA_TABLE_START_ROW + 1;
  let tableColLength = autoSheet.getLastColumn();
  
  let staffList = autoSheet.getRange(DATA_TABLE_START_ROW, DATA_TABLE_START_COL, tableRowLength, tableColLength);
  let staffListArr = staffList.getValues();

  // update users

  updateUsers(autoSheet, staffListArr, prefs);
  
  autoSpreadsheet.toast('Script completed succesfully!');
  
}

/*
 * Wrapper function to ONLY assign matches
 */
function assignMatchesWrapper() {
  
  // load up sheet
  
  const autoSpreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID); // sheet in workspace
  const autoSheet = autoSpreadsheet.getSheetByName(DATA_TAB);
  autoSheet.activate();
  
  autoSpreadsheet.toast('Script started!', null, -1);
  
  // get prefs
  
  const prefs = getPrefs(autoSpreadsheet);
  
  // get list of staff in sheet
  
  let tableRowLength = autoSheet.getLastRow() - DATA_TABLE_START_ROW + 1;
  let tableColLength = autoSheet.getLastColumn();
  
  let staffList = autoSheet.getRange(DATA_TABLE_START_ROW, DATA_TABLE_START_COL, tableRowLength, tableColLength);
  let staffListArr = staffList.getValues();
  
  // assign matches - using Munkres; factors in prefs["Mode"]
  assignMatches(autoSheet, staffListArr, prefs, tableRowLength, tableColLength);

  // Toast if completed successfully!
  autoSpreadsheet.toast('Script completed succesfully!');
}

/*
 * Wrapper function to ONLY schedule assigned matches
 */
function scheduleMatchesWrapper() {

  // load up sheet
  
  const autoSpreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID); // sheet in workspace
  const autoSheet = autoSpreadsheet.getSheetByName(DATA_TAB);
  autoSheet.activate();
  
  autoSpreadsheet.toast('Script started!', null, -1);
  
  // get prefs
  
  const prefs = getPrefs(autoSpreadsheet);
  
  // get list of staff in sheet
  
  let tableRowLength = autoSheet.getLastRow() - DATA_TABLE_START_ROW + 1;
  let tableColLength = autoSheet.getLastColumn();
  
  let staffList = autoSheet.getRange(DATA_TABLE_START_ROW, DATA_TABLE_START_COL, tableRowLength, tableColLength);
  let staffListArr = staffList.getValues();
  
  const staffLists = getStaffLists(staffListArr);

  // schedule matches

  scheduleMatches(autoSheet, staffLists.staffRows, prefs);

  autoSpreadsheet.toast('Script completed succesfully!');

}

/*
 * Get calendar preferences from spreadsheet
 */
function getPrefs(autoSpreadsheet) {

  const prefsSheet = autoSpreadsheet.getSheetByName(INTERFACE_TAB);
  prefsSheet.activate();
  const prefsData = prefsSheet.getRange(PREFS_TABLE_START_ROW, PREFS_TABLE_START_COL, PREFS_TABLE_ROWS, 2).getValues();
  const prefs = {};
  
  // populate preferences dictionary
  prefsData.forEach(prefRow => {
  
    prefs[prefRow[0]] = prefRow[1];

    if (['Month', 'Start Date Bound', 'End Date Bound'].includes(prefRow[0]) && prefs[prefRow[0]]) {
      prefs[prefRow[0]] = DateUtils.setTime(prefs[prefRow[0]], 32, 0, 0, 0); // adjust the time... weird timezone issues  
    }

  });
    
  return prefs;

}

/*
 * Set preference on spreadsheet
 */
function setPrefs(autoSpreadsheet, preference, value) {

  const prefsSheet = autoSpreadsheet.getSheetByName(INTERFACE_TAB);
  prefsSheet.activate();
  const prefsData = prefsSheet.getRange(PREFS_TABLE_START_ROW, PREFS_TABLE_START_COL, PREFS_TABLE_ROWS, 2).getValues();
  const prefs = {};
  let response = null;
  
  // populate preferences dictionary
  prefsData.forEach((prefRow, index) => {
  
    if(prefRow[0] == preference) {
      response = prefsSheet.getRange(PREFS_TABLE_START_ROW + index, PREFS_TABLE_START_COL + 1).setValue(value);
      return;
    }
    
  });
  
  return response;

}
