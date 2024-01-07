const axios = require('axios');
const axios2curl = require('@thanhpv3380/axios2curl');
const { generateUUID } = require('./string');

axios2curl(axios, (result) => {
  const { command } = result;
  const headers = result?.object?.request || {};
  const { thirdPartyRequestId, requestId } = headers;

  logger.info(`[3RD][${thirdPartyRequestId}][REQUEST][CALL_API][CURL=${command}]`, requestId);
});

const callApi = async ({ url, method, headers = {}, body, params, timeout }, requestId) => {
  const thirdPartyRequestId = generateUUID();

  try {
    logger.info(
      `[3RD][${thirdPartyRequestId}][REQUEST][CALL_API][URL=${url}][METHOD=${method}]`,
      requestId,
    );

    const t1 = new Date().getTime();

    const options = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      requestId,
      thirdPartyRequestId,
    };
    if (body && Object.keys(body).length > 0) options.data = body;
    if (params && Object.keys(params).length > 0) options.params = params;
    if (timeout) options.timeout = timeout;

    const { data } = await axios(options);
    const t2 = new Date().getTime();

    const logDataRes = (data && JSON.stringify(data)) || '';
    const tookTime = t2 - t1;
    logger.info(
      `[3RD][${thirdPartyRequestId}][RESPONSE][CALL_API] status: SUCCESS - data: ${logDataRes} - took=${tookTime}ms`,
      requestId,
    );

    return data;
  } catch (err) {
    const { response } = err;

    const logErrorDataRes = response?.data;
    logger.error(
      `[3RD][${thirdPartyRequestId}][RESPONSE][CALL_API] status: FAILED - error: ${
        err.message
      } - detail: ${logErrorDataRes ? JSON.stringify(logErrorDataRes) : JSON.stringify(err)}`,
      requestId,
    );

    throw err;
  }
};

module.exports = { callApi };
