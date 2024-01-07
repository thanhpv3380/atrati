const asyncMiddleware =
  (...fns) =>
  async (req, res, next) => {
    try {
      req.hasUri = true;

      for (const fn of fns) {
        await fn(req, res, next);
      }
    } catch (error) {
      next(error);
    }
  };

const asyncResponse =
  (...fns) =>
  async (req, res, next) => {
    try {
      req.hasUri = true;

      let result;
      for (const fn of fns) {
        result = await fn(req, res, next);
      }

      res.data = result;
      next();
    } catch (error) {
      next(error);
    }
  };

module.exports = { asyncMiddleware, asyncResponse };
