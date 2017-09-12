var common = require("../common"),
    should = common.should,
    uber = common.uber,
    reply = common.jsonReply,
    ac = common.authCode,
    acNPl = common.authCodeNoPlaces;

describe('Home', function() {
    it('should return error for missing access token', function(done) {
        uber.clearTokens();
        uber.places.updateHome('685 Market St, San Francisco, CA 94103, USA', function(err, res) {
            err.message.should.equal('Invalid access token');
            done();
        });
    });

    it('should list the home address after authentication', function(done) {
        uber.authorization({
                authorization_code: ac
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.places.getHome(function(err, res) {
                    should.not.exist(err);
                    res.should.deep.equal(reply('riders/placeHome'));
                    done();
                });
            });
    });

    it('should return invalid access token error when no token found', function(done) {

        uber.clearTokens();
        uber.places.getHome(function(err, res) {
            err.message.should.equal('Invalid access token');
            done();
        });
    });

});

describe('Work', function() {
    it('should list the work address after authentication', function(done) {
        uber.authorization({
                authorization_code: ac
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.places.getWork(function(err, res) {
                    should.not.exist(err);
                    res.should.deep.equal(reply('riders/placeWork'));
                    done();
                });
            });
    });

    it('should return invalid access token error when no token found', function(done) {
        uber.clearTokens();
        uber.places.getWork(function(err, res) {
            err.message.should.equal('Invalid access token');
            done();
        });
    });
});

describe('By Place ID', function() {
    it('should be able to update the home address', function(done) {
        uber.authorization({
                authorization_code: ac
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.places.updateHome('685 Market St, San Francisco, CA 94103, USA', function(err, res) {
                    should.not.exist(err);
                    res.should.deep.equal(reply('riders/placeHome'));
                    done();
                });
            });
    });

    it('should return error for update of home address with missing scope', function(done) {
        uber.authorization({
                authorization_code: acNPl
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.places.updateHome('685 Market St, San Francisco, CA 94103, USA', function(err, res) {
                    err.message.should.equal('Required scope not found');
                    done();
                });
            });
    });

    it('should be able to update the work address', function(done) {
        uber.authorization({
                authorization_code: ac
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.places.updateWork('1455 Market St, San Francisco, CA 94103, USA', function(err, res) {
                    should.not.exist(err);
                    res.should.deep.equal(reply('riders/placeWork'));
                    done();
                });
            });
    });

    it('should return error for invalid place_id for GET', function(done) {
        uber.authorization({
                authorization_code: ac
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.places.getByID('shop', function(err, res) {
                    err.message.should.equal('place_id needs to be either "home" or "work"');
                    done();
                });
            });
    });

    it('should return error for missing place_id for GET', function(done) {
        uber.authorization({
                authorization_code: ac
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.places.getByID(null, function(err, res) {
                    err.message.should.equal('Invalid place_id');
                    done();
                });
            });
    });

    it('should return error for invalid place_id for PUT', function(done) {
        uber.authorization({
                authorization_code: ac
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.places.updateByID('shop', '685 Market St, San Francisco, CA 94103, USA', function(err, res) {
                    err.message.should.equal('place_id needs to be either "home" or "work"');
                    done();
                });
            });
    });

    it('should return error for missing place_id for PUT', function(done) {
        uber.authorization({
                authorization_code: ac
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.places.updateByID(null, '685 Market St, San Francisco, CA 94103, USA', function(err, res) {
                    err.message.should.equal('Invalid place_id');
                    done();
                });
            });
    });

    it('should return error for missing new address for PUT', function(done) {
        uber.authorization({
                authorization_code: ac
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.places.updateHome(null, function(err, res) {
                    err.message.should.equal('Invalid address');
                    done();
                });
            });
    });
});
