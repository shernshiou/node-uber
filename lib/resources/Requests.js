"use strict";

const util = require('util');

function Requests(uber) {
  this._uber = uber;
  this.path = 'requests';
}

module.exports = Requests;

Requests.prototype.createRequest = function createRequest(parameters, callback) {
  if (!parameters.start_latitude || !parameters.start_longitude || !parameters.product_id) {
    return callback(new Error('Invalid parameters'));
  }

  const accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }

  return this._uber.post({ url: this.path,
    params: parameters,
    access_token: accessToken }, callback);
};

Requests.prototype.getCurrentRequest = function getCurrentRequest(callback) {
  const accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }
  return this._uber.get({ url: `${this.path}/current`, access_token: accessToken }, callback);
};

Requests.prototype.updateCurrentRequest = function updateCurrentRequest(parameters, callback) {
  const accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }
  return this._uber.patch({ url: `${this.path}/current`,
    params: parameters,
    access_token: accessToken }, callback);
};

Requests.prototype.deleteCurrentRequest = function deleteCurrentRequest(callback) {
  const accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }
  return this._uber.delete({ url: `${this.path}/current`, access_token: accessToken }, callback);
};

Requests.prototype.getEstimatesForCurrentRequest = function getEstimatesForCurrentRequest(parameters, callback) {
  const accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }
  return this._uber.post({
    url: `${this.path}/estimate`,
    params: parameters,
    access_token: accessToken }, callback);
};

// deprecated
Requests.prototype.requestRide = util.deprecate(function requestRide(parameters, callback) {
  return Requests.prototype.createRequest(parameters, callback);
}, '`requests.requestRide` is deprecated. Please use `requestRide.createRequest` instead.');

// deprecated
Requests.prototype.estimate = util.deprecate(function estimate(parameters, callback) {
  return Requests.prototype.getEstimatesForCurrentRequest(parameters, callback);
}, '`requests.estimate` is deprecated. Please use ' +
    '`requests.getEstimatesForCurrentRequest` instead.');
