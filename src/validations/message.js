const { Joi } = require('express-validation');
const { customValidate } = require('./common');

const receiveMessage = {
  body: Joi.object({
    message: Joi.string().trim().required(),
  }),
};

module.exports = {
  receiveMessage: customValidate(receiveMessage, { keyByField: true }),
};
