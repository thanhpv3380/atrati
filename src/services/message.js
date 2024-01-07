const zaloMessageDao = require('../daos/zaloMessage');

const receiveMessage = async (data) => {
  await zaloMessageDao.createZaloMessage({ rawMessage: data });
  return { message: 'success' };
};

module.exports = {
  receiveMessage,
};
