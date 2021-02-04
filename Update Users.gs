/* **************************************************************************************************************************************************************************
 * **************************************************************************** UPDATE USERS ********************************************************************************
 * ************************************************************************************************************************************************************************** */

/*
 * Updates user list to latest from email group
 */
function updateUsers(autoSheet, staffListArr, prefs) {
  
  // get emails from group
  
  const emailGroup = GroupsApp.getGroupByEmail(prefs['Mailing List']);
  const users = getUsersFromGroup([], emailGroup);
  
  // iterate through email list
  
  const sheetEmails = [];
  let lastRowIndex = staffListArr.length - 1;
  
  // create list of existing emails
  
  for (let i = 0; i < staffListArr.length; i++) {
    if (staffListArr[i][0]) {
      sheetEmails.push(staffListArr[i][0]);
    } else {
      lastRowIndex = i - 1;
      break;
    }
    
    // deactivate this row if not in list anymore
    
    if (!users.map(user => user.email).includes(staffListArr[i][0])) {
      autoSheet.getRange(DATA_TABLE_START_ROW + i,DATA_TABLE_START_COL + 1).setValue(0);
      console.log('Deactivated user: ' + staffListArr[i][0]);
    }
  }
  // console.log('Users in sheet: ' + sheetEmails);
  
  // find out which emails are new
  
  const newUsers = users.filter(user => !sheetEmails.includes(user.email));
  console.log('Add users: ' + JSON.stringify(newUsers));
  
  // BG Edit: Send email when there are new users
  const subject = "Notice: PEVC 1:1 - New Team Member Added!";
  const message = "PEVC 1:1 Team,\n \nOne or more new team members have been added to the roster!\
 Please reach out to the Talent Management team to get the latest coach and RL updates.\n \nThanks!"; 
  
  if (newUsers.length) {
      MailApp.sendEmail(ALERT_EMAILS.join(), subject, message);
  }
  
  // add new users to sheet
  
  for (let i = 0; i < newUsers.length; i++) {
    autoSheet.getRange(DATA_TABLE_START_ROW + lastRowIndex + i + 1,DATA_TABLE_START_COL).setValue(newUsers[i].email);
    autoSheet.getRange(DATA_TABLE_START_ROW + lastRowIndex + i + 1,DATA_TABLE_START_COL + 1).setValue(1);
  }

  // get the full list of staff in sheet
  let tableRowLength = autoSheet.getLastRow() - DATA_TABLE_START_ROW + 1;
  let tableColLength = autoSheet.getLastColumn();
  let newStaffList = autoSheet.getRange(DATA_TABLE_START_ROW, DATA_TABLE_START_COL, tableRowLength, tableColLength);
  let staffListEmails = newStaffList.getValues().map(values => values[0]);
 
  // pull title of all users and write to Staff Class column leveraging the PeopleAPI
  for (let i = 0; i < staffListEmails.length; i++){
    titleResponse = People.People.searchDirectoryPeople({
      query: staffListEmails[i],
      sources: "DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE",
      readMask: ("organizations")
    })
    var getPeopleAPIResult = titleResponse.getPeople();

    // check if the email yields people data, if not then we skip
    if (getPeopleAPIResult) {
      var peopleObject = getPeopleAPIResult[0];
      title = peopleObject['organizations'][0]['title'];
      autoSheet.getRange(DATA_TABLE_START_ROW + i,DATA_TABLE_START_COL + 2).setValue(title);
      location = peopleObject['organizations'][0]['location'];
      autoSheet.getRange(DATA_TABLE_START_ROW + i,DATA_TABLE_START_COL + 3).setValue(location)

      Utilities.sleep(1000); //  second wait for every API call - 100 seconds for 200 calls

    } else {
      autoSheet.getRange(DATA_TABLE_START_ROW + i, DATA_TABLE_START_COL + 1).setValue(0);
      continue
    }

    // update Leadership flag based on prefs
    if (title === "Partner" && prefs["Partner Leader?"] === "Yes") { 
      autoSheet.getRange(DATA_TABLE_START_ROW + i,DATA_TABLE_START_COL + 4).setValue(1)
    } else if (title === "Managing Director" && prefs["MD Leader?"] === "Yes") {
      autoSheet.getRange(DATA_TABLE_START_ROW + i,DATA_TABLE_START_COL + 4).setValue(1)
    } else if (title === "Director" && prefs["Director Leader?"] === "Yes") {
      autoSheet.getRange(DATA_TABLE_START_ROW + i,DATA_TABLE_START_COL + 4).setValue(1)
    } else { 
        autoSheet.getRange(DATA_TABLE_START_ROW + i,DATA_TABLE_START_COL + 4).setValue(0)
    }
  }
}

/*
 * Recursive function to get all users out of a group. Also tracks the group's email
 */
function getUsersFromGroup(users, group) {
  
  // add all direct users
  
  users = users.concat(group.getUsers().map(user => { return {
    email: user.getEmail(),
    group: group.getEmail()
  }}));
  
  // get subgroups
  
  let subgroups = [];
  
  // not sure why this is needed but I think it's a bug in the API.
  // Luckily there's only one set of subgroups here so seems to be OK
  
  try {
    subgroups = group.getGroups();
  } catch (err) {
    console.error(err);
  }
  
  // stop recursion when no more subgroups
  
  if (!subgroups.length) {
    return users;
  }
  
  // recurse into subgroups
  
  else {
    subgroups.forEach(subgroup => {
      users = users.concat(getUsersFromGroup([], subgroup));
    });
    return users;
  }

}
