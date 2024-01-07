const { lastIndexOfRegex } = require('./string');

const formatNumber = (value, defaultValue) => {
  // eslint-disable-next-line no-restricted-globals
  return value && !isNaN(value) ? parseInt(value, 10) : defaultValue;
};

const formatNumberCurrency = (value) => {
  return value
    .toString()
    .replace(/(,|\.)/g, '')
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
};

const formatNumberWithLastSeparator = (value) => {
  const lastIndexOfSeparator = lastIndexOfRegex(value, new RegExp(/,|\./g));
  const number = value.substring(0, lastIndexOfSeparator).replace(/\.|,/g, '');

  return formatNumberCurrency(number);
};

module.exports = {
  formatNumber,
  formatNumberCurrency,
  formatNumberWithLastSeparator,
};
