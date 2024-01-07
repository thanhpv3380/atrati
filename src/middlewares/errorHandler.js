const camelcaseKeys = require('camelcase-keys');
const codes = require('../errors/code');
const getErrorMessage = require('../errors/message');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.code || err.statusCode;
  let { message } = err;
  let details;

  const code = err.code || err.statusCode || codes.INTERNAL_SERVER_ERROR;
  switch (code) {
    case codes.BAD_REQUEST:
      message = message || 'Bad Request';
      details = err.details;
      break;
    case codes.UNAUTHORIZED:
      message = 'Unauthorized';
      break;
    case codes.FORBIDDEN:
      message = 'Forbidden';
      break;
    case codes.NOT_FOUND:
      message = 'Not Found';
      break;
    case codes.TOO_MANY_REQUESTS:
      message = 'Too many requests';
      break;
    case codes.INTERNAL_SERVER_ERROR:
      statusCode = codes.INTERNAL_SERVER_ERROR;
      message = message || 'Something went wrong';
      break;
    default:
      message = message || getErrorMessage(code);
      statusCode = codes.BAD_REQUEST;
      details = err.details;
  }

  const { requestId, requestTime, method, url } = req;
  const responseTime = new Date().getTime();
  const tookTime = responseTime - requestTime;

  const errorData = camelcaseKeys(
    { status: 0, code, message, messageParams: details },
    { deep: true },
  );

  logger.info(
    `[RESPONSE][${method}][${url}] status: FAILED - statusCode: ${statusCode} - data: ${JSON.stringify(
      errorData,
    )} - took: ${tookTime}`,
    requestId,
  );

  return res.status(statusCode).send(errorData);
};

module.exports = errorHandler;
