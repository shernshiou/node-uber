var common = require("./common"),
    nock = common.nock,
    should = common.should,
    uber = common.uber,
    uber_sandbox = common.uber_sandbox;

var uberBLACKReply = {
        "capacity": 4,
        "description": "The original Uber",
        "price_details": {
            "distance_unit": "mile",
            "cost_per_minute": 0.65,
            "service_fees": [],
            "minimum": 15.0,
            "cost_per_distance": 3.75,
            "base": 8.0,
            "cancellation_fee": 10.0,
            "currency_code": "USD"
        },
        "image": "http: //d1a3f4spazzrp4.cloudfront.net/car.jpg",
        "display_name": "UberBLACK",
        "product_id": "d4abaae7-f4d6-4152-91cc-77523e8165a4"
    },
    productReply = {
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

describe('List', function() {
    before(function() {
        nock('https://api.uber.com', {
                reqheaders: {
                    'Authorization': 'Token SERVERTOKENSERVERTOKENSERVERTOKENSERVERT'
                }
            })
            .get('/v1/products?latitude=3.1357&longitude=101.688')
            .reply(200, productReply);
    });

    it('should list all the product types', function(done) {
        uber.clearTokens();
        uber.products.getAllForLocation(3.1357, 101.6880, function(err, res) {
            should.not.exist(err);
            res.should.deep.equal(productReply);
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
    before(function() {
        nock('https://api.uber.com', {
                reqheaders: {
                    'Authorization': 'Token SERVERTOKENSERVERTOKENSERVERTOKENSERVERT'
                }
            })
            .get('/v1/products/d4abaae7-f4d6-4152-91cc-77523e8165a4')
            .reply(200, uberBLACKReply);
    });

    it('should list all the product types', function(done) {
        uber.products.getByID('d4abaae7-f4d6-4152-91cc-77523e8165a4', function(err, res) {
            should.not.exist(err);
            res.should.deep.equal(uberBLACKReply);
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
    before(function() {
        nock('https://sandbox-api.uber.com/')
            .put('/v1/sandbox/products/d4abaae7-f4d6-4152-91cc-77523e8165a4', {
                surge_multiplier: 2.2
            })
            .reply(204);
    });

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
    before(function() {
        nock('https://sandbox-api.uber.com/')
            .put('/v1/sandbox/products/d4abaae7-f4d6-4152-91cc-77523e8165a4', {
                drivers_available: false
            })
            .reply(204);
    });

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
