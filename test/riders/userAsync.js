var common = require("../common"),
  should = common.should,
  uber = common.uber,
  reply = common.jsonReply,
  ac = common.authCode,
  acNP = common.authCodeNoProfile;

describe('Profile', function() {
  it('should return invalid access token error when no token found', function(done) {
    uber.clearTokens();
    uber.user.getProfileAsync().error(function(err) {
      err.message.should.equal('Invalid access token');
      done();
    });
  });

  it('should get user profile after authentication', function(done) {
    uber.authorizationAsync({authorization_code: ac}).then(function() {
      return uber.user.getProfileAsync();
    }).then(function(res) {
      res.should.deep.equal(reply('riders/profile'));
      done();
    });
  });

  it('should return error for user profile with missing profile scope', function(done) {
    uber.authorizationAsync({authorization_code: acNP}).then(function() {
      return uber.user.getProfileAsync();
    }).error(function(err) {
      err.message.should.equal('Required scope not found');
      done();
    });
  });

  it('should fail apply promo code for user profile after authentication', function(done) {
    uber.authorizationAsync({authorization_code: ac}).then(function() {
      return uber.user.applyPromoAsync('already-used-code');
    }).error(function(err) {
      should.exist(err);
      done();
    });
  });

  it('should successfully apply promo code for user profile after authentication', function(done) {
    uber.authorizationAsync({authorization_code: ac}).then(function() {
      return uber.user.applyPromoAsync('FREE_RIDEZ');
    }).then(function(res) {
      res.should.deep.equal(reply('riders/profilePromoSuccess'));
      done();
    });
  });
});

describe('History', function() {
  it('should get user activity after authentication', function(done) {
    uber.authorizationAsync({authorization_code: ac}).then(function() {
      return uber.user.getHistoryAsync(0, 5);
    }).then(function(res) {
      res.should.deep.equal(reply('riders/history'));
      done();
    });
  });

  it('should get user activity after authentication, even with a too high limit', function(done) {
    uber.authorizationAsync({authorization_code: ac}).then(function() {
      return uber.user.getHistoryAsync(0, 99);
    }).then(function(res) {
      res.should.deep.equal(reply('riders/history'));
      done();
    });
  });

  it('should get user activity after authentication without required parameters', function(done) {
    uber.authorizationAsync({authorization_code: ac}).then(function() {
      return uber.user.getHistoryAsync(null, null);
    }).then(function(res) {
      res.should.deep.equal(reply('riders/history'));
      done();
    });
  });

  it('should return invalid access token error when no token found', function(done) {
    uber.clearTokens();
    uber.user.getHistoryAsync(null, null).error(function(err) {
      err.message.should.equal('Invalid access token');
      done();
    });
  });
});
