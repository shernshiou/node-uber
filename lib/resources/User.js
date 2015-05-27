function User(uber) {
  this._uber = uber;
  this.path = '';
}

module.exports = User;

User.prototype.activity = function (query, callback) {
  var version = 'v1.2'
    , accessToken = '';

  if (!query.access_token) {
    accessToken = this._uber.access_token;
  } else {
    accessToken = query.access_token;
  }

  if (!query.offset) {
    query.offset = 0
  }

  if (!query.limit) {
    query.limit = 5;
  }

  query.limit = Math.max(query.limit, 50);

  if (!accessToken) {
    callback(new Error('Invalid access token'));
    return this;
  }

  delete query.access_token;

  return this._uber.get({ 
    url: 'history' , 
    version: version,
    params: query,
    access_token: accessToken 
  }, callback);
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