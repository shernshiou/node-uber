function Places(uber) {
  this._uber = uber;
  this.path = 'places';
}

module.exports = Places;

Places.prototype.home = function (callback) {
  var accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }

var options = {
  url: this.path + '/home',
  access_token: accessToken
};
return this._uber.get(options, callback);
};

Places.prototype.work = function (callback) {
  var accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }

  var options = { url: this.path + '/work', access_token: accessToken };
  return this._uber.get(options, callback);
};
