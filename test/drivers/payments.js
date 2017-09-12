var common = require("../common"),
  should = common.should,
  uber = common.uber,
  reply = common.jsonReply,
  ac = common.authCode,
  acNP = common.authCodeNoProfile;

it('should get driver partner payments after authentication', function(done) {
  uber.authorization({
    authorization_code: ac
  }, function(err, accessToken, refreshToken) {
    should.not.exist(err);
    uber.partnerpayments.getPayments(0, 50, 1451606400, 1505160819, function(err, res) {
      should.not.exist(err);
      res.should.deep.equal(reply('drivers/partnerPayments'));
      done();
    });
  });
});

it('should get driver partner payments after authentication, even with a too high limit', function(done) {
  uber.authorization({
    authorization_code: ac
  }, function(err, accessToken, refreshToken) {
    should.not.exist(err);
    uber.partnerpayments.getPayments(0, 99, 1451606400, 1505160819, function(err, res) {
      should.not.exist(err);
      res.should.deep.equal(reply('drivers/partnerPayments'));
      done();
    });
  });
});

it('should get driver partner payments after authentication without required parameters', function(done) {
  uber.authorization({
    authorization_code: ac
  }, function(err, accessToken, refreshToken) {
    should.not.exist(err);
    uber.partnerpayments.getPayments(null, null, null, null, function(err, res) {
      should.not.exist(err);
      res.should.deep.equal(reply('drivers/partnerPayments'));
      done();
    });
  });
});

it('should return invalid access token error when no token found', function(done) {
  uber.clearTokens();
  uber.partnerpayments.getPayments(null, null, null, null, function(err, res) {
    err.message.should.equal('Invalid access token');
    done();
  });
});
