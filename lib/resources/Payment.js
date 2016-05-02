var util = require('util');

function Payment(uber) {
  this._uber = uber;
  this.path = 'payment';
}

module.exports = Payment;

Payment.prototype.getMethods = function getMethods(callback) {
  var accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }

  var options = {
    url: 'payment-methods',
    access_token: accessToken
  };
  return this._uber.get(options, callback);
};

// deprecated
Payment.prototype.methods = util.deprecate(function methods(callback) {
  return this.getMethods(callback);
}, '`payment.methods` is deprecated. Please use `payments.getMethods` instead.');
