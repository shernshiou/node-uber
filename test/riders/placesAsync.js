var common = require("../common"),
    should = common.should,
    uber = common.uber,
    reply = common.jsonReply,
    ac = common.authCode,
    acNPl = common.authCodeNoPlaces;

describe('Home', function() {
    it('should return error for missing access token', function(done) {
        uber.clearTokens();
        uber.places.updateHomeAsync('685 Market St, San Francisco, CA 94103, USA').then(function(res) {
                should.not.exist(res);
            })
            .error(function(err) {
                err.message.should.equal('Invalid access token');
            });
        done();
    });

    it('should list the home address after authentication', function(done) {
        uber.authorizationAsync({
                authorization_code: ac
            }).then(function(res) {
                return uber.places.getHomeAsync();
            })
            .then(function(res) {
                res.should.deep.equal(reply('riders/placeHome'));
            })
            .error(function(err) {
                should.not.exist(err);
            });
        done();
    });

    it('should return invalid access token error when no token found', function(done) {

        uber.clearTokens();
        uber.places.getHomeAsync().then(function(res) {
                should.not.exist(res);
            })
            .error(function(err) {
                err.message.should.equal('Invalid access token');
            });
        done();
    });
});

describe('Work', function() {
    it('should list the work address after authentication', function(done) {
        uber.authorizationAsync({
                authorization_code: ac
            }).then(function(access_token) {
                return uber.places.getWorkAsync();
            })
            .then(function(res) {
                res.should.deep.equal(reply('riders/placeWork'));
            })
            .error(function(err) {
                should.not.exist(err);
            });
        done();
    });

    it('should return invalid access token error when no token found', function(done) {
        uber.clearTokens();
        uber.places.getWorkAsync().then(function(res) {
                should.not.exist(res);
            })
            .error(function(err) {
                err.message.should.equal('Invalid access token');
            });
        done();
    });
});

describe('By Place ID', function() {
    it('should be able to update the home address', function(done) {
        uber.authorizationAsync({
                authorization_code: ac
            }).then(function(access_token) {
                return uber.places.updateHomeAsync('685 Market St, San Francisco, CA 94103, USA');
            })
            .then(function(res) {
                res.should.deep.equal(reply('riders/placeHome'));
            })
            .error(function(err) {
                should.not.exist(err);
            });
        done();
    });

    it('should return error for update of home address with missing scope', function(done) {
        uber.authorizationAsync({
                authorization_code: acNPl
            }).then(function(access_token) {
                return uber.places.updateHomeAsync('685 Market St, San Francisco, CA 94103, USA');
            })
            .error(function(err) {
                err.message.should.equal('Required scope not found');
            });
        done();
    });

    it('should be able to update the work address', function(done) {
        uber.authorizationAsync({
                authorization_code: ac
            }).then(function(access_token) {
                return uber.places.updateWorkAsync('1455 Market St, San Francisco, CA 94103, USA');
            })
            .then(function(res) {
                res.should.deep.equal(reply('riders/placeWork'));
            })
            .error(function(err) {
                should.not.exist(err);
            });
        done();
    });

    it('should return error for invalid place_id for GET', function(done) {
        uber.authorizationAsync({
                authorization_code: ac
            }).then(function(access_token) {
                return uber.places.getByIDAsync('shop');
            })
            .error(function(err) {
                err.message.should.equal('place_id needs to be either "home" or "work"');
            });
        done();
    });

    it('should return error for missing place_id for GET', function(done) {
        uber.authorizationAsync({
                authorization_code: ac
            }).then(function(res) {
                return uber.places.getByIDAsync(null);
            })
            .error(function(err) {
                err.message.should.equal('Invalid place_id');
            });
        done();
    });

    it('should return error for invalid place_id for PUT', function(done) {
        uber.authorizationAsync({
                authorization_code: ac
            }).then(function(res) {
                return uber.places.updateByIDAsync('shop', '685 Market St, San Francisco, CA 94103, USA');
            })
            .error(function(err) {
                err.message.should.equal('place_id needs to be either "home" or "work"');
            });
        done();
    });

    it('should return error for missing place_id for PUT', function(done) {
        uber.authorizationAsync({
                authorization_code: ac
            }).then(function(res) {
                return uber.places.updateByIDAsync(null, '685 Market St, San Francisco, CA 94103, USA');
            })
            .error(function(err) {
                err.message.should.equal('Invalid place_id');
            });
        done();
    });

    it('should return error for missing new address for PUT', function(done) {
        uber.authorizationAsync({
                authorization_code: ac
            }).then(function(res) {
                return uber.places.updateHomeAsync(null);
            })
            .error(function(err) {
                err.message.should.equal('Invalid address');
            });
        done();
    });
});
