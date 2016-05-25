var common = require("./common"),
    nock = common.nock,
    should = common.should,
    uber = common.uber,
    uber_sandbox = common.uber_sandbox;

var tokenResponse = {
        "access_token": "EE1IDxytP04tJ767GbjH7ED9PpGmYvL",
        "token_type": "Bearer",
        "expires_in": 2592000,
        "refresh_token": "Zx8fJ8qdSRRseIVlsGgtgQ4wnZBehr",
        "scope": "profile history"
    },
    acceptedRequestReply = {
        "request_id": "17cb78a7-b672-4d34-a288-a6c6e44d5315",
        "status": "accepted",
        "location": {
            "latitude": 37.7886532015,
            "longitude": -122.3961987534,
            "bearing": 135
        },
        "pickup": {
            "latitude": 37.7872486012,
            "longitude": -122.4026315287,
            "eta": 5
        },
        "destination": {
            "latitude": 37.7766874,
            "longitude": -122.394857,
            "eta": 19
        },
        "driver": {
            "phone_number": "(555)555-5555",
            "rating": 5,
            "picture_url": "https:\/\/d1w2poirtb3as9.cloudfront.net\/img.jpeg",
            "name": "Bob"
        },
        "vehicle": {
            "make": "Bugatti",
            "model": "Veyron",
            "license_plate": "I<3Uber",
            "picture_url": "https:\/\/d1w2poirtb3as9.cloudfront.net\/car.jpeg"
        },
        "surge_multiplier": 1.0,
        "eta": 5
    },
    createRequestReply = {
        "request_id": "852b8fdd-4369-4659-9628-e122662ad257",
        "status": "processing",
        "vehicle": null,
        "driver": null,
        "location": null,
        "eta": 5,
        "surge_multiplier": null
    },
    estimateReply = {
        "price": {
            "surge_confirmation_href": "https:\/\/api.uber.com\/v1\/surge-confirmations\/7d604f5e",
            "high_estimate": 6,
            "surge_confirmation_id": "7d604f5e",
            "minimum": 5,
            "low_estimate": 5,
            "surge_multiplier": 1.2,
            "display": "$5-6",
            "currency_code": "USD"
        },
        "trip": {
            "distance_unit": "mile",
            "duration_estimate": 540,
            "distance_estimate": 2.1
        },
        "pickup_estimate": 2
    },
    mapReply = {
        "request_id": "b5512127-a134-4bf4-b1ba-fe9f48f56d9d",
        "href": "https://trip.uber.com/abc123"
    },
    receiptReply = {
        "request_id": "b5512127-a134-4bf4-b1ba-fe9f48f56d9d",
        "charges": [{
            "name": "Base Fare",
            "amount": "2.20",
            "type": "base_fare"
        }, {
            "name": "Distance",
            "amount": "2.75",
            "type": "distance"
        }, {
            "name": "Time",
            "amount": "3.57",
            "type": "time"
        }],
        "surge_charge": {
            "name": "Surge x1.5",
            "amount": "4.26",
            "type": "surge"
        },
        "charge_adjustments": [{
            "name": "Promotion",
            "amount": "-2.43",
            "type": "promotion"
        }, {
            "name": "Booking Fee",
            "amount": "1.00",
            "type": "booking_fee"
        }, {
            "name": "Rounding Down",
            "amount": "0.78",
            "type": "rounding_down"
        }],
        "normal_fare": "$8.52",
        "subtotal": "$12.78",
        "total_charged": "$5.92",
        "total_owed": null,
        "currency_code": "USD",
        "duration": "00:11:35",
        "distance": "1.49",
        "distance_label": "miles"
    };

