var common = require('../common'),
  should = common.should,
  qs = common.qs,
  uber = common.uber,
  reply = common.jsonReply,
  ac = common.authCode,
  acTE = common.authCodeTokenExpired,
  acTNR = common.authCodeTokenNoRefresh;

describe('Exchange authorization code into access token', function() {
  it('should be able to get access token and refresh token using authorization code', function(done) {
    uber.authorizationAsync({authorization_code: ac}).spread(function(access_token, refresh_token) {
      access_token.should.equal(reply('auth/token').access_token);
      refresh_token.should.equal(reply('auth/token').refresh_token);
      uber.access_token.should.equal(reply('auth/token').access_token);
      uber.refresh_token.should.equal(reply('auth/token').refresh_token);
    }).error(function(err) {
      should.not.exist(err);
    });
    done();
  });

  it('should able to get access token and refresh token using refresh token', function(done) {
    uber.authorizationAsync({refresh_token: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'}).spread(function(access_token, refresh_token) {
      access_token.should.equal(reply('auth/token').access_token);
      refresh_token.should.equal(reply('auth/token').refresh_token);
      uber.access_token.should.equal(reply('auth/token').access_token);
      uber.refresh_token.should.equal(reply('auth/token').refresh_token);
    }).error(function(err) {
      should.not.exist(err);
    });
    done();
  });

  it('should return error if there is no authorization_code or refresh_token', function(done) {
    uber.authorizationAsync({}).then(function(access_token, refresh_token) {
      should.not.exist(access_token);
      should.not.exist(refresh_token);
    }).error(function(err) {
      err.message.should.equal('No authorization_code or refresh_token');
    });
    done();
  });
});

describe('Auto refresh token whenever it is expired', function() {
  it('should be able to recognize an expired token and then auto refresh the token ', function(done) {
    uber.authorizationAsync({authorization_code: acTE}).then(function() {
      return uber.requests.createAsync({product_id: 'a1111c8c-c720-46c3-8534-2fcdd730040d', start_latitude: 37.761492, start_longitude: -122.423941, end_latitude: 37.775393, end_longitude: -122.417546});
    }).then(function(res) {
      res.should.deep.equal(reply('riders/requestCreate'));
      uber.tokenExpiration.should.be.above(new Date());
      done();
    });
  });
  it('should return an error if the uber server is not available while refreshing token', function(done) {
    uber.authorizationAsync({authorization_code: acTNR}).then(function() {
      return uber.requests.createAsync({product_id: 'a1111c8c-c720-46c3-8534-2fcdd730040d', start_latitude: 37.761492, start_longitude: -122.423941, end_latitude: 37.775393, end_longitude: -122.417546});
    }).then(function(res) {
      should.not.exist(res);
    }).error(function(err) {
      should.exist(err);
      err.statusCode.should.equal(500);
      done();
    });
  });
});

describe('OAuth2 revokeTokenAsync', function() {
  it('should return error if token is empty', function(done) {
    uber.revokeTokenAsync('').then(function(res) {
      should.not.exist(res);
    }).error(function(err) {
      should.exist(err);
      done();
    });
  });

  it('should return error if token is not a string', function(done) {
    uber.revokeTokenAsync({a: 1}).then(function(res) {
      should.not.exist(res);
    }).error(function(err) {
      should.exist(err);
      done();
    });
  });

  it('should return success if token is revoked', function(done) {
    uber.revokeTokenAsync('my_access_token').then(function(res) {
      should.exist(res);
    }).error(function(err) {
      should.not.exist(err);
      done();
    });
    done();
  });
});
