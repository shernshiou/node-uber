var common = require("../common"),
    should = common.should,
    uber = common.uber,
    reply = common.jsonReply,
    ac = common.authCode;

describe('Price', function() {
    it('should list all the price estimates by address', function(done) {
        uber.estimates.getPriceForRouteByAddress('A', 'B',
            function(err, res) {
                should.not.exist(err);
                res.should.deep.equal(reply('riders/price'));
                done();
            });
    });

    it('should list all the price estimates by address with invalid seats count', function(done) {
        uber.estimates.getPriceForRouteByAddress('A', 'B', '',
            function(err, res) {
                should.not.exist(err);
                res.should.deep.equal(reply('riders/price'));
                done();
            });
    });

    it('should list all the price estimates', function(done) {
        uber.estimates.getPriceForRoute(3.1357169, 101.6881501, 3.0831659, 101.6505078,
            function(err, res) {
                should.not.exist(err);
                res.should.deep.equal(reply('riders/price'));
                done();
            });
    });

    it('should list all the price estimates with invalid seats count', function(done) {
        uber.estimates.getPriceForRoute(3.1357169, 101.6881501, 3.0831659, 101.6505078, '',
            function(err, res) {
                should.not.exist(err);
                res.should.deep.equal(reply('riders/price'));
                done();
            });
    });

    it('should list all the price estimates by address without access token', function(done) {
        uber.clearTokens();
        uber.estimates.getPriceForRouteByAddress(
            'A',
            'B',
            function(err, res) {
                should.not.exist(err);
                res.should.deep.equal(reply('riders/price'));
                done();
            });
    });

    it('should list all the price estimates without access token', function(done) {
        uber.clearTokens();
        uber.estimates.getPriceForRoute(3.1357169, 101.6881501, 3.0831659, 101.6505078,
            function(err, res) {
                should.not.exist(err);
                res.should.deep.equal(reply('riders/price'));
                done();
            });
    });

    it('should return error if start address is invalid', function(done) {
        uber.estimates.getPriceForRouteByAddress(
            ' ',
            'B',
            function(err, res) {
                err.message.should.equal('No coordinates found for: " "');
                done();
            });
    });

    it('should return error if start address is invalid with seats', function(done) {
        uber.estimates.getPriceForRouteByAddress(
            ' ',
            'B',
            2,
            function(err, res) {
                err.message.should.equal('No coordinates found for: " "');
                done();
            });
    });

    it('should return error if start point lat and lon are invalid', function(done) {
        uber.estimates.getPriceForRoute(null, null, 3.1357169, 101.6881501, function(err, res) {
            err.message.should.equal('Invalid starting point latitude & longitude');
            done();
        });
    });

    it('should return error if end address is invalid', function(done) {
        uber.estimates.getPriceForRouteByAddress(
            'A',
            null,
            function(err, res) {
                err.message.should.equal('Geocoder.geocode requires a location.');
                done();
            });
    });

    it('should return error if end address is invalid with seats', function(done) {
        uber.estimates.getPriceForRouteByAddress(
            'A',
            null,
            2,
            function(err, res) {
                err.message.should.equal('Geocoder.geocode requires a location.');
                done();
            });
    });

    it('should return error if end point lat and lon are invalid', function(done) {
        uber.estimates.getPriceForRoute(3.1357169, 101.6881501, null, null, function(err, res) {
            err.message.should.equal('Invalid ending point latitude & longitude');
            done();
        });
    });

    it('should return error if both addresses are null', function(done) {
        uber.estimates.getPriceForRouteByAddress(
            null,
            null,
            function(err, res) {
                err.message.should.equal('Geocoder.geocode requires a location.');
                done();
            });
    });

    it('should return error if both addresses are invalid', function(done) {
        uber.estimates.getPriceForRouteByAddress(
            ' ',
            ' ',
            function(err, res) {
                err.message.should.equal('No coordinates found for: " "');
                done();
            });
    });

    it('should return error if there is no required params', function(done) {
        uber.estimates.getPriceForRoute(null, null, null, null, function(err, res) {
            err.message.should.equal('Invalid starting point latitude & longitude');
            done();
        });
    });
});

describe('Time', function() {
    it('should list all the price estimates for location', function(done) {
        uber.authorization({
                authorization_code: ac
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.estimates.getETAForLocation(3.1357169, 101.6881501,
                    function(err, res) {
                        should.not.exist(err);
                        res.should.deep.equal(reply('riders/time'));
                        done();
                    });
            });
    });

    it('should list all the price estimates for address', function(done) {
        uber.authorization({
                authorization_code: ac
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.estimates.getETAForAddress(
                    'A',
                    function(err, res) {
                        should.not.exist(err);
                        res.should.deep.equal(reply('riders/time'));
                        done();
                    });
            });
    });

    it('should list all the price estimates for location without access token', function(done) {
        uber.clearTokens();
        uber.estimates.getETAForLocation(3.1357169, 101.6881501,
            function(err, res) {
                should.not.exist(err);
                res.should.deep.equal(reply('riders/time'));
                done();
            });
    });

    it('should list all the price estimates for address without access token', function(done) {
        uber.estimates.getETAForAddress(
            'A',
            function(err, res) {
                should.not.exist(err);
                res.should.deep.equal(reply('riders/time'));
                done();
            });
    });

    it('should list all the price estimates for product and location', function(done) {
        uber.estimates.getETAForLocation(3.1357169, 101.6881501, '327f7914-cd12-4f77-9e0c-b27bac580d03',
            function(err, res) {
                should.not.exist(err);
                res.should.deep.equal(reply('riders/time'));
                done();
            });
    });

    it('should list all the price estimates for product and address', function(done) {
        uber.estimates.getETAForAddress(
            'A',
            '327f7914-cd12-4f77-9e0c-b27bac580d03',
            function(err, res) {
                should.not.exist(err);
                res.should.deep.equal(reply('riders/time'));
                done();
            });
    });

    it('should list all the price estimates for location with empty product', function(done) {
        uber.estimates.getETAForLocation(3.1357169, 101.6881501, '',
            function(err, res) {
                should.not.exist(err);
                res.should.deep.equal(reply('riders/time'));
                done();
            });
    });

    it('should list all the price estimates for address with empty product', function(done) {
        uber.estimates.getETAForAddress(
            'A',
            '',
            function(err, res) {
                should.not.exist(err);
                res.should.deep.equal(reply('riders/time'));
                done();
            });
    });

    it('should return error if there is no required params', function(done) {
        uber.estimates.getETAForLocation(null, null, function(err, res) {
            err.message.should.equal('Invalid latitude & longitude');
            done();
        });
    });

    it('should return error if there is no valid address', function(done) {
        uber.estimates.getETAForAddress(' ', function(err, res) {
            err.message.should.equal('No coordinates found for: " "');
            done();
        });
    });

    it('should return error if there is no valid address but product_id', function(done) {
        uber.estimates.getETAForAddress(' ', '327f7914-cd12-4f77-9e0c-b27bac580d03', function(err, res) {
            err.message.should.equal('No coordinates found for: " "');
            done();
        });
    });

    it('should return error if there is no required params', function(done) {
        uber.estimates.getETAForAddress(null, function(err, res) {
            err.message.should.equal('Geocoder.geocode requires a location.');
            done();
        });
    });
});
