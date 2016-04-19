"use strict";

const util = require('util');

function Estimates(uber) {
  this._uber = uber;
  this.path = 'estimates';
}

module.exports = Estimates;

Estimates.prototype.getPriceForRoute = function getPriceForRoute(query, callback) {
  if (!query.start_latitude && !query.start_longitude &&
      !query.end_latitude && !query.end_longitude) {
    return callback(new Error('Invalid parameters'));
  }

  return this._uber.get({ url: `${this.path}/price`, params: query }, callback);
};

Estimates.prototype.getETAForLocation = function getETAForLocation(query, callback) {
  if (!query.start_latitude && !query.start_longitude) {
    return callback(new Error('Invalid parameters'));
  }

  return this._uber.get({ url: `${this.path}/time`, params: query }, callback);
};

// deprecated
Estimates.prototype.price = util.deprecate(function price(query, callback) {
  return Estimates.prototype.getPriceForRoute(query, callback);
}, '`estimates.price` is deprecated. Please use `estimates.getPriceForRoute` instead.');

// deprecated
Estimates.prototype.time = util.deprecate(function time(query, callback) {
  return Estimates.prototype.getETAForLocation(query, callback);
}, '`estimates.time` is deprecated. Please use `estimates.getETAForLocation` instead.');
