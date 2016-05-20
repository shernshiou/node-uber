function Estimates(uber) {
    this._uber = uber;
    this.path = 'estimates';

    // deprecated
    this.price = this._uber.deprecateMethod(function price(query, callback) {
        return this.getPriceForRoute(
            query.start_latitude,
            query.start_longitude,
            query.end_latitude,
            query.end_longitude,
            query.seat_count,
            callback);
    }, this.path + '.price', this.path + '.getPriceForRoute');

    this.time = this._uber.deprecateMethod(function time(query, callback) {
        return this.getETAForLocation(
            query.start_latitude,
            query.start_longitude,
            query.product_id,
            callback);
    }, this.path + '.time', this.path + '.getETAForLocation');
}

module.exports = Estimates;

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
