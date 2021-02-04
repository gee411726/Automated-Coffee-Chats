function createCostMatrix(staffRows, leaderRows) {
  /***************** Start new code to create cost matrix **********************************/
  /*****************************************************************************************/
  // Keep adding copies of leadership rows until length of leaderRows is > length of staffRows
  expandedLeaderRows = leaderRows;
  while (expandedLeaderRows.length < staffRows.length) {
    expandedLeaderRows = expandedLeaderRows.concat(leaderRows);
  }
  // Create nxn cost matrix: n workers (staff rows) and n jobs (leader rows)
  // fill in cost matrix based on whether people have matched recently - by array indices
  // initialize cost matrix with 0
  costMatrix = []
  for (let n = 0; n < staffRows.length; n++) {
    costMatrix.push([])
    for (let m = 0; m < expandedLeaderRows.length; m++) {
      costMatrix[n].push(0)
    }
  }
  // assign costs to staff group pairing with leader (staff group is the worker, leader is the resource in the Munkres problem)

  for (let staff = 0; staff < staffRows.length; staff++) {
    for (let leader = 0; leader < expandedLeaderRows.length; leader++) {
      costMatrix[staff][leader] = getCostToAssign(staffRows[staff], expandedLeaderRows[leader])
    }
  }
  return {
    costMatrix: costMatrix,
    expandedLeaderRows: expandedLeaderRows
  }
}

function getCostToAssign(staffRow, leaderRow) { // staffRow (rows) is people, leaderRow (columns) is treated as task in Munkres problem
  // Define function to get cost of assigning staff to leader
  /* 
    Cost Schema: 
    5 if RL / Coach (in first 2 schedulings)
    5 if in last 3 schedulings
    3 if in last 12 schedulings
    1 if previously scheduled at all (although older than 12 schedulings)
    */
  staffMatchHistory = staffRow.alreadyMatched

// last 2 months (check for RL / Coach)
  if (staffMatchHistory.slice(0, 2).includes(leaderRow.email)) {
    return 5
  } else if (staffMatchHistory.slice(-3).includes(leaderRow.email)) {
    return 5
  } else if (staffMatchHistory.slice(-12).includes(leaderRow.email)) {
    return 3
  } else if (staffMatchHistory.slice(0, -12).includes(leaderRow.email)) {
    return 1
  } else {
    return 0
  }
}
