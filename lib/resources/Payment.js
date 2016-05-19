var util = require('util');

function Payment(uber) {
  this._uber = uber;
  this.path = 'payment';
}

module.exports = Payment;

Payment.prototype.getMethods = function getMethods(callback) {
  return this._uber.get({url: 'payment-methods'}, callback);
};

// deprecated
Payment.prototype.methods = util.deprecate(function methods(callback) {
  return this.getMethods(callback);
}, '`payment.methods` is deprecated. Please use `payments.getMethods` instead.');
