class CustomError extends Error {
  constructor(code, details, ...args) {
    super(...args);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
    this.code = code;
    this.details = details || {};
  }
}

module.exports = CustomError;
