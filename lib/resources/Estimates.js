var util = require('util');

function Estimates(uber) {
  this._uber = uber;
  this.path = 'estimates';
}

module.exports = Estimates;

Estimates.prototype.getPriceForRoute = function getPriceForRoute(startLat,
  startLon, endLat, endLon, callback) {
  if (!startLat || !startLon || !this._uber.validateCoordinates(startLat, startLon)) {
    return callback(new Error('Invalid starting point latitude & longitude'));
  }

  if (!endLat || !endLon || !this._uber.validateCoordinates(endLat, endLon)) {
    return callback(new Error('Invalid ending point latitude & longitude'));
  }

  return this._uber.get({ url: `${this.path}/price`, params: {
    start_latitude: startLat,
    start_longitude: startLon,
    end_latitude: endLat,
    end_longitude: endLon,
  } }, callback);
};

Estimates.prototype.getETAForLocation = function getETAForLocation(lat, lon, id, callback) {
  if (!lat || !lon || !this._uber.validateCoordinates(lat, lon)) {
    return callback(new Error('Invalid latitude & longitude'));
  }

  // add optional product_id in case it's set
  var par = (id && id !== '') ?
    { start_latitude: lat, start_longitude: lon, product_id: id } :
    { start_latitude: lat, start_longitude: lon };

  return this._uber.get({ url: `${this.path}/time`,
    params: par }, callback);
};

// deprecated
Estimates.prototype.price = util.deprecate(function price(query, callback) {
  return Estimates.prototype.getPriceForRoute(query.start_latitude,
    query.start_longitude,
    query.end_latitude,
    query.end_longitude,
    callback);
}, '`estimates.price` is deprecated. Please use `estimates.getPriceForRoute` instead.');

// deprecated
Estimates.prototype.time = util.deprecate(function time(query, callback) {
  return Estimates.prototype.getETAForLocation(
    query.start_latitude,
    query.start_longitude,
    query.product_id,
    callback);
}, '`estimates.time` is deprecated. Please use `estimates.getETAForLocation` instead.');
