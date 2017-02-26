function Products(uber) {
    this._uber = uber;
    this.path = 'products';
}

module.exports = Products;

Products.prototype.getAllForAddress = function getAllForAddress(address, callback) {
    this._uber.getCoordinatesForAddress(address, function(err, data) {
        if(err) {
            return callback(err);
        }

        return this.getAllForLocation(
            data.lat,
            data.lng,
            callback
        );
    }.bind(this));
};

Products.prototype.getAllForLocation = function getAllForLocation(lat, lon, callback) {
    if (!lat || !lon) {
        return callback(new Error('Invalid latitude & longitude'));
    }

    return this._uber.get({
        url: this.path,
        params: {
            latitude: lat,
            longitude: lon
        },
        server_token: true
    }, callback);
};

Products.prototype.getByID = function getByID(id, callback) {
    if (!id) {
        return callback(new Error('Missing product_id parameter'));
    }

    return this._uber.get({
        url: this.path + '/' + id,
        server_token: true
    }, callback);
};

Products.prototype.setSurgeMultiplierByID = function setSurgeMultiplierByID(id, multiplier, callback) {
    if (!id) {
        return callback(new Error('Invalid product_id'));
    }

    if (this._uber.sandbox) {
        if (!this._uber.isNumeric(multiplier)) {
            return callback(new Error('Invalid surge multiplier'));
        } else {
            return this._uber.put({
                // this is required only for the PUT method
                url: 'sandbox/' + this.path + '/' + id,
                params: {
                    surge_multiplier: parseFloat(multiplier)
                },
                server_token: true
            }, callback);
        }
    } else {
        return callback(new Error('Setting surge multiplier is only allowed in Sandbox mode'));
    }
};

Products.prototype.setDriversAvailabilityByID = function setDriversAvailabilityByID(id, availability, callback) {
    if (!id) {
        return callback(new Error('Invalid product_id'));
    }

    if (this._uber.sandbox) {
        if (typeof availability !== 'boolean') {
            return callback(new Error('Availability needs to be a boolean'));
        } else {
            return this._uber.put({
                // this is required only for the PUT method
                url: 'sandbox/' + this.path + '/' + id,
                params: {
                    drivers_available: availability
                },
                server_token: true
            }, callback);
        }
    } else {
        return callback(new Error('Setting driver`s availability is only allowed in Sandbox mode'));
    }
};
