var util = require('util');

var RateLimitError = function(message, extra) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.extra = extra;
};

util.inherits(RateLimitError, Error);

module.exports = RateLimitError;
