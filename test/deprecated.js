var common = require("./common"),
    nock = common.nock,
    should = common.should,
    uber = common.uber;

describe('Products Resource', function() {
    var productReply = {
        "products": [{
            "product_id": "327f7914-cd12-4f77-9e0c-b27bac580d03",
            "description": "The original Uber",
            "display_name": "UberBLACK",
            "capacity": 4,
            "image": "http://..."
        }, {
            "product_id": "955b92da-2b90-4f32-9586-f766cee43b99",
            "description": "Room for everyone",
            "display_name": "UberSUV",
            "capacity": 6,
            "image": "http://..."
        }, {
            "product_id": "622237e-c1e4-4523-b6e7-e1ac53f625ed",
            "description": "Taxi without the hassle",
            "display_name": "uberTAXI",
            "capacity": 4,
            "image": "http://..."
        }, {
            "product_id": "b5e74e96-5d27-4caf-83e9-54c030cd6ac5",
            "description": "The low-cost Uber",
            "display_name": "uberX",
            "capacity": 4,
            "image": "http://..."
        }]
    };

    before(function() {
        nock('https://api.uber.com')
            .get('/v1/products?server_token=SERVERTOKENSERVERTOKENSERVERTOKENSERVERT&latitude=3.1357&longitude=101.688')
            .reply(200, productReply);
    });

    it('should list down all the product types', function(done) {
        uber.products.list({
            latitude: 3.1357,
            longitude: 101.6880
        }, function(err, res) {
            should.not.exist(err);
            res.should.deep.equal(productReply);
            done();
        });
    });

    it('should return error if there is no required params', function(done) {
        uber.products.list({}, function(err, res) {
            err.message.should.equal('Invalid latitude & longitude');
            done();
        });
    });
});

describe('Payment Resource', function() {
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
                "description": "***53",
            }, {
                "payment_method_id": "f33847de-8113-4587-c307-51c2d13a823c",
                "type": "alipay",
                "description": "ga***@uber.com",
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

        nock('https://api.uber.com')
            .get('/v1/payment-methods?access_token=EE1IDxytP04tJ767GbjH7ED9PpGmYvL')
            .reply(200, paymentMethodsReply);
    });

    it('should list the payment methods after authentication', function(done) {
        uber.authorization({
                authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
            },
            function(err, accessToken, refreshToken) {
                uber.payment.methods(function(err, res) {
                    should.not.exist(err);
                    res.should.deep.equal(paymentMethodsReply);
                    done();
                });
            });
    });

    it('should return invalid access token error when no token found', function(done) {
        uber.authorization({
                authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
            },
            function(err, accessToken, refreshToken) {
                uber.access_token = '';
                uber.payment.methods(function(err, res) {
                    err.message.should.equal('Invalid access token');
                    done();
                });
            });
    });
});

describe('Places Resource', function() {
    var tokenResponse = {
            "access_token": "EE1IDxytP04tJ767GbjH7ED9PpGmYvL",
            "token_type": "Bearer",
            "expires_in": 2592000,
            "refresh_token": "Zx8fJ8qdSRRseIVlsGgtgQ4wnZBehr",
            "scope": "profile history"
        },
        placesHomeReply = {
            "address": "685 Market St, San Francisco, CA 94103, USA"
        },
        placesWorkReply = {
            "address": "1455 Market St, San Francisco, CA 94103, USA"
        };

    describe('Home Place', function() {
        before(function() {
            nock('https://login.uber.com')
                .post('/oauth/token')
                .times(3)
                .reply(200, tokenResponse);

            nock('https://api.uber.com')
                .get('/v1/places/home?access_token=EE1IDxytP04tJ767GbjH7ED9PpGmYvL')
                .reply(200, placesHomeReply);
        });

        it('should list the home address after authentication', function(done) {
            uber.authorization({
                    authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
                },
                function(err, accessToken, refreshToken) {
                    uber.places.home(function(err, res) {
                        should.not.exist(err);
                        res.should.deep.equal(placesHomeReply);
                        done();
                    });
                });
        });

        it('should return invalid access token error when no token found', function(done) {
            uber.authorization({
                    authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
                },
                function(err, accessToken, refreshToken) {
                    uber.access_token = '';
                    uber.places.home(function(err, res) {
                        err.message.should.equal('Invalid access token');
                        done();
                    });
                });
        });

    });

    describe('Work Place', function() {
        before(function() {
            nock('https://login.uber.com')
                .post('/oauth/token')
                .times(3)
                .reply(200, tokenResponse);

            nock('https://api.uber.com')
                .get('/v1/places/work?access_token=EE1IDxytP04tJ767GbjH7ED9PpGmYvL')
                .reply(200, placesWorkReply);
        });

        it('should list the work address after authentication', function(done) {
            uber.authorization({
                    authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
                },
                function(err, accessToken, refreshToken) {
                    uber.places.work(function(err, res) {
                        should.not.exist(err);
                        res.should.deep.equal(placesWorkReply);
                        done();
                    });
                });
        });

        it('should return invalid access token error when no token found', function(done) {
            uber.authorization({
                    authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
                },
                function(err, accessToken, refreshToken) {
                    uber.access_token = '';
                    uber.places.home(function(err, res) {
                        err.message.should.equal('Invalid access token');
                        done();
                    });
                });
        });

    });
});

