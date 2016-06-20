var common = require("./common"),
    should = common.should,
    qs = common.qs,
    uber = common.uber,
    reply = common.jsonReply,
    ac = common.authCode;

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

describe('Exchange authorization code into access token', function() {
    it('should be able to get access token and refresh token using authorization code', function(done) {
        uber.authorization({
                authorization_code: ac
            },
            function(err, res) {
                should.not.exist(err);
                res[0].should.equal(reply('token').access_token);
                res[1].should.equal(reply('token').refresh_token);
                uber.access_token.should.equal(reply('token').access_token);
                uber.refresh_token.should.equal(reply('token').refresh_token);
                done();
            });
    });

    it('should able to get access token and refresh token using refresh token', function(done) {
        uber.authorization({
                refresh_token: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
            },
            function(err, res) {
                should.not.exist(err);
                res[0].should.equal(reply('token').access_token);
                res[1].should.equal(reply('token').refresh_token);
                uber.access_token.should.equal(reply('token').access_token);
                uber.refresh_token.should.equal(reply('token').refresh_token);
                done();
            });
    });

    it('should return error if there is no authorization_code or refresh_token', function(done) {
        uber.authorization({}, function(err, access_token, refresh_token) {
            err.message.should.equal('No authorization_code or refresh_token');
            done();
        });
    });

    it('should return error if uber auth service not reachable', function(done) {
        uber.authorization({
                authorization_code: ''
            }, function(err, access_token, refresh_token) {
            err.statusCode.should.equal(500);
            done();
        });
    });
});