describe('Current Request', function() {
    before(function() {
        nock('https://login.uber.com')
            .post('/oauth/token')
            .times(2)
            .reply(200, tokenResponse);
        nock('https://api.uber.com', {
                reqheaders: {
                    'Authorization': 'Bearer EE1IDxytP04tJ767GbjH7ED9PpGmYvL'
                }
            })
            .get('/v1/requests/current')
            .reply(200, acceptedRequestReply);
        nock('https://api.uber.com')
            .post('/v1/requests')
            .reply(200, createRequestReply);
        nock('https://api.uber.com')
            .patch('/v1/requests/current')
            .reply(204);
        nock('https://api.uber.com')
            .delete('/v1/requests/current')
            .reply(204);
    });

    it('should return error for new request without authorization', function(done) {
        uber.clearTokens();
        uber.requests.create({
            "product_id": "a1111c8c-c720-46c3-8534-2fcdd730040d",
            "start_latitude": 37.761492,
            "start_longitude": -122.423941,
            "end_latitude": 37.775393,
            "end_longitude": -122.417546
        }, function(err, res) {
            err.message.should.equal('Invalid access token');
            done();
        });
    });

    it('should create new request after authorization', function(done) {
        uber.authorization({
                authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.requests.create({
                    "product_id": "a1111c8c-c720-46c3-8534-2fcdd730040d",
                    "start_latitude": 37.761492,
                    "start_longitude": -122.423941,
                    "end_latitude": 37.775393,
                    "end_longitude": -122.417546
                }, function(err, res) {
                    should.not.exist(err);
                    res.should.deep.equal(createRequestReply);
                    done();
                });
            });
    });

    it('should return error if there is no required params for POST', function(done) {
        uber.requests.create(null, function(err, res) {
            err.message.should.equal('Invalid parameters');
            done();
        });
    });

    it('should return error for getting current request without authorization', function(done) {
        uber.clearTokens();
        uber.requests.getCurrent(function(err, res) {
            err.message.should.equal('Invalid access token');
            done();
        });
    });

    it('should get current request after authorization', function(done) {
        uber.authorization({
                authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.requests.getCurrent(function(err, res) {
                    should.not.exist(err);
                    res.should.deep.equal(acceptedRequestReply);
                    done();
                });
            });
    });

    it('should patch current request', function(done) {
        uber.requests.updateCurrent({}, function(err, res) {
            should.not.exist(err);
            done();
        });
    });

    it('should return error in case of missing parameters for patch', function(done) {
        uber.requests.updateCurrent(null, function(err, res) {
            err.message.should.equal('Invalid parameters');
            done();
        });
    });

    it('should delete current request', function(done) {
        uber.requests.deleteCurrent(function(err, res) {
            should.not.exist(err);
            done();
        });
    });
});

describe('Estimate', function() {
    before(function() {
        nock('https://api.uber.com')
            .post('/v1/requests/estimate')
            .reply(200, estimateReply);
    });

    it('should get estimates', function(done) {
        uber.requests.getEstimates({
            "product_id": "a1111c8c-c720-46c3-8534-2fcdd730040d",
            "start_latitude": 37.761492,
            "start_longitude": -122.423941,
            "end_latitude": 37.775393,
            "end_longitude": -122.417546
        }, function(err, res) {
            should.not.exist(err);
            res.should.deep.equal(estimateReply);
            done();
        });
    });

    it('should return error if there is no required params for estimates', function(done) {
        uber.requests.getEstimates(null, function(err, res) {
            err.message.should.equal('Invalid parameters');
            done();
        });
    });

});

