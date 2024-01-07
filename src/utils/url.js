const addParamsToUrl = ({ url, params }) => {
  if (!url) return '';

  const paramsHandled = [];
  for (const key of Object.keys(params)) {
    paramsHandled.push(`${key}=${params[key]}`);
  }
  const newParams = paramsHandled.join('&');

  if (url.indexOf('?') === -1) {
    url += `?${newParams}`;
  } else {
    url += `&${newParams}`;
  }

  return url;
};

module.exports = { addParamsToUrl };
