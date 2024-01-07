const bcrypt = require('bcrypt');

const generateSalt = (rounds) => {
  return bcrypt.genSaltSync(rounds);
};

const hashBcrypt = (text, salt) => {
  const hashedBcrypt = new Promise((resolve, reject) => {
    bcrypt.hash(text, salt, (err, hash) => {
      if (err) reject(err);
      resolve(hash);
    });
  });
  return hashedBcrypt;
};

const compareBcrypt = async (data, hashed) => {
  const isCorrect = await new Promise((resolve, reject) => {
    bcrypt.compare(data, hashed, (err, same) => {
      if (err) reject(err);
      resolve(same);
    });
  });
  return isCorrect;
};

const hashPassword = async (password) => {
  const salt = generateSalt(10);
  const passwordHashed = await hashBcrypt(password, salt);
  return passwordHashed;
};

module.exports = { hashPassword, compareBcrypt };
