const userService = require('../services/user');

const getUsers = async (req) => userService.getUsers(req.query);

module.exports = {
  getUsers,
};
