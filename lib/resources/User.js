var util = require('util');

function User(uber) {
  this._uber = uber;
  this.path = '';
}

module.exports = User;

User.prototype.getHistory = function getHistory(off, lim, access_token, callback) {
  var ver = 'v1.2';
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

  var newOffset = off || 0;
  // ensure query limit is set. Maximum is 50. Default is 5.
  var newLimit = (lim) ? Math.min(lim, 50) : 5;


  return this._uber.get({
    url: 'history',
    version: ver,
    params: { offset: newOffset, limit: newLimit },
    access_token: accessToken,
  }, callback);
};

User.prototype.getProfile = function getProfile(access_token, callback) {
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

  return this._uber.get({ url: 'me', access_token: accessToken }, callback);
};

// deprecated
User.prototype.activity = util.deprecate(function activity(query, access_token, callback) {
  if(!query) {
    query = { offset: null, limit: null };
  }
  return this.getHistory(query.offset, query.limit, access_token, callback);
}, '`user.activity` is deprecated. Please use `user.getHistory` instead.');

// deprecated
User.prototype.profile = util.deprecate(function profile(access_token, callback) {
  return this.getProfile(access_token, callback);
}, '`user.profile` is deprecated. Please use `user.getProfile` instead.');
