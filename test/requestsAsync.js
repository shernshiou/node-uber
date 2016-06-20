var common = require("./common"),
    should = common.should,
    uber = common.uber,
    uber_sandbox = common.uber_sandbox,
    reply = common.jsonReply,
    ac = common.authCode,
    acNR = common.authCodeNoRequest;

describe('Current Request', function() {
    it('should return error for new request without authorization', function(done) {
        uber.clearTokens();
        uber.requests.createAsync({
                "product_id": "a1111c8c-c720-46c3-8534-2fcdd730040d",
                "start_latitude": 37.761492,
                "start_longitude": -122.423941,
                "end_latitude": 37.775393,
                "end_longitude": -122.417546
            })
            .error(function(err) {
                err.message.should.equal('Invalid access token');
                done();
            });
    });

    it('should create new request after authorization', function(done) {
        uber.authorizationAsync({
                authorization_code: ac
            })
            .then(function() {
                return uber.requests.createAsync({
                    "product_id": "a1111c8c-c720-46c3-8534-2fcdd730040d",
                    "start_latitude": 37.761492,
                    "start_longitude": -122.423941,
                    "end_latitude": 37.775393,
                    "end_longitude": -122.417546
                });
            })
            .then(function(res) {
                res.should.deep.equal(reply('requestCreate'));
                done();
            });
    });

    it('should create new request with address after authorization', function(done) {
        uber.authorizationAsync({
                authorization_code: ac
            })
            .then(function() {
                return uber.requests.createAsync({
                    "product_id": "a1111c8c-c720-46c3-8534-2fcdd730040d",
                    "startAddress": 'A',
                    "endAddress": 'B'
                });
            })
            .then(function(res) {
                res.should.deep.equal(reply('requestCreate'));
                done();
            });
    });

    it('should return error for invalid start address', function(done) {
        uber.authorizationAsync({
                authorization_code: ac
            })
            .then(function() {
                return uber.requests.createAsync({
                    "product_id": "a1111c8c-c720-46c3-8534-2fcdd730040d",
                    "startAddress": ' ',
                    "endAddress": 'B'
                });
            })
            .error(function(err) {
                err.message.should.equal('No coordinates found for: " "');
                done();
            });
    });

    it('should return error for invalid start address', function(done) {
        uber.authorizationAsync({
                authorization_code: ac
            })
            .then(function() {
                return uber.requests.createAsync({
                    "product_id": "a1111c8c-c720-46c3-8534-2fcdd730040d",
                    "startAddress": 'A',
                    "endAddress": ' '
                });
            })
            .error(function(err) {
                err.message.should.equal('No coordinates found for: " "');
                done();
            });
    });

    it('should return error if there is no required params for POST', function(done) {
        uber.requests.createAsync(null)
            .error(function(err) {
                err.message.should.equal('Invalid parameters');
                done();
            });
    });

    it('should return error for getting current request without authorization', function(done) {
        uber.clearTokens();
        uber.requests.getCurrentAsync()
            .error(function(err) {
                err.message.should.equal('Invalid access token');
                done();
            });
    });

    it('should get current request after authorization', function(done) {
        uber.authorizationAsync({
                authorization_code: ac
            })
            .then(function() {
                return uber.requests.getCurrentAsync();
            })
            .then(function(res) {
                res.should.deep.equal(reply('requestAccept'));
                done();
            });
    });

    it('should return error for current request with missing scope', function(done) {
        uber.authorizationAsync({
                authorization_code: acNR
            })
            .then(function() {
                return uber.requests.getCurrentAsync();
            })
            .error(function(err) {
                err.message.should.equal('Required scope not found');
                done();
            });
    });

    it('should patch current request', function(done) {
        uber.requests.updateCurrentAsync({})
            .then(function(res) {
                done();
            });
    });

    it('should patch current request with new end address', function(done) {
        uber.requests.updateCurrentAsync({
            endAddress: 'C'
        }).then(function(res) {
            done();
        });
    });

    it('should return error in case of missing parameters for patch', function(done) {
        uber.requests.updateCurrentAsync(null)
            .error(function(err) {
                err.message.should.equal('Invalid parameters');
                done();
            });
    });

    it('should delete current request', function(done) {
        uber.requests.deleteCurrentAsync()
            .then(function(res) {
                done();
            });
    });
});

