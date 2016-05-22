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
    profileReply = {
        "first_name": "Uber",
        "last_name": "Developer",
        "email": "developer@uber.com",
        "picture": "https://...",
        "promo_code": "teypo"
    },
    historyReply = {
        "offset": 0,
        "limit": 1,
        "count": 5,
        "history": [{
            "status": "completed",
            "distance": 1.64691465,
            "request_time": 1428876188,
            "start_time": 1428876374,
            "start_city": {
                "display_name": "San Francisco",
                "latitude": 37.7749295,
                "longitude": -122.4194155
            },
            "end_time": 1428876927,
            "request_id": "37d57a99-2647-4114-9dd2-c43bccf4c30b",
            "product_id": "a1111c8c-c720-46c3-8534-2fcdd730040d"
        }]
    };


describe('Profile', function() {
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
            .get('/v1/me')
            .times(2)
            .reply(200, profileReply);
    });

    it('should return invalid access token error when no token found', function(done) {
        uber.clearTokens();
        uber.user.getProfile(function(err, res) {
            err.message.should.equal('Invalid access token');
            done();
        });
    });

    it('should get user profile after authentication', function(done) {
        uber.authorization({
                authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.user.getProfile(function(err, res) {
                    should.not.exist(err);
                    res.should.deep.equal(profileReply);
                    done();
                });
            });
    });
});

describe('History', function() {
    before(function() {
        nock('https://login.uber.com')
            .post('/oauth/token')
            .times(5)
            .reply(200, tokenResponse);
        nock('https://api.uber.com', {
                reqheaders: {
                    'Authorization': 'Bearer EE1IDxytP04tJ767GbjH7ED9PpGmYvL'
                }
            })
            .get(function(uri) {
                var parts = uri.split('/v1.2/history?offset=0&limit=');
                if (parts.length !== 2) {
                    return false;
                }

                // range should be between 1 and 50
                return (parts[1] > 0 && parts[1] <= 50);
            })
            .times(4)
            .reply(200, historyReply);
    });

    it('should get user activity after authentication', function(done) {
        uber.authorization({
                authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.user.getHistory(0, 5, function(err, res) {
                    should.not.exist(err);
                    res.should.deep.equal(historyReply);
                    done();
                });
            });
    });

    it('should get user activity after authentication, even with a too high limit', function(done) {
        uber.authorization({
                authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.user.getHistory(0, 99, function(err, res) {
                    should.not.exist(err);
                    res.should.deep.equal(historyReply);
                    done();
                });
            });
    });

    it('should get user activity after authentication without required parameters', function(done) {
        uber.authorization({
                authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.user.getHistory(null, null, function(err, res) {
                    should.not.exist(err);
                    res.should.deep.equal(historyReply);
                    done();
                });
            });
    });

    it('should return invalid access token error when no token found', function(done) {
        uber.clearTokens();
        uber.user.getHistory(null, null, function(err, res) {
            err.message.should.equal('Invalid access token');
            done();
        });
    });
});
