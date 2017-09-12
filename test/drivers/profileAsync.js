var common = require("../common"),
  should = common.should,
  uber = common.uber,
  reply = common.jsonReply,
  ac = common.authCode,
  acNP = common.authCodeNoProfile;

it('should return invalid access token error when no token found', function(done) {
  uber.clearTokens();
  uber.partnerprofile.getProfileAsync().error(function(err) {
    err.message.should.equal('Invalid access token');
    done();
  });
});

it('should get partner profile after authentication', function(done) {
  uber.authorizationAsync({authorization_code: ac}).then(function() {
    return uber.partnerprofile.getProfileAsync();
  }).then(function(res) {
    res.should.deep.equal(reply('drivers/partnerProfile'));
    done();
  });
});

it('should return error for partner profile with missing partner.accounts scope', function(done) {
  uber.authorizationAsync({authorization_code: acNP}).then(function() {
    return uber.partnerprofile.getProfileAsync();
  }).error(function(err) {
    err.message.should.equal('Required scope not found');
    done();
  });
});