describe('Estimate', function() {
    it('should get estimates', function(done) {
        uber.requests.getEstimatesAsync({
                "product_id": "a1111c8c-c720-46c3-8534-2fcdd730040d",
                "start_latitude": 37.761492,
                "start_longitude": -122.423941,
                "end_latitude": 37.775393,
                "end_longitude": -122.417546
            })
            .then(function(res) {
                res.should.deep.equal(reply('requestEstimate'));
                done();
            });
    });

    it('should get estimates for address', function(done) {
        uber.requests.getEstimatesAsync({
                "product_id": "a1111c8c-c720-46c3-8534-2fcdd730040d",
                "startAddress": 'A',
                "endAddress": 'B'
            })
            .then(function(res) {
                res.should.deep.equal(reply('requestEstimate'));
                done();
            });
    });

    it('should return error for estimates for invalid start address', function(done) {
        uber.requests.getEstimatesAsync({
                "product_id": "a1111c8c-c720-46c3-8534-2fcdd730040d",
                "startAddress": ' ',
                "endAddress": 'B'
            })
            .error(function(err) {
                err.message.should.equal('No coordinates found for: " "');
                done();
            });
    });

    it('should return error for estimates for invalid end address', function(done) {
        uber.requests.getEstimatesAsync({
                "product_id": "a1111c8c-c720-46c3-8534-2fcdd730040d",
                "startAddress": 'A',
                "endAddress": ' '
            })
            .error(function(err) {
                err.message.should.equal('No coordinates found for: " "');
                done();
            });
    });

    it('should return error if there is no required params for estimates', function(done) {
        uber.requests.getEstimatesAsync(null)
            .error(function(err) {
                err.message.should.equal('Invalid parameters');
                done();
            });
    });

});

