/* **************************************************************************************************************************************************************************
 * *************************************************************************** ASSIGN MATCHES *******************************************************************************
 * ************************************************************************************************************************************************************************** */

function assignMatches(autoSheet, staffListArr, prefs, tableRowLength, tableColLength) {
  var staffRows = getStaffLists(staffListArr).staffRows
  var leaderRows = getStaffLists(staffListArr).leadershipRows

  if (prefs["Mode"] === "Leadership") { // if leadership mode, keep the 2 groups and call costMatrix
    costMatrixObject = createCostMatrix(staffRows, leaderRows);
  } else {
  // recombine staff and leader rows; then shuffle, split into 2 groups
    allStaff = staffRows.concat(leaderRows)
    shuffle(allStaff);
    firstGroupEndIdx = Math.floor(allStaff.length / 2);
    staffRows = allStaff.slice(0, firstGroupEndIdx);
    leaderRows = allStaff.slice(firstGroupEndIdx,);

    costMatrixObject = createCostMatrix(staffRows, leaderRows);
  } 
  leaderRows = costMatrixObject.expandedLeaderRows
  matrix = costMatrixObject.costMatrix;

  var m = new Munkres();
  var indices = m.compute(matrix);
  // console.log(format_matrix(matrix), 'Lowest cost through this matrix:');
  // var total = 0;

  // start writing dates range in new column

  var idxOfColumnToWriteTo = autoSheet.getLastColumn() + 1
  const monthsArr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  // Write start and end dates from prefs into first row
  // example Date: "Mon Jun 01 2020 - Fri Jun 26 2020"

  autoSheet.getRange(1, idxOfColumnToWriteTo).setValue(prefs['Start Date Bound'].toDateString() + ' - ' + prefs['End Date Bound'].toDateString());

  currentYear = prefs['End Date Bound'].toDateString().slice(-4) 
  currentMonth = prefs['Start Date Bound'].toDateString().slice(4,7)
  // update month name based on date range above
  // example: Jun 2020 - 1

  // if month name cell to the left has the same current month, then 
  var prevMonthLabel = autoSheet.getRange(2, idxOfColumnToWriteTo - 1).getValues()[0][0];
  if (prevMonthLabel.includes(currentMonth)) {

    iterationInCurrentMonth = (parseInt(prevMonthLabel.slice(-1)) + 1).toString();
    autoSheet.getRange(2, idxOfColumnToWriteTo).setValue(currentMonth + " " + currentYear + " - " + iterationInCurrentMonth);

  } else {
    autoSheet.getRange(2, idxOfColumnToWriteTo).setValue(currentMonth + " " + " " + currentYear + ' - 1');
  }

  for (var i = 0; i < indices.length; ++i) {
    var row = indices[i][0], col = indices[i][1];
    var value = matrix[row][col];
    // total += value;

    // set match in sheet
    staffRowGettingMatched = staffRows[row].tableRow //gives the table index of staff member
    emailOfLeaderGettingAssigned = leaderRows[col].email
    autoSheet.getRange(DATA_TABLE_START_ROW + staffRowGettingMatched, idxOfColumnToWriteTo).setValue(emailOfLeaderGettingAssigned);
    // console.log('(' + row + ', ' + col + ') -> ' + value);
  }

  // write in the "-" for anyone not getting a staffing
  for (var i = 0; i < tableRowLength; i++) {
    currentCell = autoSheet.getRange(DATA_TABLE_START_ROW + i, idxOfColumnToWriteTo)
    currentCellValue = currentCell.getValues()[0][0]
    if (currentCellValue == "") {
      autoSheet.getRange(DATA_TABLE_START_ROW + i, idxOfColumnToWriteTo).setValue('-');
    }
  }
  // console.log('total cost:', total);
  return staffRows;
}

// Save necessary information for each group (e.g. isLeadership, sheet row number) in a UNIFORM way then split into a leadership and a staff group
function getStaffLists(staffListArr) {

  const leadershipRows = [];
  const staffRows = [];

  // Check if we're in Leadership mode; if not do random pairing - assign 1 bye if we have an odd number of staff
    for (let i = 0; i < staffListArr.length; i++) {
      if (!staffListArr[i][0]) break; // end of list
      if (!staffListArr[i][1]) continue; // skip inactive

      // Get match history 
      let alreadyMatched = [];
      for (let j = DATA_TABLE_FIRST_MONTH_COL; j < staffListArr[i].length; j++) {
        if (staffListArr[i][j]) alreadyMatched.push(staffListArr[i][j]);
      }

      // if is leadership
      if (staffListArr[i][4]) {
        leadershipRows.push({
          tableRow: i,
          email: staffListArr[i][0],
          staffClass: staffListArr[i][2],
          staffLocation: staffListArr[i][3],
          isLeadership: staffListArr[i][4],
          alreadyMatched: alreadyMatched
        });

      // if is staff
      } else {
          staffRows.push({
            tableRow: i,
            email: staffListArr[i][0],
            staffClass: staffListArr[i][2],
            staffLocation: staffListArr[i][3],
            isLeadership: staffListArr[i][4],
            alreadyMatched: alreadyMatched
          });
      }
    }
    return {
      leadershipRows: leadershipRows,
      staffRows: staffRows
    };
}
