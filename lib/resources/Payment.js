function Payment(uber) {
  this._uber = uber;
  this.path = 'payment';
}

module.exports = Payment;

Payment.prototype.methods = function(callback) {
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
