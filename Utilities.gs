/* **************************************************************************************************************************************************************************
 * ***************************************************************************** UTILITIES **********************************************************************************
 * ************************************************************************************************************************************************************************** */

/*
 * Date manipulation utilities
 */
class DateUtils {
  /*
   * Date difference in months
   */
  static monthDiff(dateFrom, dateTo) {
   return dateTo.getMonth() - dateFrom.getMonth() + (12 * (dateTo.getFullYear() - dateFrom.getFullYear()));
  }
  
  /*
   * Return new date with X days added to original date
   */
  static addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }
  
  /*
   * Return new date with X minutes added to original date
   */
  static addMinutes(date, minutes) {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() + minutes);
    return d;
  }
  
  /*
   * Return last day of the month of original date
   */
  static endOfMonth(date) {
    const d = new Date();
    d.setFullYear(date.getFullYear(), date.getMonth() + 1, 0);
    return d;
  }
  
  /*
   * Return date with new time set
   */
  static setTime(date, hour, minute, second, millis) {
    const d = new Date(date);
    d.setHours(hour);
    d.setMinutes(minute);
    d.setSeconds(second);
    d.setMilliseconds(millis);
    return d;
  }
  
  /*
   * Return new date with time floored
   * 60 must be divisible by precision (in minutes)
   */
  static floorTime(date, precision) {
    const d = new Date(date);
    d.setMinutes(Math.floor(d.getMinutes() / precision) * precision);
    return d;
  }
  
  /*
   * Return new date with time ceilinged
   * 60 must be divisible by precision (in minutes)
   */
  static ceilTime(date, precision) {
    const d = new Date(date);
    d.setMinutes(Math.ceil(d.getMinutes() / precision) * precision);
    return d;
  }
  
}

/*
 * Gets the column offset based on the date
 */
function getMonthOffset(autoSheet, matchingDate) {

  let offset = -1;

  const month = matchingDate.getMonth();
  const year = matchingDate.getFullYear();
  
  const tableColLength = autoSheet.getLastColumn();
  
  const headers = autoSheet.getRange(DATA_TABLE_START_ROW - 1, DATA_TABLE_START_COL, 1, tableColLength).getValues();
  
  for (let i = 0; i < headers[0].length; i++) {
  
    if (headers[0][i] instanceof Date) headers[0][i] = DateUtils.setTime(headers[0][i], 32, 0, 0, 0); // adjust the time... weird timezone issues  
    if (headers[0][i] instanceof Date && headers[0][i].getMonth() == month && headers[0][i].getFullYear() == year) {
      offset = i - DATA_TABLE_FIRST_MONTH_COL;
      break;
    }
  }
  
  if (offset < 0) throw 'Matching month from preferences not found!';
  return offset;
}

// Fisher-Yates shuffle algorithm
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
    // swap elements array[i] and array[j]
    // we use "destructuring assignment" syntax to achieve that
    // same can be written as:
    // let t = array[i]; array[i] = array[j]; array[j] = t
    [array[i], array[j]] = [array[j], array[i]];
  }
}
