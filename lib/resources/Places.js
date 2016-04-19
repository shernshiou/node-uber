"use strict";

const util = require('util');

function Places(uber) {
  this._uber = uber;
  this.path = 'places';
}

module.exports = Places;

Places.prototype.getHome = function getHome(callback) {
  const accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }

  const options = {
    url: `${this.path}/home`,
    access_token: accessToken,
  };

  return this._uber.get(options, callback);
};

Places.prototype.getWork = function getWork(callback) {
  const accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }

  const options = { url: `${this.path}/work`, access_token: accessToken };
  return this._uber.get(options, callback);
};

// deprecated
Places.prototype.home = util.deprecate(function home(callback) {
  Places.prototype.getHome(callback);
}, '`places.home` is deprecated. Please use `places.getHome` instead.');

// deprecated
Places.prototype.work = util.deprecate(function work(callback) {
  Places.prototype.getWork(callback);
}, '`places.work` is deprecated. Please use `places.getWork` instead.');
