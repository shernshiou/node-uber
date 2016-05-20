var common = require("./common"),
    nock = common.nock,
    should = common.should,
    qs = common.qs,
    uber = common.uber;

describe('OAuth2 authorization url', function() {
    it('generate OAuth2 correct authorization url', function(done) {
        var url = uber.getAuthorizeUrl(['profile', 'history', 'places', 'request', 'request_receipt', 'all_trips']),
            sampleUrl = uber.defaults.authorize_url + '?' + qs.stringify({
                response_type: 'code',
                redirect_uri: uber.defaults.redirect_uri,
                scope: ['profile', 'history', 'places', 'request', 'request_receipt', 'all_trips'].join(' '),
                client_id: uber.defaults.client_id
            });
        url.should.equal(sampleUrl);
        done();
    });

    it('should return error if scope is not an array', function(done) {
        uber.getAuthorizeUrl().message.should.equal('Scope is not an array');
        done();
    });

    it('should return error if scope is not an empty array', function(done) {
        uber.getAuthorizeUrl([]).message.should.equal('Scope is empty');
        done();
    });
});

describe('OAuth2 error catching', function() {
    before(function() {
        nock('https://login.uber.com')
            .post('/oauth/token')
            .reply(404);
    });

    it('should catch authorization error if uber.com not reachable', function(done) {
        uber.authorization({
                authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
            },
            function(err, access_token, refresh_token) {
                should.exist(err);
                done();
            });
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
        uber.authorization({
                authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
            },
            function(err, access_token, refresh_token) {
                should.not.exist(err);
                access_token.should.equal(tokenResponse.access_token);
                refresh_token.should.equal(tokenResponse.refresh_token);
                uber.access_token.should.equal(tokenResponse.access_token);
                uber.refresh_token.should.equal(tokenResponse.refresh_token);
                done();
            });
    });

    it('should able to get access token and refresh token using refresh token', function(done) {
        uber.authorization({
                refresh_token: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
            },
            function(err, access_token, refresh_token) {
                should.not.exist(err);
                access_token.should.equal(tokenResponse.access_token);
                refresh_token.should.equal(tokenResponse.refresh_token);
                uber.access_token.should.equal(tokenResponse.access_token);
                uber.refresh_token.should.equal(tokenResponse.refresh_token);
                done();
            });
    });

    it('should return error if there is no authorization_code or refresh_token', function(done) {
        uber.authorization({}, function(err, access_token, refresh_token) {
            err.message.should.equal('No authorization_code or refresh_token');
            done();
        });
    });
});
