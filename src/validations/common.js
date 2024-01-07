const { Joi, validate } = require('express-validation');

const { PAGE_NUMBER_DEFAULT, PAGE_SIZE_DEFAULT } = require('../configs');
const { REGEX } = require('../constants');

const validateOptionsDefault = {
  context: true,
  keyByField: true,
};

const joiPagination = {
  page: Joi.number().integer().min(1).default(PAGE_NUMBER_DEFAULT),
  limit: Joi.number().integer().min(1).default(PAGE_SIZE_DEFAULT),
  hasPagination: Joi.boolean().default(true),
};

const customValidate = (schema, options, joiOptions) => {
  return validate(schema, { ...validateOptionsDefault, ...options }, joiOptions);
};

const passwordValidate = Joi.string().trim().pattern(REGEX.PASSWORD).required().messages({
  'string.pattern.base':
    'Password must contain at least 8 characters and include uppercase letters, lowercase letters, numbers and special characters',
});

const dobValidate = Joi.string().trim().pattern(REGEX.DOB).messages({
  'string.pattern.base': 'dob format with DD/MM/YYYY',
});

module.exports = {
  joiPagination,
  customValidate,
  passwordValidate,
  dobValidate,
};
