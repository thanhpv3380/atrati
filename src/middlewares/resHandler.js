const mongoose = require('mongoose');
const camelcaseKeys = require('camelcase-keys');

const errorCodes = require('../errors/code');

const { ObjectId } = mongoose.Types;

const hiddenFields = ['password'];

const transformData = (obj) => {
  if (typeof obj !== 'object') {
    return obj;
  }

  // typeof null = object
  if (obj === null) {
    return null;
  }

  // Check if obj is Mongoose Object
  if (obj._doc) {
    return transformData(obj.toJSON());
  }

  if (ObjectId.isValid(obj)) {
    return obj.toString();
  }

  if (Object.prototype.toString.call(obj) === '[object Date]') {
    return obj.getTime();
  }

  Object.keys(obj).forEach((key) => {
    if (hiddenFields.includes(key)) {
      delete obj[key];
    } else {
      obj[key] = transformData(obj[key]);
    }
  });

  if (Array.isArray(obj)) return obj;
  return camelcaseKeys(obj, { deep: true });
};

const resHandler = (req, res, next) => {
  const { data: resData } = res;
  const { requestId, requestTime, hasUri, method, url } = req;
  const responseTime = new Date().getTime();
  const tookTime = responseTime - requestTime;

  if (!hasUri) {
    return next({ statusCode: errorCodes.NOT_FOUND });
  }

  if (resData?.redirect) {
    logger.info(
      `[API][RESPONSE][${method}][${url}] status: SUCCESS - redirectUrl: ${resData.redirect} - took: ${tookTime}ms`,
      requestId,
    );
    return res.redirect(resData.redirect);
  }

  const resDataTransformed = { status: 1, result: transformData(resData) };
  logger.info(
    `[API][RESPONSE][${method}][${url}] status: SUCCESS - data: ${JSON.stringify(
      resDataTransformed,
    )} - took: ${tookTime}ms`,
    requestId,
  );

  return res.json(resDataTransformed);
};

module.exports = resHandler;
