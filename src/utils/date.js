const moment = require('moment');

const msTimestamp = (timestamp) => {
  if (timestamp.toString().length < 13) {
    return timestamp * 1000;
  }
  return timestamp;
};

const diffTime = (fromTime, toTime, unitOfTime = 'second') => {
  return moment(toTime).diff(moment(fromTime), unitOfTime);
};

const checkFormatDate = (date, format) => {
  return moment(date, format, true).isValid();
};

const splitTimeByType = (startTime, endTime, type) => {
  const items = [];
  startTime = moment(startTime).format();
  endTime = moment(endTime).format();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const endDay = moment(startTime).endOf(type).format();
    if (endDay >= endTime) {
      items.push({ startTime, endTime });
      break;
    }

    items.push({ startTime, endTime: endDay });
    startTime = moment(startTime).add(1, type).startOf(type).format();
  }

  return items;
};

const checkFullDay = (startTime, endTime) => {
  const startDay = moment(startTime).startOf('day').format();
  const endDay = moment(startTime).endOf('day').format();
  if (startDay === startTime && endDay === endTime) return true;
  return false;
};

const getTimeLabels = (item, type) => {
  switch (type) {
    case 'isoWeek':
      return moment(item.startTime).format('WW/YYYY');
    case 'month':
      return moment(item.startTime).format('MM/YYYY');
    case 'day':
      return moment(item.startTime).format('DD/MM/YYYY');
    default:
      return null;
  }
};

const classifyTime = (startTime, endTime) => {
  const days = splitTimeByType(startTime, endTime, 'days');
  const fullDays = [];
  const noFullDays = [];
  days.forEach((day) => {
    if (checkFullDay(day.startTime, day.endTime)) {
      fullDays.push(day);
    } else {
      noFullDays.push(day);
    }
  });
  let seamlessFullDays = {};
  if (fullDays.length > 0) {
    seamlessFullDays.startTime = fullDays[0].startTime;
    seamlessFullDays.endTime = fullDays[fullDays.length - 1].endTime;
  } else {
    seamlessFullDays = null;
  }
  return { seamlessFullDays, noFullDays };
};

const addTime = (time, amount, unitOfTime = 'second') => {
  return moment(time).add(amount, unitOfTime);
};

const toDate = (dateString, format = 'YYYYMMDDHHmmss') => {
  return moment(dateString, format);
};

const dateToString = (date, format = 'YYYYMMDD') => {
  return moment(date).format(format);
};

const getStartDate = (date = new Date(), type = 'day') => {
  return moment(date).startOf(type);
};

const getEndDate = (date = new Date(), type = 'day') => {
  return moment(date).endOf(type);
};

module.exports = {
  msTimestamp,
  diffTime,
  checkFormatDate,
  splitTimeByType,
  checkFullDay,
  getTimeLabels,
  classifyTime,
  addTime,
  toDate,
  dateToString,
  getStartDate,
  getEndDate,
};
