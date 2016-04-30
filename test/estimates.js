var common = require("./common"),
    nock = common.nock,
    should = common.should,
    uber = common.uber;

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

describe('Price', function() {
    before(function() {
        nock('https://api.uber.com')
            .get('/v1/estimates/price?server_token=SERVERTOKENSERVERTOKENSERVERTOKENSERVERT&' +
                'start_latitude=3.1357&start_longitude=101.688&end_latitude=3.0833&end_longitude=101.65&seat_count=2')
            .reply(200, priceReply);
    });

    it('should list all the price estimates from server', function(done) {
        uber.estimates.getPriceForRoute(3.1357, 101.6880, 3.0833, 101.6500,
            function(err, res) {
                should.not.exist(err);
                res.should.deep.equal(priceReply);
                done();
            });
    });

    it('should return error if there is no required params', function(done) {
        uber.estimates.getPriceForRoute(null, null, null, null, function(err, res) {
            err.message.should.equal('Invalid starting point latitude & longitude');
            done();
        });
    });
});

describe('Time', function() {
    before(function() {
        nock('https://api.uber.com')
            .get('/v1/estimates/time?server_token=SERVERTOKENSERVERTOKENSERVERTOKENSERVERT&' +
                'start_latitude=3.1357&start_longitude=101.688')
            .reply(200, timeReply);
    });

    it('should list all the price estimates from server', function(done) {
        uber.estimates.getETAForLocation(3.1357, 101.6880,
            function(err, res) {
                should.not.exist(err);
                res.should.deep.equal(timeReply);
                done();
            });
    });

    it('should return error if there is no required params', function(done) {
        uber.estimates.getETAForLocation(null, null, function(err, res) {
            err.message.should.equal('Invalid latitude & longitude');
            done();
        });
    });
});
