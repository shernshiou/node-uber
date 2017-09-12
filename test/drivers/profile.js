var common = require("../common"),
  should = common.should,
  uber = common.uber,
  reply = common.jsonReply,
  ac = common.authCode,
  acNP = common.authCodeNoProfile;

it('should return invalid access token error when no token found', function(done) {
  uber.clearTokens();
  uber.partnerprofile.getProfile(function(err, res) {
    err.message.should.equal('Invalid access token');
    done();
  });
});

it('should get partner profile after authentication', function(done) {
  uber.authorization({
    authorization_code: ac
  }, function(err, accessToken, refreshToken) {
    should.not.exist(err);
    uber.partnerprofile.getProfile(function(err, res) {
      should.not.exist(err);
      res.should.deep.equal(reply('drivers/partnerProfile'));
      done();
    });
  });
});

it('should return error for partner profile with missing partner.accounts scope', function(done) {
  uber.authorization({
    authorization_code: acNP
  }, function(err, accessToken, refreshToken) {
    should.not.exist(err);
    uber.partnerprofile.getProfile(function(err, res) {
      err.message.should.equal('Required scope not found');
      done();
    });
  });
});
