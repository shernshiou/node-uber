function Estimates(uber) {
    this._uber = uber;
    this.path = 'estimates';
}

module.exports = Estimates;

Estimates.prototype.getPriceForRouteByAddress = function getPriceForRouteByAddress(startAddress, endAddress, seats, callback) {
    this._uber.getCoordinatesForAddress(startAddress, function(err, startData) {
        if(err) {
            // check first if seats (optional) is provided
            return (typeof seats === 'function' ? seats(err) : callback(err));
        }

        this._uber.getCoordinatesForAddress(endAddress, function(err2, endData) {
            if(err2) {
                return (typeof seats === 'function' ? seats(err2) : callback(err2));
            }

            return this.getPriceForRoute(
                startData.lat,
                startData.lng,
                endData.lat,
                endData.lng,
                seats,
                callback
            );
        }.bind(this));
    }.bind(this));
};

Estimates.prototype.getPriceForRoute = function getPriceForRoute(startLat,
    startLon, endLat, endLon, seats, callback) {
    // seats is optional
    if (typeof seats === 'function') {
        callback = seats;
        // set to the default of 2 seats
        seats = 2;
    }

    if (!startLat || !startLon) {
        return callback(new Error('Invalid starting point latitude & longitude'));
    }

    if (!endLat || !endLon) {
        return callback(new Error('Invalid ending point latitude & longitude'));
    }

    if (!this._uber.isNumeric(seats)) {
        seats = 2;
    }

    return this._uber.get({
        url: this.path + '/price',
        params: {
            start_latitude: startLat,
            start_longitude: startLon,
            end_latitude: endLat,
            end_longitude: endLon,
            seat_count: seats
        },
        server_token: true
    }, callback);
};

Estimates.prototype.getETAForAddress = function getETAForAddress(address, id, callback) {
    this._uber.getCoordinatesForAddress(address, function(err, data) {
        if(err) {
            // check first if ID (optional) is provided
            return (typeof id === 'function' ? id(err) : callback(err));
        }

        return this.getETAForLocation(
            data.lat,
            data.lng,
            id,
            callback
        );
    }.bind(this));
};

Estimates.prototype.getETAForLocation = function getETAForLocation(lat, lon, id, callback) {
    if (typeof id === 'function') {
        callback = id;
        id = undefined;
    }

    if (!lat || !lon) {
        return callback(new Error('Invalid latitude & longitude'));
    }

    // add optional product_id in case it's set
    var par = (id && id !== '') ? {
        start_latitude: lat,
        start_longitude: lon,
        product_id: id
    } : {
        start_latitude: lat,
        start_longitude: lon
    };

    return this._uber.get({
        url: this.path + '/time',
        params: par,
        server_token: true
    }, callback);
};
