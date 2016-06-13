var common = require("./common"),
    nock = common.nock,
    should = common.should,
    qs = common.qs,
    uber = common.uber;

describe('OAuth2 error catching', function() {
    before(function() {
        nock('https://login.uber.com')
            .post('/oauth/token')
            .reply(404);
    });

    it('should catch authorization error if uber.com not reachable', function(done) {
        uber.authorizationAsync({
                authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
            })
            .then(function(res) {
                should.not.exist(res);
            })
            .error(function(err) {
                should.exist(err);
            });
        done();
    });
});

describe('Exchange authorization code into access token', function() {
    var tokenResponse = {
        "access_token": "EE1IDxytP04tJ767GbjH7ED9PpGmYvL",
        "token_type": "Bearer",
        "expires_in": 2592000,
        "refresh_token": "Zx8fJ8qdSRRseIVlsGgtgQ4wnZBehr",
        "scope": "profile history"
    };

    before(function() {
        nock('https://login.uber.com')
            .post('/oauth/token')
            .times(2)
            .reply(200, tokenResponse);
    });

    it('should be able to get access token and refresh token using authorization code', function(done) {
        uber.authorizationAsync({
                authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
            })
            .spread(function(access_token, refresh_token) {
                access_token.should.equal(tokenResponse.access_token);
                refresh_token.should.equal(tokenResponse.refresh_token);
                uber.access_token.should.equal(tokenResponse.access_token);
                uber.refresh_token.should.equal(tokenResponse.refresh_token);
            })
            .error(function(err) {
                should.not.exist(err);
            });
        done();
    });

    it('should able to get access token and refresh token using refresh token', function(done) {
        uber.authorizationAsync({
                refresh_token: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
            }).spread(function(access_token, refresh_token) {
                access_token.should.equal(tokenResponse.access_token);
                refresh_token.should.equal(tokenResponse.refresh_token);
                uber.access_token.should.equal(tokenResponse.access_token);
                uber.refresh_token.should.equal(tokenResponse.refresh_token);
            })
            .error(function(err) {
                should.not.exist(err);
            });
        done();
    });

    it('should return error if there is no authorization_code or refresh_token', function(done) {
        uber.authorizationAsync({})
            .then(function(access_token, refresh_token) {
                should.not.exist(access_token);
                should.not.exist(refresh_token);
            })
            .error(function(err) {
                err.message.should.equal('No authorization_code or refresh_token');
            });
        done();
    });
});