describe('Estimates Resource', function() {
    var priceReply = {
            "prices": [{
                "product_id": "08f17084-23fd-4103-aa3e-9b660223934b",
                "currency_code": "USD",
                "display_name": "UberBLACK",
                "estimate": "$23-29",
                "low_estimate": 23,
                "high_estimate": 29,
                "surge_multiplier": 1
            }, {
                "product_id": "9af0174c-8939-4ef6-8e91-1a43a0e7c6f6",
                "currency_code": "USD",
                "display_name": "UberSUV",
                "estimate": "$36-44",
                "low_estimate": 36,
                "high_estimate": 44,
                "surge_multiplier": 1.25
            }, {
                "product_id": "aca52cea-9701-4903-9f34-9a2395253acb",
                "currency_code": null,
                "display_name": "uberTAXI",
                "estimate": "Metered",
                "low_estimate": null,
                "high_estimate": null,
                "surge_multiplier": 1
            }, {
                "product_id": "a27a867a-35f4-4253-8d04-61ae80a40df5",
                "currency_code": "USD",
                "display_name": "uberX",
                "estimate": "$15",
                "low_estimate": 15,
                "high_estimate": 15,
                "surge_multiplier": 1
            }]
        },
        timeReply = {
            "times": [{
                "product_id": "5f41547d-805d-4207-a297-51c571cf2a8c",
                "display_name": "UberBLACK",
                "estimate": 410
            }, {
                "product_id": "694558c9-b34b-4836-855d-821d68a4b944",
                "display_name": "UberSUV",
                "estimate": 535
            }, {
                "product_id": "65af3521-a04f-4f80-8ce2-6d88fb6648bc",
                "display_name": "uberTAXI",
                "estimate": 294
            }, {
                "product_id": "17b011d3-65be-421d-adf6-a5480a366453",
                "display_name": "uberX",
                "estimate": 288
            }]
        };

    describe('Price Estimates', function() {
        before(function() {
            nock('https://api.uber.com')
                .get('/v1/estimates/price?server_token=SERVERTOKENSERVERTOKENSERVERTOKENSERVERT&' +
                    'start_latitude=3.1357&start_longitude=101.688&end_latitude=3.0833&end_longitude=101.65&seat_count=2')
                .reply(200, priceReply);
        });

        it('should list all the price estimates from server', function(done) {
            uber.estimates.price({
                start_latitude: 3.1357,
                start_longitude: 101.6880,
                end_latitude: 3.0833,
                end_longitude: 101.6500
            }, function(err, res) {
                should.not.exist(err);
                res.should.deep.equal(priceReply);
                done();
            });
        });

        it('should return error if there is no required params', function(done) {
            uber.estimates.price({}, function(err, res) {
                err.message.should.equal('Invalid starting point latitude & longitude');
                done();
            });
        });
    });

    describe('Time Estimates', function() {
        before(function() {
            nock('https://api.uber.com')
                .get('/v1/estimates/time?server_token=SERVERTOKENSERVERTOKENSERVERTOKENSERVERT&' +
                    'start_latitude=3.1357&start_longitude=101.688')
                .reply(200, timeReply);
        });

        it('should list all the price estimates from server', function(done) {
            uber.estimates.time({
                start_latitude: 3.1357,
                start_longitude: 101.6880
            }, function(err, res) {
                should.not.exist(err);
                res.should.deep.equal(timeReply);
                done();
            });
        });

        it('should return error if there is no required params', function(done) {
            uber.estimates.price({}, function(err, res) {
                err.message.should.equal('Invalid starting point latitude & longitude');
                done();
            });
        });
    });
});