describe('By Request ID', function() {
    before(function() {
        nock('https://login.uber.com')
            .post('/oauth/token')
            .times(4)
            .reply(200, tokenResponse);
        nock('https://api.uber.com', {
                reqheaders: {
                    'Authorization': 'Bearer EE1IDxytP04tJ767GbjH7ED9PpGmYvL'
                }
            })
            .get('/v1/requests/17cb78a7-b672-4d34-a288-a6c6e44d5315')
            .reply(200, acceptedRequestReply);
        nock('https://api.uber.com')
            .patch('/v1/requests/abcd')
            .reply(404, "Request could not be found");
        nock('https://api.uber.com')
            .get('/v1/requests/abcd')
            .reply(404, "Request could not be found");
        nock('https://api.uber.com')
            .patch('/v1/requests/17cb78a7-b672-4d34-a288-a6c6e44d5315')
            .times(2)
            .reply(204);
        nock('https://sandbox-api.uber.com/')
            .put('/v1/sandbox/requests/17cb78a7-b672-4d34-a288-a6c6e44d5315', {
                status: 'accepted'
            })
            .reply(204);
        nock('https://api.uber.com')
            .delete('/v1/requests/17cb78a7-b672-4d34-a288-a6c6e44d5315')
            .reply(204);
    });

    it('should return error for getting request by ID without authorization', function(done) {
        uber.clearTokens();
        uber.requests.getByID('17cb78a7-b672-4d34-a288-a6c6e44d5315', function(err, res) {
            err.message.should.equal('Invalid access token');
            done();
        });
    });

    it('should get existing request by ID after authorization', function(done) {
        uber.authorization({
                authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.requests.getByID('17cb78a7-b672-4d34-a288-a6c6e44d5315', function(err, res) {
                    should.not.exist(err);
                    res.should.deep.equal(acceptedRequestReply);
                    done();
                });
            });
    });

    it('should return error in case of missing request ID', function(done) {
        uber.requests.getByID(null, function(err, res) {
            err.message.should.equal('Invalid request_id');
            done();
        });
    });

    it('should return error in case of unknown request ID', function(done) {
        uber.requests.getByID('abcd', function(err, res) {
            should.exist(err);
            err.statusCode.should.equal(404);
            done();
        });
    });

    it('should return error for patching an existing request without authorization', function(done) {
        uber.clearTokens();
        uber.requests.updateByID('17cb78a7-b672-4d34-a288-a6c6e44d5315', {}, function(err, res) {
            err.message.should.equal('Invalid access token');
            done();
        });
    });

    it('should patch an existing request by ID after authorization', function(done) {
        uber.authorization({
                authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.requests.updateByID('17cb78a7-b672-4d34-a288-a6c6e44d5315', {}, function(err, res) {
                    should.not.exist(err);
                    done();
                });
            });
    });

    it('should return error in case of missing request ID for patch', function(done) {
        uber.requests.updateByID(null, {}, function(err, res) {
            err.message.should.equal('Invalid request_id');
            done();
        });
    });

    it('should return error in case of invalid request ID for patch', function(done) {
        uber.requests.updateByID('abcd', {}, function(err, res) {
            should.exist(err);
            done();
        });
    });

    it('should return error in case of missing parameters for patch', function(done) {
        uber.requests.updateByID('17cb78a7-b672-4d34-a288-a6c6e44d5315', null, function(err, res) {
            err.message.should.equal('Invalid parameters');
            done();
        });
    });

    it('should return error for putting an existing request without authorization', function(done) {
        uber_sandbox.clearTokens();
        uber_sandbox.requests.setStatusByID('17cb78a7-b672-4d34-a288-a6c6e44d5315', 'accepted', function(err, res) {
            err.message.should.equal('Invalid access token');
            done();
        });
    });

    it('should return error for putting an existing request in production mode', function(done) {
        uber.authorization({
                authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.requests.setStatusByID('17cb78a7-b672-4d34-a288-a6c6e44d5315', 'accepted', function(err, res) {
                    err.message.should.equal('PUT method for requests is only allowed in Sandbox mode');
                    done();
                });
            });
    });

    it('should accept an existing request by ID after authorization', function(done) {
        uber_sandbox.authorization({
                authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber_sandbox.requests.setStatusByID('17cb78a7-b672-4d34-a288-a6c6e44d5315', 'accepted', function(err, res) {
                    should.not.exist(err);
                    done();
                });
            });
    });

    it('should return error in case of missing request ID for put', function(done) {
        uber_sandbox.requests.setStatusByID(null, 'accepted', function(err, res) {
            err.message.should.equal('Invalid request_id');
            done();
        });
    });

    it('should return error in case of invalid request ID for put', function(done) {
        uber_sandbox.requests.setStatusByID('abcd', 'accepted', function(err, res) {
            should.exist(err);
            done();
        });
    });

    it('should return error in case of missing parameters for put', function(done) {
        uber_sandbox.requests.setStatusByID('17cb78a7-b672-4d34-a288-a6c6e44d5315', null, function(err, res) {
            err.message.should.equal('Invalid status');
            done();
        });
    });

    it('should return error for deleting an existing request by ID without authorization', function(done) {
        uber.clearTokens();
        uber.requests.deleteByID('17cb78a7-b672-4d34-a288-a6c6e44d5315', function(err, res) {
            err.message.should.equal('Invalid access token');
            done();
        });
    });

    it('should delete an existing request by ID after authorization', function(done) {
        uber.authorization({
                authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.requests.deleteByID('17cb78a7-b672-4d34-a288-a6c6e44d5315', function(err, res) {
                    should.not.exist(err);
                    done();
                });
            });
    });

    it('should return error in case of missing request ID for delete', function(done) {
        uber.requests.deleteByID(null, function(err, res) {
            err.message.should.equal('Invalid request_id');
            done();
        });
    });

    describe('Request Details', function() {
        before(function() {
            nock('https://login.uber.com')
                .post('/oauth/token')
                .times(2)
                .reply(200, tokenResponse);
            nock('https://api.uber.com', {
                    reqheaders: {
                        'Authorization': 'Bearer EE1IDxytP04tJ767GbjH7ED9PpGmYvL'
                    }
                })
                .get('/v1/requests/17cb78a7-b672-4d34-a288-a6c6e44d5315/map')
                .reply(200, mapReply);
            nock('https://api.uber.com', {
                    reqheaders: {
                        'Authorization': 'Bearer EE1IDxytP04tJ767GbjH7ED9PpGmYvL'
                    }
                })
                .get('/v1/requests/17cb78a7-b672-4d34-a288-a6c6e44d5315/receipt')
                .reply(200, receiptReply);
        });

        it('should return error for get map without authorization', function(done) {
            uber.clearTokens();
            uber.requests.getMapByID('17cb78a7-b672-4d34-a288-a6c6e44d5315', function(err, res) {
                err.message.should.equal('Invalid access token');
                done();
            });
        });

        it('should get map after authorization', function(done) {
            uber.authorization({
                    authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
                },
                function(err, accessToken, refreshToken) {
                    should.not.exist(err);
                    uber.requests.getMapByID('17cb78a7-b672-4d34-a288-a6c6e44d5315', function(err, res) {
                        should.not.exist(err);
                        res.should.deep.equal(mapReply);
                        done();
                    });
                });
        });

        it('should return error in case of missing request ID for map', function(done) {
            uber.requests.getMapByID(null, function(err, res) {
                err.message.should.equal('Invalid request_id');
                done();
            });
        });

        it('should return error for get receipt without authorization', function(done) {
            uber.clearTokens();
            uber.requests.getReceiptByID('17cb78a7-b672-4d34-a288-a6c6e44d5315', function(err, res) {
                err.message.should.equal('Invalid access token');
                done();
            });
        });

        it('should get receipt after authorization', function(done) {
            uber.authorization({
                    authorization_code: 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp'
                },
                function(err, accessToken, refreshToken) {
                    should.not.exist(err);
                    uber.requests.getReceiptByID('17cb78a7-b672-4d34-a288-a6c6e44d5315', function(err, res) {
                        should.not.exist(err);
                        res.should.deep.equal(receiptReply);
                        done();
                    });
                });
        });

        it('should return error in case of missing request ID for receipt', function(done) {
            uber.requests.getReceiptByID(null, function(err, res) {
                err.message.should.equal('Invalid request_id');
                done();
            });
        });
    });
});
