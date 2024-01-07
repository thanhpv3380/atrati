const CustomError = require('../errors/CustomError');
const errorCodes = require('../errors/code');

const authService = require('../services/auth');
const userService = require('../services/user');

const auth = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) throw new CustomError(errorCodes.UNAUTHORIZED);

  const [tokenType, accessToken] = authorization.split(' ');

  if (tokenType !== 'Bearer' || !accessToken) throw new CustomError(errorCodes.UNAUTHORIZED);
  const user = await authService.verifyAccessToken(accessToken);
  user._id = user._id.toString();

  await userService.checkUserStatus({ user });

  req.user = user;
  req.accessToken = accessToken;

  checkPermissionByRole(req);
  return next();
};

const checkPermissionByRole = () => {
  return true;
};

module.exports = {
  auth,
};
