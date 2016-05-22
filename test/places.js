var common = require("./common"),
    nock = common.nock,
    should = common.should,
    uber = common.uber;

var tokenResponse = {
        "access_token": "EE1IDxytP04tJ767GbjH7ED9PpGmYvL",
        "token_type": "Bearer",
        "expires_in": 2592000,
        "refresh_token": "Zx8fJ8qdSRRseIVlsGgtgQ4wnZBehr",
        "scope": "profile history"
    },
    placesHomeReply = {
        "address": "685 Market St, San Francisco, CA 94103, USA"
    },
    placesWorkReply = {
        "address": "1455 Market St, San Francisco, CA 94103, USA"
    };

describe('Home', function() {
    before(function() {
        nock('https://login.uber.com')
            .post('/oauth/token')
            .times(3)
            .reply(200, tokenResponse);
        nock('https://api.uber.com', {
                reqheaders: {
                    'Authorization': 'Bearer EE1IDxytP04tJ767GbjH7ED9PpGmYvL'
                }
            })
            .get('/v1/places/home')
            .reply(200, placesHomeReply);
        nock('https://api.uber.com')
            .put('/v1/places/home')
            .reply(200, placesHomeReply);
    });

    it('should return error for missing access token', function(done) {
        uber.clearTokens();
        uber.places.updateHome('685 Market St, San Francisco, CA 94103, USA', function(err, res) {
            err.message.should.equal('Invalid access token');
            done();
        });
    });

    it('should list the home address after authentication', function(done) {
        uber.authorization({
                authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.places.getHome(function(err, res) {
                    should.not.exist(err);
                    res.should.deep.equal(placesHomeReply);
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
    before(function() {
        nock('https://login.uber.com')
            .post('/oauth/token')
            .times(3)
            .reply(200, tokenResponse);
        nock('https://api.uber.com', {
                reqheaders: {
                    'Authorization': 'Bearer EE1IDxytP04tJ767GbjH7ED9PpGmYvL'
                }
            })
            .get('/v1/places/work')
            .reply(200, placesWorkReply);
    });

    it('should list the work address after authentication', function(done) {
        uber.authorization({
                authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.places.getWork(function(err, res) {
                    should.not.exist(err);
                    res.should.deep.equal(placesWorkReply);
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
    before(function() {
        nock('https://login.uber.com')
            .post('/oauth/token')
            .times(5)
            .reply(200, tokenResponse);
        nock('https://api.uber.com')
            .put('/v1/places/home')
            .reply(200, placesHomeReply);
        nock('https://api.uber.com')
            .put('/v1/places/work')
            .reply(200, placesWorkReply);
        nock('https://api.uber.com')
            .put('/v1/places/shop')
            .reply(404);
        nock('https://api.uber.com', {
                reqheaders: {
                    'Authorization': 'Bearer EE1IDxytP04tJ767GbjH7ED9PpGmYvL'
                }
            })
            .get('/v1/places/shop')
            .reply(404);
    });

    it('should be able to update the home address', function(done) {
        uber.authorization({
                authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.places.updateHome('685 Market St, San Francisco, CA 94103, USA', function(err, res) {
                    should.not.exist(err);
                    res.should.deep.equal(placesHomeReply);
                    done();
                });
            });
    });

    it('should be able to update the work address', function(done) {
        uber.authorization({
                authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.places.updateWork('1455 Market St, San Francisco, CA 94103, USA', function(err, res) {
                    should.not.exist(err);
                    res.should.deep.equal(placesWorkReply);
                    done();
                });
            });
    });

    it('should return error for invalid place_id for GET', function(done) {
        uber.authorization({
                authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
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
                authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
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
                authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
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
                authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
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
                authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
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
