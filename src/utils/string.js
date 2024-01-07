const { v4: uuidv4 } = require('uuid');

const punctuatify = (string) => {
  return string.replace(/[^\w@.,\s]/g, '').replace(/\s{2,}/g, ' ');
};

const slugify = (string) => {
  return string
    .toLowerCase()
    .replace(/\s+/g, '_') // Replace spaces with _
    .replace(/[^\w@.,]+/g, '') // Remove all non-word chars, accept @
    .replace(/__+/g, '_') // Replace multiple _ with single _
    .replace(/^_+/, '') // Trim - from start of text
    .replace(/_+$/, ''); // Trim - from end of text
};

const nonAccentVietnamese = (string) => {
  return (
    string
      .toLowerCase()
      .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
      .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
      .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
      .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
      .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
      .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
      .replace(/đ/g, 'd')
      // Some system encode vietnamese combining accent as individual utf-8 characters
      .replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '') // Huyền sắc hỏi ngã nặng
      .replace(/\u02C6|\u0306|\u031B/g, '') // Â, Ê, Ă, Ơ, Ư
  );
};

const slugifyVietnamese = (string) => {
  return slugify(punctuatify(nonAccentVietnamese(string)));
};

const lastIndexOfRegex = (search, regex, fromIndex = 0) => {
  const string = fromIndex ? search.substring(0, fromIndex) : search;
  const match = string.match(regex);

  return match ? string.lastIndexOf(match[match.length - 1]) : -1;
};

const generateOTP = (totalChar = 6) => {
  let otp = '';

  let currentTotalChar = 1;
  while (currentTotalChar <= totalChar) {
    otp += Math.floor(Math.random() * 10);
    currentTotalChar += 1;
  }

  return otp;
};

const fillDataToText = (text, data) => {
  let textReplaced = text;

  for (const key of Object.keys(data)) {
    const regex = new RegExp(`@{{${key}}}`, 'gi');
    textReplaced = textReplaced.replace(regex, data[key]);
  }

  return textReplaced;
};

const replaceField = ({ text, fieldsToReplace, replaceText }) => {
  for (const field of fieldsToReplace) {
    const regex = new RegExp(`"${field}"\\s*:\\s*"[^"]*"`, 'g');
    text = text.replace(regex, `"${field}": ${replaceText}`);
  }

  return text;
};

const generateUUID = () => uuidv4();

module.exports = {
  slugifyVietnamese,
  lastIndexOfRegex,
  generateOTP,
  fillDataToText,
  replaceField,
  generateUUID,
};