describe('User Resource', function() {
    var tokenResponse = {
            "access_token": "EE1IDxytP04tJ767GbjH7ED9PpGmYvL",
            "token_type": "Bearer",
            "expires_in": 2592000,
            "refresh_token": "Zx8fJ8qdSRRseIVlsGgtgQ4wnZBehr",
            "scope": "profile history"
        },
        profileReply = {
            "first_name": "Uber",
            "last_name": "Developer",
            "email": "developer@uber.com",
            "picture": "https://...",
            "promo_code": "teypo"
        },
        historyReply = {
            "offset": 0,
            "limit": 1,
            "count": 5,
            "history": [{
                "status": "completed",
                "distance": 1.64691465,
                "request_time": 1428876188,
                "start_time": 1428876374,
                "start_city": {
                    "display_name": "San Francisco",
                    "latitude": 37.7749295,
                    "longitude": -122.4194155
                },
                "end_time": 1428876927,
                "request_id": "37d57a99-2647-4114-9dd2-c43bccf4c30b",
                "product_id": "a1111c8c-c720-46c3-8534-2fcdd730040d"
            }, ]
        };

    describe('User Profile', function() {
        before(function() {
            nock('https://login.uber.com')
                .post('/oauth/token')
                .times(3)
                .reply(200, tokenResponse);

            nock('https://api.uber.com')
                .get('/v1/me?access_token=EE1IDxytP04tJ767GbjH7ED9PpGmYvL')
                .times(2)
                .reply(200, profileReply);
        });

        it('should get user profile after authentication', function(done) {
            uber.authorization({
                    authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
                },
                function(err, accessToken, refreshToken) {
                    uber.user.profile(function(err, res) {
                        should.not.exist(err);
                        res.should.deep.equal(profileReply);
                        done();
                    });
                });
        });

        it('should get user profile after authentication by explicitly passing access token', function(done) {
            uber.authorization({
                    authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
                },
                function(err, accessToken, refreshToken) {
                    uber.user.profile(accessToken, function(err, res) {
                        should.not.exist(err);
                        res.should.deep.equal(profileReply);
                        done();
                    });
                });
        });

        it('should return invalid access token error when no token found', function(done) {
            uber.authorization({
                    authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
                },
                function(err, accessToken, refreshToken) {
                    uber.access_token = '';
                    uber.user.profile(function(err, res) {
                        err.message.should.equal('Invalid access token');
                        done();
                    });
                });
        });
    });

    describe('User History', function() {
        before(function() {
            nock('https://login.uber.com')
                .post('/oauth/token')
                .times(3)
                .reply(200, tokenResponse);

            nock('https://api.uber.com')
                .get(function(uri) {
                    var parts = uri.split('/v1.2/history?access_token=EE1IDxytP04tJ767GbjH7ED9PpGmYvL&offset=0&limit=');
                    if (parts.length !== 2) {
                        return false;
                    }

                    // range should be between 1 and 50
                    return (parts[1] > 0 && parts[1] <= 50);
                })
                .times(4)
                .reply(200, historyReply);
        });

        it('should get user activity after authentication', function(done) {
            uber.authorization({
                    authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
                },
                function(err, accessToken, refreshToken) {
                    uber.user.activity({
                        offset: 0,
                        limit: 5
                    }, function(err, res) {
                        should.not.exist(err);
                        res.should.deep.equal(historyReply);
                        done();
                    });
                });
        });

        it('should get user activity after authentication, even with a too high limit', function(done) {
            uber.authorization({
                    authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
                },
                function(err, accessToken, refreshToken) {
                    uber.user.activity({
                        offset: 0,
                        limit: 99 //should become 50
                    }, function(err, res) {
                        should.not.exist(err);
                        res.should.deep.equal(historyReply);
                        done();
                    });
                });
        });

        it('should get user activity after authentication without any parameters', function(done) {
            uber.authorization({
                    authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
                },
                function(err, accessToken, refreshToken) {
                    uber.user.activity({}, function(err, res) {
                        should.not.exist(err);
                        res.should.deep.equal(historyReply);
                        done();
                    });
                });
        });

        it('should get user activity after authentication by explicitly passing access token', function(done) {
            uber.authorization({
                    authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
                },
                function(err, accessToken, refreshToken) {
                    uber.user.activity({
                            offset: 0,
                            limit: 5
                        },
                        accessToken,
                        function(err, res) {
                            should.not.exist(err);
                            res.should.deep.equal(historyReply);
                            done();
                        });
                });
        });

        it('should return invalid access token error when no token found', function(done) {
            uber.authorization({
                    authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
                },
                function(err, accessToken, refreshToken) {
                    uber.access_token = '';
                    uber.user.activity({}, function(err, res) {
                        err.message.should.equal('Invalid access token');
                        done();
                    });
                });
        });
    });
});
