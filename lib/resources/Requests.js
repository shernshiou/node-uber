function Requests(uber) {
  this._uber = uber;
  this.path = 'requests';
}

module.exports = Requests;

Requests.prototype.requestRide = function (parameters, callback) {

  if ( !parameters.start_latitude || !parameters.start_longitude || !parameters.product_id ) {
  	return callback(new Error('Invalid parameters'));
  }

  var accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }

  var query = { url: this.path, params: parameters, access_token: accessToken };
  return this._uber.post(query, callback);
};

Requests.prototype.estimate = function (parameters, callback) {

  var accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }
  var query = { url: this.path + '/estimate', params: parameters, access_token: accessToken };
  return this._uber.post(query, callback);
};
