var common = require("../common"),
  should = common.should,
  uber = common.uber,
  reply = common.jsonReply,
  ac = common.authCode,
  acNP = common.authCodeNoProfile;

it('should get driver partner trips after authentication', function(done) {
  uber.authorizationAsync({authorization_code: ac}).then(function() {
    return uber.partnertrips.getTripsAsync(0, 50, 1451606400, 1505160819);
  }).then(function(res) {
    res.should.deep.equal(reply('drivers/partnerTrips'));
    done();
  });
});

it('should get driver partner trips after authentication, even with a too high limit', function(done) {
  uber.authorizationAsync({authorization_code: ac}).then(function() {
    return uber.partnertrips.getTripsAsync(0, 99, 1451606400, 1505160819);
  }).then(function(res) {
    res.should.deep.equal(reply('drivers/partnerTrips'));
    done();
  });
});

it('should get driver partner trips after authentication without required parameters', function(done) {
  uber.authorizationAsync({authorization_code: ac}).then(function() {
    return uber.partnertrips.getTripsAsync(null, null, null, null);
  }).then(function(res) {
    res.should.deep.equal(reply('drivers/partnerTrips'));
    done();
  });
});

it('should return invalid access token error when no token found', function(done) {
  uber.clearTokens();
  uber.partnertrips.getTripsAsync(null, null, null, null).error(function(err) {
    err.message.should.equal('Invalid access token');
    done();
  });
});
