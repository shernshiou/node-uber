var common = require("../common"),
    should = common.should,
    uber = common.uber,
    reply = common.jsonReply,
    ac = common.authCode;

describe('Price', function() {
    it('should list all the price estimates by address', function(done) {
        uber.estimates.getPriceForRouteByAddressAsync('A', 'B')
        .then(function(res) {
                res.should.deep.equal(reply('riders/price'));
                done();
            });
    });

    it('should list all the price estimates by address with invalid seats count', function(done) {
        uber.estimates.getPriceForRouteByAddressAsync('A', 'B', '')
        .then(function(res) {
                res.should.deep.equal(reply('riders/price'));
                done();
            });
    });

    it('should list all the price estimates from server', function(done) {
        uber.estimates.getPriceForRouteAsync(3.1357169, 101.6881501, 3.0831659, 101.6505078)
            .then(function(res) {
                res.should.deep.equal(reply('riders/price'));
                done();
            });
    });

    it('should list all the price estimates from server with invalid seats count', function(done) {
        uber.estimates.getPriceForRouteAsync(3.1357169, 101.6881501, 3.0831659, 101.6505078, '')
            .then(function(res) {
                res.should.deep.equal(reply('riders/price'));
                done();
            });
    });

    it('should list all the price estimates by address without access token', function(done) {
        uber.clearTokens();
        uber.estimates.getPriceForRouteByAddressAsync('A', 'B')
        .then(function(res) {
                res.should.deep.equal(reply('riders/price'));
                done();
            });
    });

    it('should list all the price estimates from server without access token', function(done) {
        uber.clearTokens();
        uber.estimates.getPriceForRouteAsync(3.1357169, 101.6881501, 3.0831659, 101.6505078)
            .then(function(res) {
                res.should.deep.equal(reply('riders/price'));
                done();
            });
    });

    it('should return error if start address is invalid', function(done) {
        uber.estimates.getPriceForRouteByAddressAsync(' ', 'B')
        .error(function(err) {
                err.message.should.equal('No coordinates found for: " "');
                done();
            });
    });

    it('should return error if start address is invalid with seats', function(done) {
        uber.estimates.getPriceForRouteByAddressAsync(' ', 'B', 2)
        .error(function(err) {
                err.message.should.equal('No coordinates found for: " "');
                done();
            });
    });

    it('should return error if start point lat and lon are invalid', function(done) {
        uber.estimates.getPriceForRouteAsync(null, null, 3.1357169, 101.6881501)
            .error(function(err) {
                err.message.should.equal('Invalid starting point latitude & longitude');
                done();
            });
    });

    it('should return error if end address is invalid', function(done) {
        uber.estimates.getPriceForRouteByAddressAsync('A', null)
        .error(function(err) {
                err.message.should.equal('Geocoder.geocode requires a location.');
                done();
            });
    });

    it('should return error if end address is invalid with seats', function(done) {
        uber.estimates.getPriceForRouteByAddressAsync('A', null, 2)
        .error(function(err) {
                err.message.should.equal('Geocoder.geocode requires a location.');
                done();
            });
    });

    it('should return error if end point lat and lon are invalid', function(done) {
        uber.estimates.getPriceForRouteAsync(3.1357169, 101.6881501, null, null)
            .error(function(err) {
                err.message.should.equal('Invalid ending point latitude & longitude');
                done();
            });
    });

    it('should return error if both addresses are null', function(done) {
        uber.estimates.getPriceForRouteByAddressAsync(null, null)
        .error(function(err) {
                err.message.should.equal('Geocoder.geocode requires a location.');
                done();
            });
    });

    it('should return error if both addresses are invalid', function(done) {
        uber.estimates.getPriceForRouteByAddressAsync(' ', ' ')
        .error(function(err) {
                err.message.should.equal('No coordinates found for: " "');
                done();
            });
    });

    it('should return error if there is no required params', function(done) {
        uber.estimates.getPriceForRouteAsync(null, null, null, null)
            .error(function(err) {
                err.message.should.equal('Invalid starting point latitude & longitude');
                done();
            });
    });
});

describe('Time', function() {
    it('should list all the price estimates for location', function(done) {
        uber.authorizationAsync({
                authorization_code: ac
            }).then(function(res) {
                return uber.estimates.getETAForLocationAsync(3.1357169, 101.6881501);
            })
            .then(function(res) {
                res.should.deep.equal(reply('riders/time'));
                done();
            });
    });

    it('should list all the price estimates for address', function(done) {
        uber.authorizationAsync({
                authorization_code: ac
            }).then(function(res) {
                return uber.estimates.getETAForAddressAsync('A');
            })
            .then(function(res) {
                res.should.deep.equal(reply('riders/time'));
                done();
            });
    });

    it('should list all the price estimates for location without access token', function(done) {
        uber.clearTokens();
        uber.estimates.getETAForLocationAsync(3.1357169, 101.6881501)
            .then(function(res) {
                res.should.deep.equal(reply('riders/time'));
                done();
            });
    });

    it('should list all the price estimates for adddress without access token', function(done) {
        uber.clearTokens();
        uber.estimates.getETAForAddressAsync('A')
            .then(function(res) {
                res.should.deep.equal(reply('riders/time'));
                done();
            });
    });

    it('should list all the price estimates for product and location', function(done) {
        uber.estimates.getETAForLocationAsync(3.1357169, 101.6881501, '327f7914-cd12-4f77-9e0c-b27bac580d03')
            .then(function(res) {
                res.should.deep.equal(reply('riders/time'));
                done();
            });
    });

    it('should list all the price estimates for product and address', function(done) {
        uber.estimates.getETAForAddressAsync('A', '327f7914-cd12-4f77-9e0c-b27bac580d03')
            .then(function(res) {
                res.should.deep.equal(reply('riders/time'));
                done();
            });
    });

    it('should list all the price estimates for location but empty product', function(done) {
        uber.estimates.getETAForLocationAsync(3.1357169, 101.6881501, '')
            .then(function(res) {
                res.should.deep.equal(reply('riders/time'));
                done();
            });
    });

    it('should list all the price estimates for address but empty product', function(done) {
        uber.estimates.getETAForAddressAsync('A', '')
            .then(function(res) {
                res.should.deep.equal(reply('riders/time'));
                done();
            });
    });

    it('should return error if there is no required params', function(done) {
        uber.estimates.getETAForLocationAsync(null, null)
            .error(function(err) {
                err.message.should.equal('Invalid latitude & longitude');
            });
        done();
    });

    it('should return error if there is no valid address', function(done) {
        uber.estimates.getETAForAddressAsync(' ')
        .error(function(err) {
            err.message.should.equal('No coordinates found for: " "');
            done();
        });
    });

    it('should return error if there is no valid address but product_id', function(done) {
        uber.estimates.getETAForAddressAsync(' ', '327f7914-cd12-4f77-9e0c-b27bac580d03')
        .error(function(err) {
            err.message.should.equal('No coordinates found for: " "');
            done();
        });
    });

    it('should return error if there is no required params', function(done) {
        uber.estimates.getETAForAddressAsync(null)
        .error(function(err) {
            err.message.should.equal('Geocoder.geocode requires a location.');
            done();
        });
    });
});
