"use strict";

const util = require('util');

function Requests(uber) {
  this._uber = uber;
  this.path = 'requests';
}

module.exports = Requests;

Requests.prototype.createRequest = function createRequest(parameters, callback) {
  if (!parameters || !parameters === '') {
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
  return Requests.prototype.getRequestByID('current', callback);
};

Requests.prototype.getRequestByID = function getRequestByID(id, callback) {
  const accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }

  if (!id || id === '') {
    return callback(new Error('Invalid request_id'));
  }

  return this._uber.get({ url: `${this.path}/${id}`, access_token: accessToken }, callback);
};

Requests.prototype.getRequestMapByID = function getRequestMapByID(id, callback) {
  const accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }

  if (!id || id === '') {
    return callback(new Error('Invalid request_id'));
  }

  return this._uber.get({ url: `${this.path}/${id}/map`, access_token: accessToken }, callback);
};

Requests.prototype.getRequestReceiptByID = function getRequestReceiptByID(id, callback) {
  const accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }

  if (!id || id === '') {
    return callback(new Error('Invalid request_id'));
  }

  return this._uber.get({ url: `${this.path}/${id}/receipt`, access_token: accessToken }, callback);
};

Requests.prototype.updateCurrentRequest = function updateCurrentRequest(parameters, callback) {
  const accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }

  return Requests.prototype.updateRequestByID('current', parameters, callback);
};

Requests.prototype.updateRequestByID = function updateRequestByID(id, parameters, callback) {
  const accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }

  if (!id || id === '') {
    return callback(new Error('Invalid request_id'));
  }

  return this._uber.patch({ url: `${this.path}/${id}`,
    params: parameters,
    access_token: accessToken }, callback);
};

Requests.prototype.deleteCurrentRequest = function deleteCurrentRequest(callback) {
  const accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }
  return Requests.prototype.deleteRequestByID('current', callback);
};

Requests.prototype.deleteRequestByID = function deleteRequestByID(id, callback) {
  const accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }

  if (!id || id === '') {
    return callback(new Error('Invalid request_id'));
  }

  return this._uber.delete({ url: `${this.path}/${id}`, access_token: accessToken }, callback);
};

Requests.prototype.getEstimates = function getEstimates(parameters, callback) {
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
  return Requests.prototype.getEstimates(parameters, callback);
}, '`requests.estimate` is deprecated. Please use ' +
    '`requests.getEstimates` instead.');