describe('By Request ID', function() {
    it('should return error for getting request by ID without authorization', function(done) {
        uber.clearTokens();
        uber.requests.getByIDAsync('17cb78a7-b672-4d34-a288-a6c6e44d5315')
            .error(function(err) {
                err.message.should.equal('Invalid access token');
                done();
            });
    });

    it('should get existing request by ID after authorization', function(done) {
        uber.authorizationAsync({
                authorization_code: ac
            })
            .then(function() {
                return uber.requests.getByIDAsync('17cb78a7-b672-4d34-a288-a6c6e44d5315');
            })
            .then(function(res) {
                res.should.deep.equal(reply('requestAccept'));
                done();
            });
    });

    it('should return error in case of missing request ID', function(done) {
        uber.requests.getByIDAsync(null)
            .error(function(err) {
                err.message.should.equal('Invalid request_id');
                done();
            });
    });

    it('should return error in case of unknown request ID', function(done) {
        uber.requests.getByIDAsync('abcd')
            .error(function(err) {
                err.statusCode.should.equal(404);
                done();
            });
    });

    it('should return error for patching an existing request without authorization', function(done) {
        uber.clearTokens();
        uber.requests.updateByIDAsync('17cb78a7-b672-4d34-a288-a6c6e44d5315', {})
            .error(function(err) {
                err.message.should.equal('Invalid access token');
                done();
            });
    });

    it('should patch an existing request by ID after authorization', function(done) {
        uber.authorizationAsync({
                authorization_code: ac
            })
            .then(function() {
                return uber.requests.updateByIDAsync('17cb78a7-b672-4d34-a288-a6c6e44d5315', {});
            })
            .then(function(res) {
                done();
            });
    });

    it('should return eroor for patch by ID with invalid start address', function(done) {
        uber.authorizationAsync({
                authorization_code: ac
            })
            .then(function() {
                return uber.requests.updateByIDAsync('17cb78a7-b672-4d34-a288-a6c6e44d5315', {
                    startAddress: ' '
                });
            })
            .error(function(err) {
                err.message.should.equal('No coordinates found for: " "');
                done();
            });
    });

    it('should return eroor for patch by ID with invalid end address', function(done) {
        uber.authorizationAsync({
                authorization_code: ac
            })
            .then(function() {
                return uber.requests.updateByIDAsync('17cb78a7-b672-4d34-a288-a6c6e44d5315', {
                    endAddress: ' '
                });
            })
            .error(function(err) {
                err.message.should.equal('No coordinates found for: " "');
                done();
            });
    });

    it('should return error in case of missing request ID for patch', function(done) {
        uber.requests.updateByIDAsync(null, {})
            .error(function(err) {
                err.message.should.equal('Invalid request_id');
                done();
            });
    });

    it('should return error in case of invalid request ID for patch', function(done) {
        uber.requests.updateByIDAsync('abcd', {})
            .error(function(err) {
                should.exist(err);
                done();
            });
    });

    it('should return error in case of missing parameters for patch', function(done) {
        uber.requests.updateByIDAsync('17cb78a7-b672-4d34-a288-a6c6e44d5315', null)
            .error(function(err) {
                err.message.should.equal('Invalid parameters');
                done();
            });
    });

    it('should return error for putting an existing request without authorization', function(done) {
        uber_sandbox.clearTokens();
        uber_sandbox.requests.setStatusByIDAsync('17cb78a7-b672-4d34-a288-a6c6e44d5315', 'accepted')
            .error(function(err) {
                err.message.should.equal('Invalid access token');
                done();
            });
    });

    it('should return error for putting an existing request in production mode', function(done) {
        uber.authorizationAsync({
                authorization_code: ac
            })
            .then(function() {
                return uber.requests.setStatusByIDAsync('17cb78a7-b672-4d34-a288-a6c6e44d5315', 'accepted');
            })
            .error(function(err) {
                err.message.should.equal('PUT method for requests is only allowed in Sandbox mode');
                done();
            });
    });

    it('should accept an existing request by ID after authorization', function(done) {
        uber_sandbox.authorizationAsync({
                authorization_code: ac
            })
            .then(function() {
                return uber_sandbox.requests.setStatusByIDAsync('17cb78a7-b672-4d34-a288-a6c6e44d5315', 'accepted');
            })
            .then(function(res) {
                done();
            });
    });

    it('should return error in case of missing request ID for put', function(done) {
        uber_sandbox.requests.setStatusByIDAsync(null, 'accepted')
            .error(function(err) {
                err.message.should.equal('Invalid request_id');
                done();
            });
    });

    it('should return error in case of invalid request ID for put', function(done) {
        uber_sandbox.requests.setStatusByIDAsync('abcd', 'accepted')
            .error(function(err) {
                should.exist(err);
                done();
            });
    });

    it('should return error in case of missing parameters for put', function(done) {
        uber_sandbox.requests.setStatusByIDAsync('17cb78a7-b672-4d34-a288-a6c6e44d5315', null)
            .error(function(err) {
                err.message.should.equal('Invalid status');
                done();
            });
    });

    it('should return error for deleting an existing request by ID without authorization', function(done) {
        uber.clearTokens();
        uber.requests.deleteByIDAsync('17cb78a7-b672-4d34-a288-a6c6e44d5315')
            .error(function(err) {
                err.message.should.equal('Invalid access token');
                done();
            });
    });

    it('should delete an existing request by ID after authorization', function(done) {
        uber.authorizationAsync({
                authorization_code: ac
            })
            .then(function() {
                return uber.requests.deleteByIDAsync('17cb78a7-b672-4d34-a288-a6c6e44d5315');
            })
            .then(function(res) {
                done();
            });
    });

    it('should return error in case of missing request ID for delete', function(done) {
        uber.requests.deleteByIDAsync(null)
            .error(function(err) {
                err.message.should.equal('Invalid request_id');
                done();
            });
    });

    describe('Request Details', function() {
        it('should return error for get map without authorization', function(done) {
            uber.clearTokens();
            uber.requests.getMapByIDAsync('17cb78a7-b672-4d34-a288-a6c6e44d5315')
                .error(function(err) {
                    err.message.should.equal('Invalid access token');
                    done();
                });
        });

        it('should get map after authorization', function(done) {
            uber.authorizationAsync({
                    authorization_code: ac
                })
                .then(function() {
                    return uber.requests.getMapByIDAsync('17cb78a7-b672-4d34-a288-a6c6e44d5315');
                })
                .then(function(res) {
                    res.should.deep.equal(reply('requestMap'));
                    done();
                });
        });

        it('should return error in case of missing request ID for map', function(done) {
            uber.requests.getMapByIDAsync(null)
                .error(function(err) {
                    err.message.should.equal('Invalid request_id');
                    done();
                });
        });

        it('should return error for get receipt without authorization', function(done) {
            uber.clearTokens();
            uber.requests.getReceiptByIDAsync('17cb78a7-b672-4d34-a288-a6c6e44d5315')
                .error(function(err) {
                    err.message.should.equal('Invalid access token');
                    done();
                });
        });

        it('should get receipt after authorization', function(done) {
            uber.authorizationAsync({
                    authorization_code: ac
                })
                .then(function() {
                    return uber.requests.getReceiptByIDAsync('17cb78a7-b672-4d34-a288-a6c6e44d5315');
                })
                .then(function(res) {
                    res.should.deep.equal(reply('requestReceipt'));
                    done();
                });
        });

        it('should return error in case of missing request ID for receipt', function(done) {
            uber.requests.getReceiptByIDAsync(null)
                .error(function(err) {
                    err.message.should.equal('Invalid request_id');
                    done();
                });
        });
    });
});
