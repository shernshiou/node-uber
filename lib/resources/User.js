function User(uber) {
  this._uber = uber;
  this.path = '';
}

module.exports = User;

User.prototype.history = function (access_token, callback) {
  return this._uber.get({ url: 'history', params: query }, callback);
};

User.prototype.profile = function (access_token, callback) {
  var accessToken = '';
  if (typeof access_token === 'function') {
    callback = access_token;
    accessToken = this._uber.access_token;
  } else {
    accessToken = access_token;
  }

  if (!accessToken) {
    callback(new Error('Invalid access token'));
    return this;
  }

  return this._uber.get({ url: 'me', params: '', access_token: accessToken }, callback);
};