/*
 * Schedule matches for those rows unscheduled
 */
function scheduleMatches(autoSheet, staffRows, prefs) {

  // let startDateBound = new Date(Math.max(prefs['Month'], DateUtils.addDays(new Date(), 1))); // start date is the latter of the month picked and today + 1 day
  // let endDateBound = DateUtils.endOfMonth(startDateBound);
  
  if (!prefs['Start Date Bound']) prefs['Start Date Bound'] = startDateBound;
  if (!prefs['End Date Bound']) prefs['End Date Bound'] = endDateBound;
  
  prefs['Start Date Bound'] = DateUtils.setTime(prefs['Start Date Bound'], prefs['Start Time Bound'], 0, 0, 0);
  prefs['End Date Bound'] = DateUtils.setTime(prefs['End Date Bound'], prefs['End Time Bound'], 0, 0, 0);
  
  var idxOfColumnToWriteTo = autoSheet.getLastColumn()
  
  console.log('Scheduling between ' + prefs['Start Date Bound'] + ' and ' + prefs['End Date Bound']);

  staffRows.forEach(row => {
    const currBg = autoSheet.getRange(DATA_TABLE_START_ROW + row.tableRow, idxOfColumnToWriteTo)
      .getBackground();
    const match = autoSheet.getRange(DATA_TABLE_START_ROW + row.tableRow, idxOfColumnToWriteTo)
      .getValue();
      
    const isScheduled = (currBg == SCHEDULED_SUCCESS) || (currBg == SCHEDULED_MET);
    if (isScheduled) return;
  
    // schedule calendar invite
    const wasScheduled = scheduleInvite([prefs['Calendar Owner'], row.email, match], prefs);
  
    // update shading
    autoSheet.getRange(DATA_TABLE_START_ROW + row.tableRow, idxOfColumnToWriteTo)
      .setBackground(wasScheduled ? SCHEDULED_SUCCESS : SCHEDULED_FAILURE);
  });
}

/*
 * Schedules calendar invite for a match
 */
function scheduleInvite(attendees, prefs) {

  // temporary manual override if enabled
  // attendees = [prefs['Calendar Owner'], 'sanjit.dutta@pwc.com', 'brian.gee@pwc.com', 'william.cobb@pwc.com'];
  
  let wasScheduled = false;

  const availability = seedAvailability(prefs);
  
  try {

    // go through each attendee's calendar
    attendees.forEach(attendee => {
    
      // no need to check availability of calendar owner, just actual attendees
      if (attendee == prefs['Calendar Owner']) return;
    
      CalendarApp.subscribeToCalendar(attendee);
      const calendar = CalendarApp.getCalendarById(attendee);
      
      const events = calendar.getEvents(prefs['Start Date Bound'], prefs['End Date Bound']);
      
      events.forEach(event => {
      
        // mark unavailable any time blocks where attendee's event coincides
        const startTime = DateUtils.floorTime(event.getStartTime(), EVENT_INTERVAL);
        const endTime = DateUtils.ceilTime(event.getEndTime(), EVENT_INTERVAL);
        let timeIterator = new Date(startTime);
        for (timeIterator; timeIterator < endTime; timeIterator = DateUtils.addMinutes(timeIterator, EVENT_INTERVAL)) {
          availability[timeIterator.toISOString()] = false;
        }
        
      });
      
    });
  
  } catch (err) {
  
    console.error(err);
    return wasScheduled;
  
  }
  
  // console.log('availability: ' + JSON.stringify(availability));
  
  if (!SCHEDULING_ENABLED) return wasScheduled;
  
  const availabilityIndices = Object.keys(availability);
  shuffle(availabilityIndices);
  
  // find first available slot (in random order) and schedule event
  for (let index in availabilityIndices) {
  
    const timeslot = availabilityIndices[index];
  
    if (availability[timeslot]) {
      const calendar = CalendarApp.getCalendarById(prefs['Calendar Owner']);
      
      const eventStart = new Date(timeslot);
      const eventEnd = DateUtils.addMinutes(eventStart, EVENT_INTERVAL);
      
      let eventDescription = prefs['Event Description'];
      let prefilledUrl = prefs['Form URL'];
      
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      
      prefilledUrl = prefilledUrl.replace('{month}', monthNames[prefs['Start Date Bound'].getMonth()] + '+' + prefs['Start Date Bound'].getFullYear());
      prefilledUrl = prefilledUrl.replace('{staffEmail}', attendees[1]); // currently first entry is master calendar, second is staff, third is leader
      prefilledUrl = prefilledUrl.replace('{leaderEmail}', attendees[2]);
      
      eventDescription = eventDescription.replace('{formUrl}', prefilledUrl);
      
      const newEvent = calendar.createEvent(prefs['Event Title'], eventStart, eventEnd, {
        description: eventDescription,
        location: prefs['Event Location'],
        guests: attendees.join(),
        sendInvites: SEND_EVENT_INVITE
      });
      
      newEvent.setGuestsCanModify(true);
      
      console.log('Event successfully scheduled at ' + eventStart + ' for ' + attendees.join());
      
      wasScheduled = true;
      break;
    }
    
  }
  
  return wasScheduled;
}

/*
 * Seeds availability dictionary with structure and blocks weekends
 */
function seedAvailability(prefs) {

  const availability = {};

  let dayIterator = new Date(prefs['Start Date Bound']);
  
  // seed availability dictionary
  for (dayIterator; dayIterator < prefs['End Date Bound']; dayIterator = DateUtils.addDays(dayIterator, 1)) {
  
    let timeIterator = new Date(dayIterator);
    const endTimeBound = DateUtils.setTime(dayIterator, prefs['End Time Bound'], 0, 0, 0);
  
    for (timeIterator; timeIterator < endTimeBound; timeIterator = DateUtils.addMinutes(timeIterator, EVENT_INTERVAL)) {
    
      // if weekend, no availability
      availability[timeIterator.toISOString()] = (dayIterator.getDay() % 6 != 0); // 6 and 0 are Saturday and Sunday
      
    }
    
  }
  
  return availability;
}
