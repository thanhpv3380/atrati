const errorCodes = require('./code');

const getErrorMessage = (code) => {
  const errorMessage = Object.keys(errorCodes).find((key) => errorCodes[key] === code);
  return errorMessage;
};

module.exports = getErrorMessage;
