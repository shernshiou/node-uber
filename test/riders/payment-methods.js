var common = require("../common"),
    should = common.should,
    uber = common.uber,
    reply = common.jsonReply,
    ac = common.authCode;

it('should list the payment methods after authentication', function(done) {
    uber.authorization({
            authorization_code: ac
        },
        function(err, accessToken, refreshToken) {
            should.not.exist(err);
            uber.payment.getMethods(function(err, res) {
                should.not.exist(err);
                res.should.deep.equal(reply('riders/paymentMethod'));
                done();
            });
        });
});

it('should return invalid access token error when no token found', function(done) {
    uber.clearTokens();
    uber.payment.getMethods(function(err, res) {
        err.message.should.equal('Invalid access token');
        done();
    });
});
