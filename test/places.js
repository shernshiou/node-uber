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

        nock('https://api.uber.com')
            .get('/v1/places/home?access_token=EE1IDxytP04tJ767GbjH7ED9PpGmYvL')
            .reply(200, placesHomeReply);
    });

    it('should list the home address after authentication', function(done) {
        uber.authorization({
                authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
            },
            function(err, accessToken, refreshToken) {
                uber.places.getHome(function(err, res) {
                    should.not.exist(err);
                    res.should.deep.equal(placesHomeReply);
                    done();
                });
            });
    });

    it('should return invalid access token error when no token found', function(done) {
        uber.authorization({
                authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
            },
            function(err, accessToken, refreshToken) {
                uber.access_token = '';
                uber.places.getHome(function(err, res) {
                    err.message.should.equal('Invalid access token');
                    done();
                });
            });
    });

});

describe('Work', function() {
    before(function() {
        nock('https://login.uber.com')
            .post('/oauth/token')
            .times(3)
            .reply(200, tokenResponse);

        nock('https://api.uber.com')
            .get('/v1/places/work?access_token=EE1IDxytP04tJ767GbjH7ED9PpGmYvL')
            .reply(200, placesWorkReply);
    });

    it('should list the work address after authentication', function(done) {
        uber.authorization({
                authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
            },
            function(err, accessToken, refreshToken) {
                uber.places.getWork(function(err, res) {
                    should.not.exist(err);
                    res.should.deep.equal(placesWorkReply);
                    done();
                });
            });
    });

    it('should return invalid access token error when no token found', function(done) {
        uber.authorization({
                authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
            },
            function(err, accessToken, refreshToken) {
                uber.access_token = '';
                uber.places.getWork(function(err, res) {
                    err.message.should.equal('Invalid access token');
                    done();
                });
            });
    });
});
