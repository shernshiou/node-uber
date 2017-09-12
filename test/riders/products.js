var common = require("../common"),
    should = common.should,
    uber = common.uber,
    uber_sandbox = common.uber_sandbox,
    reply = common.jsonReply,
    ac = common.authCode;

describe('List', function() {
    it('should list all the product types', function(done) {
        uber.clearTokens();
        uber.products.getAllForLocation(3.1357169, 101.6881501, function(err, res) {
            should.not.exist(err);
            res.should.deep.equal(reply('riders/product'));
            done();
        });
    });

    it('should list all the product types by address', function(done) {
        uber.clearTokens();
        uber.products.getAllForAddress('A', function(err, res) {
            should.not.exist(err);
            res.should.deep.equal(reply('riders/product'));
            done();
        });
    });

    it('should return error if address is empty', function(done) {
        uber.clearTokens();
        uber.products.getAllForAddress(' ', function(err, res) {
            should.not.exist(res);
            err.message.should.equal('No coordinates found for: " "');
            done();
        });
    });

    it('should return error if address is null', function(done) {
        uber.clearTokens();
        uber.products.getAllForAddress(null, function(err, res) {
            should.not.exist(res);
            err.message.should.equal('Geocoder.geocode requires a location.');
            done();
        });
    });

    it('should return error if there is no required params', function(done) {
        uber.products.getAllForLocation('', null, function(err, res) {
            err.message.should.equal('Invalid latitude & longitude');
            done();
        });
    });
});

describe('Details', function() {
    it('should list all the product types', function(done) {
        uber.products.getByID('d4abaae7-f4d6-4152-91cc-77523e8165a4', function(err, res) {
            should.not.exist(err);
            res.should.deep.equal(reply('riders/productDetail'));
            done();
        });
    });

    it('should return error if there is no required params', function(done) {
        uber.products.getByID(null, function(err, res) {
            err.message.should.equal('Missing product_id parameter');
            done();
        });
    });
});

describe('Set surge multiplier in Sandbox mode', function() {
    it('should be able to set surge multiplier', function(done) {
        uber_sandbox.products.setSurgeMultiplierByID('d4abaae7-f4d6-4152-91cc-77523e8165a4', 2.2, function(err, res) {
            should.not.exist(err);
            done();
        });
    });

    it('should return error if there is no valid product_id', function(done) {
        uber_sandbox.products.setSurgeMultiplierByID(null, 2.2, function(err, res) {
            err.message.should.equal('Invalid product_id');
            done();
        });
    });

    it('should return error if there is no valid surge multiplier', function(done) {
        uber_sandbox.products.setSurgeMultiplierByID('d4abaae7-f4d6-4152-91cc-77523e8165a4', "2,2", function(err, res) {
            err.message.should.equal('Invalid surge multiplier');
            done();
        });
    });

    it('should return error if not in Sandbox mode', function(done) {
        uber.products.setSurgeMultiplierByID('d4abaae7-f4d6-4152-91cc-77523e8165a4', 2.2, function(err, res) {
            err.message.should.equal('Setting surge multiplier is only allowed in Sandbox mode');
            done();
        });
    });
});

describe('Set driver`s availability in Sandbox mode', function() {
    it('should be able to set driver`s availability', function(done) {
        uber_sandbox.products.setDriversAvailabilityByID('d4abaae7-f4d6-4152-91cc-77523e8165a4', false, function(err, res) {
            should.not.exist(err);
            done();
        });
    });

    it('should return error if there is no valid product_id', function(done) {
        uber_sandbox.products.setDriversAvailabilityByID(null, false, function(err, res) {
            err.message.should.equal('Invalid product_id');
            done();
        });
    });

    it('should return error if there is no valid boolean for driver`s availability', function(done) {
        uber_sandbox.products.setDriversAvailabilityByID('d4abaae7-f4d6-4152-91cc-77523e8165a4', null, function(err, res) {
            err.message.should.equal('Availability needs to be a boolean');
            done();
        });
    });

    it('should return error if not in Sandbox mode', function(done) {
        uber.products.setDriversAvailabilityByID('d4abaae7-f4d6-4152-91cc-77523e8165a4', false, function(err, res) {
            err.message.should.equal('Setting driver`s availability is only allowed in Sandbox mode');
            done();
        });
    });
});
