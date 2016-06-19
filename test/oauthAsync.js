var common = require("./common"),
    should = common.should,
    qs = common.qs,
    uber = common.uber,
    reply = common.jsonReply,
    ac = common.authCode;

describe('Exchange authorization code into access token', function() {
    it('should be able to get access token and refresh token using authorization code', function(done) {
        uber.authorizationAsync({
                authorization_code: ac
            })
            .spread(function(access_token, refresh_token) {
                access_token.should.equal(reply('token').access_token);
                refresh_token.should.equal(reply('token').refresh_token);
                uber.access_token.should.equal(reply('token').access_token);
                uber.refresh_token.should.equal(reply('token').refresh_token);
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
                access_token.should.equal(reply('token').access_token);
                refresh_token.should.equal(reply('token').refresh_token);
                uber.access_token.should.equal(reply('token').access_token);
                uber.refresh_token.should.equal(reply('token').refresh_token);
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
