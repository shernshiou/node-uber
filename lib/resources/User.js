"use strict";

const util = require('util');

function User(uber) {
  this._uber = uber;
  this.path = '';
}

module.exports = User;

User.prototype.getHistory = function getHistory(off, lim, callback) {
  const ver = 'v1.2';
  const accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }

  const newOffset = off || 0;
  // ensure query limit is set. Maximum is 50. Default is 5.
  const newLimit = (lim) ? Math.max(lim, 50) : 5;


  return this._uber.get({
    url: 'history',
    version: ver,
    params: { offset: newOffset, limit: newLimit },
    access_token: accessToken,
  }, callback);
};

User.prototype.getProfile = function getProfile(callback) {
  const accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }

  return this._uber.get({ url: 'me', access_token: accessToken }, callback);
};

// deprecated
User.prototype.activity = util.deprecate(function activity(query, callback) {
  return User.prototype.getHistory(query.offset, query.limit, callback);
}, '`user.activity` is deprecated. Please use `user.getHistory` instead.');

// deprecated
User.prototype.profile = util.deprecate(function profile(query, callback) {
  return User.prototype.getProfile(callback);
}, '`user.profile` is deprecated. Please use `user.getProfile` instead.');
