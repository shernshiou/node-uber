var util = require('util');

function User(uber) {
  this._uber = uber;
  this.path = '';
}

module.exports = User;

User.prototype.getHistory = function getHistory(off, lim, callback) {
  var newOffset = off || 0;
  // ensure query limit is set. Maximum is 50. Default is 5.
  var newLimit = (lim) ? Math.min(lim, 50) : 5;

  return this._uber.get({
    url: 'history',
    version: 'v1.2',
    params: { offset: newOffset, limit: newLimit }
  }, callback);
};

User.prototype.getProfile = function getProfile(callback) {
  return this._uber.get({ url: 'me'}, callback);
};

// deprecated
User.prototype.activity = util.deprecate(function activity(query, access_token, callback) {
  if(!query) {
    query = { offset: null, limit: null };
  }
  return this.getHistory(query.offset, query.limit, callback);
}, '`user.activity` is deprecated. Please use `user.getHistory` instead.');

// deprecated
User.prototype.profile = util.deprecate(function profile(access_token, callback) {
  return this.getProfile(callback);
}, '`user.profile` is deprecated. Please use `user.getProfile` instead.');
