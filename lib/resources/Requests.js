var util = require('util');

function Requests(uber) {
  this._uber = uber;
  this.path = 'requests';
}

module.exports = Requests;

Requests.prototype.create = function create(parameters, callback) {
  if (!parameters) {
    return callback(new Error('Invalid parameters'));
  }

  var accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }

  return this._uber.post({ url: this.path,
    params: parameters,
    access_token: accessToken }, callback);
};

Requests.prototype.getCurrent = function getCurrent(callback) {
  return this.getByID('current', callback);
};

Requests.prototype.getByID = function getByID(id, callback) {
  var accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }

  if (!id) {
    return callback(new Error('Invalid request_id'));
  }

  return this._uber.get({ url: this.path + '/' + id, access_token: accessToken }, callback);
};

Requests.prototype.getMapByID = function getMapByID(id, callback) {
  var accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }

  if (!id) {
    return callback(new Error('Invalid request_id'));
  }

  return this._uber.get({ url: this.path + '/' + id + '/map', access_token: accessToken }, callback);
};

Requests.prototype.getReceiptByID = function getReceiptByID(id, callback) {
  var accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }

  if (!id) {
    return callback(new Error('Invalid request_id'));
  }

  return this._uber.get({ url: this.path + '/' + id + '/receipt', access_token: accessToken }, callback);
};

Requests.prototype.updateCurrent = function updateCurrent(parameters, callback) {
  if (!parameters) {
    return callback(new Error('Invalid parameters'));
  }

  return this.updateByID('current', parameters, callback);
};

Requests.prototype.updateByID = function updateByID(id, parameters, callback) {
  var accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }

  if (!id) {
    return callback(new Error('Invalid request_id'));
  }

  if (!parameters) {
    return callback(new Error('Invalid parameters'));
  }

  return this._uber.patch({ url: this.path + '/' + id,
    params: parameters,
    access_token: accessToken }, callback);
};

Requests.prototype.deleteCurrent = function deleteCurrent(callback) {
  return this.deleteByID('current', callback);
};

Requests.prototype.deleteByID = function deleteByID(id, callback) {
  var accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }

  if (!id) {
    return callback(new Error('Invalid request_id'));
  }

  return this._uber.delete({ url: this.path + '/' + id, access_token: accessToken }, callback);
};

Requests.prototype.getEstimates = function getEstimates(parameters, callback) {
  var accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }

  if (!parameters) {
    return callback(new Error('Invalid parameters'));
  }

  return this._uber.post({
    url: this.path + '/estimate',
    params: parameters,
    access_token: accessToken }, callback);
};

// deprecated
Requests.prototype.requestRide = util.deprecate(function requestRide(parameters, callback) {
  return this.create(parameters, callback);
}, '`requests.requestRide` is deprecated. Please use `requestRide.createRequest` instead.');

// deprecated
Requests.prototype.estimate = util.deprecate(function estimate(parameters, callback) {
  return this.getEstimates(parameters, callback);
}, '`requests.estimate` is deprecated. Please use ' +
    '`requests.getEstimates` instead.');
