const messageService = require('../services/message');

const receiveMessage = async (req) => messageService.receiveMessage(req.body);

module.exports = {
  receiveMessage,
};
