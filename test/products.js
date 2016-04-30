var common = require("./common"),
    nock = common.nock,
    should = common.should,
    uber = common.uber;

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
        nock('https://api.uber.com')
            .get('/v1/products?server_token=SERVERTOKENSERVERTOKENSERVERTOKENSERVERT&latitude=3.1357&longitude=101.688')
            .reply(200, productReply);
    });

    it('should list down all the product types', function(done) {
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
        nock('https://api.uber.com')
            .get('/v1/products/d4abaae7-f4d6-4152-91cc-77523e8165a4?server_token=SERVERTOKENSERVERTOKENSERVERTOKENSERVERT')
            .reply(200, uberBLACKReply);
    });

    it('should list down all the product types', function(done) {
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
