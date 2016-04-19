"use strict";

const util = require('util');

function User(uber) {
  this._uber = uber;
  this.path = '';
}

module.exports = User;

User.prototype.getHistory = function getHistory(query, callback) {
  const version = 'v1.2';
  let accessToken = '';

  accessToken = (query.access_token) ? query.access_token : this._uber.access_token;
  query.offset = (query.offset) ? query.offset : 0;
  // ensure query limit is set. Maximum is 50. Default is 5.
  query.limit = (query.limit) ? Math.max(query.limit, 50) : 5;

  if (!accessToken) {
    callback(new Error('Invalid access token'));
    return this;
  }

  delete query.access_token;

  return this._uber.get({
    url: 'history',
    version: version,
    params: query,
    access_token: accessToken,
  }, callback);
};

User.prototype.getProfile = function getProfile(access_token, callback) {
  let accessToken = '';
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

// deprecated
User.prototype.activity = util.deprecate(function activity(query, callback) {
  return User.prototype.getHistory(query, callback);
}, '`user.activity` is deprecated. Please use `user.getHistory` instead.');

// deprecated
User.prototype.profile = util.deprecate(function profile(query, callback) {
  return User.prototype.getProfile(query, callback);
}, '`user.profile` is deprecated. Please use `user.getProfile` instead.');
