var common = require("../common"),
    nock = common.nock,
    should = common.should,
    uber = common.uber,
    reply = common.jsonReply,
    ac = common.authCode;

it('should list the payment methods after authentication', function(done) {
    uber.authorizationAsync({
            authorization_code: ac
        })
        .then(function(accessToken, refreshToken) {
            return uber.payment.getMethodsAsync();
        })
        .then(function(res) {
            res.should.deep.equal(reply('riders/paymentMethod'));
        })
        .error(function(err) {
            should.not.exist(err);
        });
    done();
});

it('should return invalid access token error when no token found', function(done) {
    uber.clearTokens();
    uber.payment.getMethodsAsync()
        .then(function(res) {
            should.not.exist(res);
        })
        .error(function(err) {
            err.message.should.equal('Invalid access token');
        });
    done();
});
