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

  return this._uber.post({ url: this.path, params: parameters }, callback);
};

Requests.prototype.getCurrent = function getCurrent(callback) {
  return this.getByID('current', callback);
};

Requests.prototype.getByID = function getByID(id, callback) {
  if (!id) {
    return callback(new Error('Invalid request_id'));
  }

  return this._uber.get({ url: this.path + '/' + id }, callback);
};

Requests.prototype.getMapByID = function getMapByID(id, callback) {
  if (!id) {
    return callback(new Error('Invalid request_id'));
  }

  return this._uber.get({ url: this.path + '/' + id + '/map'}, callback);
};

Requests.prototype.getReceiptByID = function getReceiptByID(id, callback) {
  if (!id) {
    return callback(new Error('Invalid request_id'));
  }

  return this._uber.get({ url: this.path + '/' + id + '/receipt' }, callback);
};

Requests.prototype.updateCurrent = function updateCurrent(parameters, callback) {
  if (!parameters) {
    return callback(new Error('Invalid parameters'));
  }

  return this.updateByID('current', parameters, callback);
};

Requests.prototype.updateByID = function updateByID(id, parameters, callback) {
  if (!id) {
    return callback(new Error('Invalid request_id'));
  }

  if (!parameters) {
    return callback(new Error('Invalid parameters'));
  }

  return this._uber.patch({ url: this.path + '/' + id, params: parameters }, callback);
};

Requests.prototype.setStatusByID = function setStatusByID(id, newSatus, callback) {
  if(!this._uber.sandbox) {
    return callback(new Error('PUT method for requests is only allowed in Sandbox mode'));
  }

  if (!id) {
    return callback(new Error('Invalid request_id'));
  }

  if (!newSatus) {
    return callback(new Error('Invalid status'));
  }

  return this._uber.put({ url: this.path + '/' + id, params: { status: newSatus } }, callback);
};

Requests.prototype.deleteCurrent = function deleteCurrent(callback) {
  return this.deleteByID('current', callback);
};

Requests.prototype.deleteByID = function deleteByID(id, callback) {
  if (!id) {
    return callback(new Error('Invalid request_id'));
  }

  return this._uber.delete({ url: this.path + '/' + id }, callback);
};

Requests.prototype.getEstimates = function getEstimates(parameters, callback) {
  if (!parameters) {
    return callback(new Error('Invalid parameters'));
  }

  return this._uber.post({
    url: this.path + '/estimate', arams: parameters }, callback);
};

// deprecated
Requests.prototype.requestRide = util.deprecate(function requestRide(parameters, callback) {
  return this.create(parameters, callback);
}, '`requests.requestRide` is deprecated. Please use `requests.create` instead.');

// deprecated
Requests.prototype.estimate = util.deprecate(function estimate(parameters, callback) {
  return this.getEstimates(parameters, callback);
}, '`requests.estimate` is deprecated. Please use ' +
    '`requests.getEstimates` instead.');
