var chai = require('chai')
  , nock = require('nock')
  , request = require('superagent')
  , should = chai.should()
  , qs = require('querystring')
  , Uber = require('../lib/Uber');

var key = {
    "client_id": "CLIENTIDCLIENTIDCLIENTIDCLIENT",
    "client_secret": "CLIENTSECRETCLIENTSECRETCLIENTSECRETCLIE",
    "server_token": "SERVERTOKENSERVERTOKENSERVERTOKENSERVERT",
    "redirect_uri": "http://localhost/callback",
    "name": "nodejs uber wrapper"
  };

describe('Uber client general test', function () {
  var uber = {};
  it('should load the key from a key.json', function (done) {
    key.should.have.property('client_id');
    key.should.have.property('client_secret');
    key.should.have.property('server_token');
    key.should.have.property('redirect_uri');
    key.should.have.property('name');
    done();
  });

  it('should initiate Uber client with the key', function (done) {
    uber = new Uber(key);
    uber.should.have.property('defaults');
    uber.defaults.client_id.should.equal(key.client_id);
    uber.defaults.client_secret.should.equal(key.client_secret);
    uber.defaults.server_token.should.equal(key.server_token);
    uber.defaults.redirect_uri.should.equal(key.redirect_uri);
    uber.defaults.base_url.should.equal('https://api.uber.com/v1');
    uber.defaults.authorize_url.should.equal('https://login.uber.com/oauth/authorize');
    uber.defaults.access_token_url.should.equal('https://login.uber.com/oauth/token');
    uber.should.have.property('oauth2');
    done();
  });
});

