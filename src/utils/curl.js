const getHeaders = (headers, method) => {
  let curlHeaders = '';

  // eslint-disable-next-line no-prototype-builtins
  if (headers.hasOwnProperty('common')) {
    headers = headers[method];
  }

  // add any custom headers (defined upon calling methods like .get(), .post(), etc.)
  for (const property in headers) {
    if (!['common', 'delete', 'get', 'head', 'patch', 'post', 'put'].includes(property)) {
      // eslint-disable-next-line no-self-assign
      headers[property] = headers[property];
    }
  }

  for (const property of Object.keys(headers)) {
    const header = `${property}:${headers[property]}`;
    curlHeaders = `${curlHeaders} -H "${header}"`;
  }

  return curlHeaders.trim();
};

const getMethod = (method) => {
  return `-X ${method.toUpperCase()}`;
};

const getBody = (body) => {
  if (typeof body !== 'undefined' && body !== '' && body !== null) {
    const data =
      typeof body === 'object' || Object.prototype.toString.call(body) === '[object Array]'
        ? JSON.stringify(body)
        : body;
    return `--data '${data}'`.trim();
  }
  return '';
};

const getUrl = (baseURL, url) => {
  if (baseURL) return `${baseURL}/${url}`;
  return url;
};

const getQueryString = (params) => {
  let paramsStr = '';
  let i = 0;

  for (const param of Object.keys(params)) {
    paramsStr += i !== 0 ? `&${param}=${params[param]}` : `?${param}=${params[param]}`;
    i += 1;
  }

  return paramsStr;
};

const getBuiltURL = (baseURL, url, params) => {
  url = getUrl(baseURL, url);

  if (getQueryString(params) !== '') {
    url = url.charAt(url.length - 1) === '/' ? url.substr(0, url.length - 1) : url;
    url += getQueryString(params);
  }

  return url.trim();
};

const generateCommand = ({ baseURL, url, method, headers, data, params }) => {
  return `curl ${getMethod(method)} ${getHeaders(headers, method)} ${getBody(data)} "${getBuiltURL(
    baseURL,
    url,
    params,
  )}"`
    .trim()
    .replace(/\s{2,}/g, ' ');
};

module.exports = { generateCommand };
