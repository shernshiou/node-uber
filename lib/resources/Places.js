"use strict";

const util = require('util');

function Places(uber) {
  this._uber = uber;
  this.path = 'places';
}

module.exports = Places;

Places.prototype.getByID = function getByID(id, callback) {
  const accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }

  if (!id || id === '') {
    return callback(new Error('Invalid place_id'));
  }

  const options = {
    url: `${this.path}/${id}`,
    access_token: accessToken,
  };

  return this._uber.get(options, callback);
};

Places.prototype.getHome = function getHome(callback) {
  return Places.prototype.getByID('home', callback);
};

Places.prototype.getWork = function getWork(callback) {
  return Places.prototype.getByID('work', callback);
};

Places.prototype.updatePlaceByID = function updatePlaceByID(id, newAddress, callback) {
  const accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }

  if (!id || id === '') {
    return callback(new Error('Invalid place_id'));
  }

  if (!newAddress || newAddress === '') {
    return callback(new Error('Invalid address'));
  }

  return this._uber.put({ url: `${this.path}/${id}`,
    params: { address: newAddress },
    access_token: accessToken }, callback);
};

// deprecated
Places.prototype.home = util.deprecate(function home(callback) {
  Places.prototype.getHome(callback);
}, '`places.home` is deprecated. Please use `places.getHome` instead.');

// deprecated
Places.prototype.work = util.deprecate(function work(callback) {
  Places.prototype.getWork(callback);
}, '`places.work` is deprecated. Please use `places.getWork` instead.');
