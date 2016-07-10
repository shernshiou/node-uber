var util = require('util');

var CustomError = function RateLimitError(message, extra) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.extra = extra;
};

util.inherits(CustomError, Error);

module.exports = CustomError;
