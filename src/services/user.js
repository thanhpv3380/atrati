const userDao = require('../daos/user');

const getUsers = async (query) => {
  return userDao.findUsers(query);
};

module.exports = {
  getUsers,
};
