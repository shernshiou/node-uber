function Requests(uber) {
    this._uber = uber;
    this.path = 'requests';
    this.requiredScope = ['request', 'all_trips', 'request_receipt'];
}

module.exports = Requests;

Requests.prototype.create = function create(parameters, callback) {
    var self = this;
    if (!parameters) {
        return callback(new Error('Invalid parameters'));
    }
    function localCallback(err, res) {
        if (!err) {
            return callback(err, res);
        } else if (!res) {
            return callback(err, res);
        }
        else if (res.statusCode === 409 && res.body.hasOwnProperty('meta')) {
            var meta = res.body.meta;
            if (meta.hasOwnProperty('surge_confirmation')) {
                var serr = {};
                serr.message = err;
                serr.surge_confirmation = meta.surge_confirmation;
                parameters.surge_confirmation_id = meta.surge_confirmation.surge_confirmation_id;
                self._uber.currentRequestParameters = parameters;
                return callback(serr, res);
            } else {
                return callback(err, res);
            }
        }
    }
    // replace addresses with node-geocoder coordinates if provided
    this._uber
        .replaceAddressWithCoordinates(
            parameters,
            'startAddress',
            'start_latitude',
            'start_longitude',
            function(startErr, startData) {
                if (startErr) {
                    return callback(startErr);
                }

                this._uber
                    .replaceAddressWithCoordinates(
                        startData,
                        'endAddress',
                        'end_latitude',
                        'end_longitude',
                        function(endErr, endData) {
                            if (endErr) {
                                return callback(endErr);
                            }
                            return this._uber.post({
                                url: this.path,
                                params: endData,
                                scope: this.requiredScope[0]
                            }, localCallback);
                        }.bind(this)
                    );
            }.bind(this)
        );
};

Requests.prototype.acceptSurgeForLastRequest = function acceptSurgeForLastRequest(callback) {
  if (! this._uber.hasOwnProperty('currentRequestParameters')) {
      return callback('No active request found for this session', null);
  } else {
      var params = JSON.parse(JSON.stringify(this._uber.currentRequestParameters));
      // invalidate session
      delete this._uber.currentRequestParameters;
      return this._uber.post({
          url: this.path,
          params: params,
          scope: this.requiredScope[0]
      }, callback);
  }
};

Requests.prototype.getCurrent = function getCurrent(callback) {
    return this.getByID('current', callback);
};

Requests.prototype.getByID = function getByID(id, callback) {
    if (!id) {
        return callback(new Error('Invalid request_id'));
    }

    return this._uber.get({
        url: this.path + '/' + id,
        scope: [this.requiredScope[0], this.requiredScope[1]]
    }, callback);
};

Requests.prototype.getMapByID = function getMapByID(id, callback) {
    if (!id) {
        return callback(new Error('Invalid request_id'));
    }

    return this._uber.get({
        url: this.path + '/' + id + '/map',
        scope: this.requiredScope[0]
    }, callback);
};

Requests.prototype.getReceiptByID = function getReceiptByID(id, callback) {
    if (!id) {
        return callback(new Error('Invalid request_id'));
    }

    return this._uber.get({
        url: this.path + '/' + id + '/receipt',
        scope: this.requiredScope[2]
    }, callback);
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

    // replace addresses with node-geocoder coordinates if provided
    this._uber
        .replaceAddressWithCoordinates(
            parameters,
            'startAddress',
            'start_latitude',
            'start_longitude',
            function(startErr, startData) {
                if (startErr) {
                    return callback(startErr);
                }

                this._uber
                    .replaceAddressWithCoordinates(
                        startData,
                        'endAddress',
                        'end_latitude',
                        'end_longitude',
                        function(endErr, endData) {
                            if (endErr) {
                                return callback(endErr);
                            }

                            return this._uber.patch({
                                url: this.path + '/' + id,
                                params: endData,
                                scope: this.requiredScope[0]
                            }, callback);
                        }.bind(this)
                    );
            }.bind(this)
        );
};

Requests.prototype.setStatusByID = function setStatusByID(id, newSatus, callback) {
    if (!this._uber.sandbox) {
        return callback(new Error('PUT method for requests is only allowed in Sandbox mode'));
    }

    if (!id) {
        return callback(new Error('Invalid request_id'));
    }

    if (!newSatus) {
        return callback(new Error('Invalid status'));
    }

    return this._uber.put({
            // this is required only for the PUT method
            url: 'sandbox/' + this.path + '/' + id,
            params: {
                status: newSatus
            },
            scope: this.requiredScope[0]
        },
        callback);
};

Requests.prototype.deleteCurrent = function deleteCurrent(callback) {
    return this.deleteByID('current', callback);
};

Requests.prototype.deleteByID = function deleteByID(id, callback) {
    if (!id) {
        return callback(new Error('Invalid request_id'));
    }

    return this._uber.delete({
        url: this.path + '/' + id,
        scope: this.requiredScope[0]
    }, callback);
};

Requests.prototype.getEstimates = function getEstimates(parameters, callback) {
    if (!parameters) {
        return callback(new Error('Invalid parameters'));
    }

    // replace addresses with node-geocoder coordinates if provided
    this._uber
        .replaceAddressWithCoordinates(
            parameters,
            'startAddress',
            'start_latitude',
            'start_longitude',
            function(startErr, startData) {
                if (startErr) {
                    return callback(startErr);
                }

                this._uber
                    .replaceAddressWithCoordinates(
                        startData,
                        'endAddress',
                        'end_latitude',
                        'end_longitude',
                        function(endErr, endData) {
                            if (endErr) {
                                return callback(endErr);
                            }

                            return this._uber.post({
                                url: this.path + '/estimate',
                                params: endData,
                                scope: this.requiredScope[0]
                            }, callback);
                        }.bind(this)
                    );
            }.bind(this)
        );
};
