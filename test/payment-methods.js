var common = require("./common"),
    nock = common.nock,
    should = common.should,
    uber = common.uber;

var tokenResponse = {
        "access_token": "EE1IDxytP04tJ767GbjH7ED9PpGmYvL",
        "token_type": "Bearer",
        "expires_in": 2592000,
        "refresh_token": "Zx8fJ8qdSRRseIVlsGgtgQ4wnZBehr",
        "scope": "profile history request"
    },
    paymentMethodsReply = {
        "payment_methods": [{
            "payment_method_id": "5f384f7d-8323-4207-a297-51c571234a8c",
            "type": "baidu_wallet",
            "description": "***53"
        }, {
            "payment_method_id": "f33847de-8113-4587-c307-51c2d13a823c",
            "type": "alipay",
            "description": "ga***@uber.com"
        }, {
            "payment_method_id": "f43847de-8113-4587-c307-51c2d13a823c",
            "type": "visa",
            "description": "***23"
        }, {
            "payment_method_id": "f53847de-8113-4587-c307-51c2d13a823c",
            "type": "business_account",
            "description": "Late Night Ride"
        }],
        "last_used": "f53847de-8113-4587-c307-51c2d13a823c"
    };

before(function() {
    nock('https://login.uber.com')
        .post('/oauth/token')
        .times(3)
        .reply(200, tokenResponse);

    nock('https://api.uber.com', {
            reqheaders: {
                'Authorization': 'Bearer EE1IDxytP04tJ767GbjH7ED9PpGmYvL'
            }
        })
        .get('/v1/payment-methods')
        .reply(200, paymentMethodsReply);
});

it('should list the payment methods after authentication', function(done) {
    uber.authorization({
            authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
        },
        function(err, accessToken, refreshToken) {
            should.not.exist(err);
            uber.payment.getMethods(function(err, res) {
                should.not.exist(err);
                res.should.deep.equal(paymentMethodsReply);
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
