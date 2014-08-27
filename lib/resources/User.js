function User(uber) {
  this._uber = uber;
  this.path = '';
}

module.exports = User;

User.prototype.history = function (query, callback) {
  return this._uber.get({ url: 'history', params: query }, callback);
};

User.prototype.profile = function (options, callback) {
  var query = {};
  if (typeof options === 'function') {
    callback = options;
    query['access_token'] = this._uber.access_token;
  } else {
    query['access_token'] = options.access_token;
  }

  if (!query.access_token) {
    callback(new Error('Invalid access token'));
    return this;
  }

  return this._uber.get({ url: 'me', params: query }, callback);
};