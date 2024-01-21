const errorCodes = require('./code');

const errorMessages = {
  [errorCodes.USER_NOT_FOUND]: 'User not found',
  [errorCodes.FEATURE_NOT_ACTIVE]: 'Feature not active',
  [errorCodes.MESSAGE_INVALID]: 'Message invalid',
  [errorCodes.MESSAGE_PARAM_INVALID]: 'Message param invalid',
  [errorCodes.UNAUTHORIZED]: 'Unauthorized',
};

const getErrorMessage = (code) => errorMessages[code];

module.exports = getErrorMessage;