describe('OAuth2 authorization methods', function () {
  var uber = new Uber(key);
  describe('OAuth2 authorization url', function () {
    it('generate OAuth2 correct authorization url', function (done) {
      var url = uber.getAuthorizeUrl(['profile'])
        , sampleUrl = uber.defaults.authorize_url + '?' 
          + qs.stringify({
            response_type: 'code',
            redirect_uri: uber.defaults.redirect_uri,
            scope: ['profile'].join(','),
            client_id: uber.defaults.client_id
          });
      url.should.equal(sampleUrl);
      done();
    });

    it('should return error if scope is not an array', function (done) {
      uber.getAuthorizeUrl().message.should.equal('Scope is not an array');
      done();
    });

    it('should return error if scope is not an empty array', function (done) {
      uber.getAuthorizeUrl([]).message.should.equal('Scope is empty');
      done();
    });
  });

  describe('Exchange authorization code into access token', function () {
    var tokenResponse = {
      "access_token": "EE1IDxytP04tJ767GbjH7ED9PpGmYvL",
      "token_type": "Bearer",
      "expires_in": 2592000,
      "refresh_token": "Zx8fJ8qdSRRseIVlsGgtgQ4wnZBehr",
      "scope": "profile history"
    };

    before(function () {
      nock('https://login.uber.com')
        .post('/oauth/token')
        .times(2)
        .reply(200, tokenResponse);
    });

    it('should able to get access token and refresh token using authorization code', function (done) {
      uber.authorization({ authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp' }, 
        function (err, access_token, refresh_token) {
          should.not.exist(err);
          access_token.should.equal(tokenResponse.access_token);
          refresh_token.should.equal(tokenResponse.refresh_token);
          uber.access_token.should.equal(tokenResponse.access_token);
          uber.refresh_token.should.equal(tokenResponse.refresh_token);
          done();
        });
    });

    it('should able to get access token and refresh token using refresh token', function (done) {
      uber.authorization({ refresh_token: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp' }, 
        function (err, access_token, refresh_token) {
          should.not.exist(err);
          access_token.should.equal(tokenResponse.access_token);
          refresh_token.should.equal(tokenResponse.refresh_token);
          uber.access_token.should.equal(tokenResponse.access_token);
          uber.refresh_token.should.equal(tokenResponse.refresh_token);
          done();
        });
    });

    it('should return error if there is no authorization_code or refresh_token', function (done) {
      uber.authorization({}, function (err, access_token, refresh_token) {
        err.message.should.equal('No authorization_code or refresh_token');
        done();
      });
    });
  });
});

describe('Products Resource', function () {
  var uber = new Uber(key)
    , productReply = {
        "products": [
          {
            "product_id": "327f7914-cd12-4f77-9e0c-b27bac580d03",
            "description": "The original Uber",
            "display_name": "UberBLACK",
            "capacity": 4,
            "image": "http://..."
          },
          {
            "product_id": "955b92da-2b90-4f32-9586-f766cee43b99",
            "description": "Room for everyone",
            "display_name": "UberSUV",
            "capacity": 6,
            "image": "http://..."
          },
          {
            "product_id": "622237e-c1e4-4523-b6e7-e1ac53f625ed",
            "description": "Taxi without the hassle",
            "display_name": "uberTAXI",
            "capacity": 4,
            "image": "http://..."
          },
          {
            "product_id": "b5e74e96-5d27-4caf-83e9-54c030cd6ac5",
            "description": "The low-cost Uber",
            "display_name": "uberX",
            "capacity": 4,
            "image": "http://..."
          }
        ]
      };

  describe('Products List', function () {
    before(function () {
      nock('https://api.uber.com')
        .get('/v1/products?server_token=SERVERTOKENSERVERTOKENSERVERTOKENSERVERT&latitude=3.1357&longitude=101.688')
        .reply(200, productReply);
    });

    it('should list down all the product types', function (done) {
      uber.products.list({ latitude: 3.1357, longitude: 101.6880 }, function (err, res) {
        should.not.exist(err);
        res.should.deep.equal(productReply);
        done();
      });
    });

    it('should return error if there is no required params', function (done) {
      uber.products.list({}, function (err, res) {
        err.message.should.equal('Invalid parameters');
        done();
      });
    });
  });
});

describe('Estimates Resource', function () {
  var uber = new Uber(key)
    , priceReply = {
        "prices": [
          {
            "product_id": "08f17084-23fd-4103-aa3e-9b660223934b",
            "currency_code": "USD",
            "display_name": "UberBLACK",
            "estimate": "$23-29",
            "low_estimate": 23,
            "high_estimate": 29,
            "surge_multiplier": 1
          },
          {
            "product_id": "9af0174c-8939-4ef6-8e91-1a43a0e7c6f6",
            "currency_code": "USD",
            "display_name": "UberSUV",
            "estimate": "$36-44",
            "low_estimate": 36,
            "high_estimate": 44,
            "surge_multiplier": 1.25
          },
          {
            "product_id": "aca52cea-9701-4903-9f34-9a2395253acb",
            "currency_code": null,
            "display_name": "uberTAXI",
            "estimate": "Metered",
            "low_estimate": null,
            "high_estimate": null,
            "surge_multiplier": 1
          },
          {
            "product_id": "a27a867a-35f4-4253-8d04-61ae80a40df5",
            "currency_code": "USD",
            "display_name": "uberX",
            "estimate": "$15",
            "low_estimate": 15,
            "high_estimate": 15,
            "surge_multiplier": 1
          }
        ]
      }
    , timeReply = {
        "times": [
          {
            "product_id": "5f41547d-805d-4207-a297-51c571cf2a8c",
            "display_name": "UberBLACK",
            "estimate": 410
          },
          {
            "product_id": "694558c9-b34b-4836-855d-821d68a4b944",
            "display_name": "UberSUV",
            "estimate": 535
          },
          {
            "product_id": "65af3521-a04f-4f80-8ce2-6d88fb6648bc",
            "display_name": "uberTAXI",
            "estimate": 294
          },
          {
            "product_id": "17b011d3-65be-421d-adf6-a5480a366453",
            "display_name": "uberX",
            "estimate": 288
          }
        ]
      };

  describe('Price Estimates', function () {
    before(function () {
      nock('https://api.uber.com')
        .get('/v1/estimates/price?server_token=SERVERTOKENSERVERTOKENSERVERTOKENSERVERT&' + 
          'start_latitude=3.1357&start_longitude=101.688&end_latitude=3.0833&end_longitude=101.65')
        .reply(200, priceReply);
    });

    it('should list all the price estimates from server', function (done) {
      uber.estimates.price({ 
        start_latitude: 3.1357, start_longitude: 101.6880, 
        end_latitude: 3.0833, end_longitude: 101.6500 }, function (err, res) {
          should.not.exist(err);
          res.should.deep.equal(priceReply);
          done();
        });
    });

    it('should return error if there is no required params', function (done) {
      uber.estimates.price({}, function (err, res) {
        err.message.should.equal('Invalid parameters');
        done();
      });
    });
  });

  describe('Time Estimates', function () {
    before(function () {
      nock('https://api.uber.com')
        .get('/v1/estimates/time?server_token=SERVERTOKENSERVERTOKENSERVERTOKENSERVERT&' +
          'start_latitude=3.1357&start_longitude=101.688&end_latitude=3.0833&end_longitude=101.65')
        .reply(200, timeReply);
    });

    it('should list all the price estimates from server', function (done) {
      uber.estimates.time({ 
        start_latitude: 3.1357, start_longitude: 101.6880, 
        end_latitude: 3.0833, end_longitude: 101.6500 }, function (err, res) {
          should.not.exist(err);
          res.should.deep.equal(timeReply);
          done();
        });
    });

    it('should return error if there is no required params', function (done) {
      uber.estimates.price({}, function (err, res) {
        err.message.should.equal('Invalid parameters');
        done();
      });
    });
  });
});

describe('User Resource', function () {
  var uber = new Uber(key)
    , tokenResponse = {
        "access_token": "EE1IDxytP04tJ767GbjH7ED9PpGmYvL",
        "token_type": "Bearer",
        "expires_in": 2592000,
        "refresh_token": "Zx8fJ8qdSRRseIVlsGgtgQ4wnZBehr",
        "scope": "profile history"
      }
    , profileReply = {
        "first_name": "Uber",
        "last_name": "Developer",
        "email": "developer@uber.com",
        "picture": "https://...",
        "promo_code": "teypo"
      };

  describe('User Profile', function () {
    before(function () {
      nock('https://login.uber.com')
        .post('/oauth/token')
        .times(3)
        .reply(200, tokenResponse);

      nock('https://api.uber.com')
        .get('/v1/me?access_token=EE1IDxytP04tJ767GbjH7ED9PpGmYvL')
        .times(2)
        .reply(200, profileReply);
    });

    it('should get user profile after authentication', function (done) {
      uber.authorization({ authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp' }, 
        function (err, accessToken, refreshToken) {
          uber.user.profile(function (err, res) {
            should.not.exist(err);
            res.should.deep.equal(profileReply);
            done();
          });
        });
    });

    it('should get user profile after authentication by explicitly passing access token', function (done) {
      uber.authorization({ authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp' }, 
        function (err, accessToken, refreshToken) {
          uber.user.profile(accessToken, function (err, res) {
            should.not.exist(err);
            res.should.deep.equal(profileReply);
            done();
          });
        });
    });

    it('should return invalid access token error when no token found', function (done) {
      uber.authorization({ authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp' }, 
        function (err, accessToken, refreshToken) {
          uber.access_token = '';
          uber.user.profile(function (err, res) {
            err.message.should.equal('Invalid access token');
            done();
          });
        });
    });
  });
});