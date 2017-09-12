var common = require("../common"),
    should = common.should,
    uber = common.uber,
    uber_sandbox = common.uber_sandbox,
    reply = common.jsonReply,
    ac = common.authCode,
    acNR = common.authCodeNoRequest,
    rPA = common.requestProductCreate,
    rPS = common.requestProductSurge,
    rPSOE = common.requestProductSomeOtherError;
describe('Current Request', function() {
    it('should return error for new request without authorization', function(done) {
        uber.clearTokens();
        uber.requests.create({
            "product_id": rPA,
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
                authorization_code: ac
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.requests.create({
                    "product_id": rPA,
                    "start_latitude": 37.761492,
                    "start_longitude": -122.423941,
                    "end_latitude": 37.775393,
                    "end_longitude": -122.417546
                }, function(err, res) {
                    should.not.exist(err);
                    res.should.deep.equal(reply('riders/requestCreate'));
                    done();
                });
            });
    });

    it('should create new request with address after authorization', function(done) {
        uber.authorization({
                authorization_code: ac
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.requests.create({
                    "product_id": rPA,
                    "startAddress": 'A',
                    "endAddress": 'B'
                }, function(err, res) {
                    should.not.exist(err);
                    res.should.deep.equal(reply('riders/requestCreate'));
                    done();
                });
            });
    });

    it('should return error for invalid start address', function(done) {
        uber.authorization({
                authorization_code: ac
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.requests.create({
                    "product_id": rPA,
                    "startAddress": ' ',
                    "endAddress": 'B'
                }, function(err, res) {
                    err.message.should.equal('No coordinates found for: " "');
                    done();
                });
            });
    });

    it('should return error for invalid end address', function(done) {
        uber.authorization({
                authorization_code: ac
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.requests.create({
                    "product_id": rPA,
                    "startAddress": 'A',
                    "endAddress": ' '
                }, function(err, res) {
                    err.message.should.equal('No coordinates found for: " "');
                    done();
                });
            });
    });

    it ('should return an error along with surge confirmation details if surge pricing is active', function(done) {
        uber.authorization({
                authorization_code: ac
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.requests.create({
                    "product_id": rPS,
                    "startAddress": 'A',
                    "endAddress": 'B'
                }, function(err, res) {
                    should.exist(err);
                    uber.isSurge(err).should.deep.equal(true);
                    err.surge_confirmation.should.have.property('href');
                    err.surge_confirmation.should.have.property('surge_confirmation_id');
                    err.surge_confirmation.should.have.property('multiplier');
                    done();
                });
            });
    });
    it ('should create ride request after user has accepted surge pricing', function(done) {
        uber.authorization({
                authorization_code: ac
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.requests.create({
                    "product_id": rPS,
                    "startAddress": 'A',
                    "endAddress": 'B'
                }, function(err, res) {
                    should.exist(err);
                    uber.isSurge(err).should.deep.equal(true);
                    should.exist(uber.currentRequestParameters.surge_confirmation_id);
                    uber.requests.acceptSurgeForLastRequest(function (err, res) {
                        should.not.exist(err);
                        res.should.deep.equal(reply('riders/requestCreate'));
                        done();
                    });
                });
            });
    });
    it ('should return an error if there is a blocker other than surge conflict', function(done) {
        uber.authorization({
                authorization_code: ac
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.requests.create({
                    "product_id": rPSOE,
                    "startAddress": 'A',
                    "endAddress": 'B'
                }, function(err, res) {
                    should.exist(err);
                    uber.isSurge(err).should.deep.equal(false);
                    done();
                });
            });
    });

    it('should return an error if there is no active surge request to accept', function(done) {
        uber.authorization({
                authorization_code: ac
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.requests.acceptSurgeForLastRequest(function(err, res) {
                    should.exist(err);
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
                authorization_code: ac
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.requests.getCurrent(function(err, res) {
                    should.not.exist(err);
                    res.should.deep.equal(reply('riders/requestAccept'));
                    done();
                });
            });
    });

    it('should return error for current request with missing scope', function(done) {
        uber.authorization({
                authorization_code: acNR
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.requests.getCurrent(function(err, res) {
                    err.message.should.equal('Required scope not found');
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

    it('should patch current request with new end address', function(done) {
        uber.requests.updateCurrent({
            endAddress: 'C'
        }, function(err, res) {
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
    it('should get estimates', function(done) {
        uber.requests.getEstimates({
            "product_id": rPA,
            "start_latitude": 37.761492,
            "start_longitude": -122.423941,
            "end_latitude": 37.775393,
            "end_longitude": -122.417546
        }, function(err, res) {
            should.not.exist(err);
            res.should.deep.equal(reply('riders/requestEstimate'));
            done();
        });
    });

    it('should get estimates for address', function(done) {
        uber.requests.getEstimates({
            "product_id": rPA,
            "startAddress": 'A',
            "endAddress": 'B'
        }, function(err, res) {
            should.not.exist(err);
            res.should.deep.equal(reply('riders/requestEstimate'));
            done();
        });
    });

    it('should return error for estimates for invalid start address', function(done) {
        uber.requests.getEstimates({
            "product_id": rPA,
            "startAddress": ' ',
            "endAddress": 'B'
        }, function(err, res) {
            err.message.should.equal('No coordinates found for: " "');
            done();
        });
    });

    it('should return error for estimates for invalid start address', function(done) {
        uber.requests.getEstimates({
            "product_id": rPA,
            "startAddress": 'A',
            "endAddress": ' '
        }, function(err, res) {
            err.message.should.equal('No coordinates found for: " "');
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
    it('should return error for getting request by ID without authorization', function(done) {
        uber.clearTokens();
        uber.requests.getByID('17cb78a7-b672-4d34-a288-a6c6e44d5315', function(err, res) {
            err.message.should.equal('Invalid access token');
            done();
        });
    });

    it('should get existing request by ID after authorization', function(done) {
        uber.authorization({
                authorization_code: ac
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.requests.getByID('17cb78a7-b672-4d34-a288-a6c6e44d5315', function(err, res) {
                    should.not.exist(err);
                    res.should.deep.equal(reply('riders/requestAccept'));
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
                authorization_code: ac
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.requests.updateByID('17cb78a7-b672-4d34-a288-a6c6e44d5315', {}, function(err, res) {
                    should.not.exist(err);
                    done();
                });
            });
    });

    it('should return eroor for patch by ID with invalid start address', function(done) {
        uber.authorization({
                authorization_code: ac
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.requests.updateByID('17cb78a7-b672-4d34-a288-a6c6e44d5315', {
                    startAddress: ' '
                }, function(err, res) {
                    err.message.should.equal('No coordinates found for: " "');
                    done();
                });
            });
    });

    it('should return eroor for patch by ID with invalid end address', function(done) {
        uber.authorization({
                authorization_code: ac
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.requests.updateByID('17cb78a7-b672-4d34-a288-a6c6e44d5315', {
                    endAddress: ' '
                }, function(err, res) {
                    err.message.should.equal('No coordinates found for: " "');
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
                authorization_code: ac
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
                authorization_code: ac
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
                authorization_code: ac
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
        it('should return error for get map without authorization', function(done) {
            uber.clearTokens();
            uber.requests.getMapByID('17cb78a7-b672-4d34-a288-a6c6e44d5315', function(err, res) {
                err.message.should.equal('Invalid access token');
                done();
            });
        });

        it('should get map after authorization', function(done) {
            uber.authorization({
                    authorization_code: ac
                },
                function(err, accessToken, refreshToken) {
                    should.not.exist(err);
                    uber.requests.getMapByID('17cb78a7-b672-4d34-a288-a6c6e44d5315', function(err, res) {
                        should.not.exist(err);
                        res.should.deep.equal(reply('riders/requestMap'));
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
                    authorization_code: ac
                },
                function(err, accessToken, refreshToken) {
                    should.not.exist(err);
                    uber.requests.getReceiptByID('17cb78a7-b672-4d34-a288-a6c6e44d5315', function(err, res) {
                        should.not.exist(err);
                        res.should.deep.equal(reply('riders/requestReceipt'));
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
