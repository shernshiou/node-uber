var common = require("./common"),
    nock = common.nock,
    jp = common.jsonReplyPath,
    key = common.key,
    jr = common.jsonReply,
    ac = common.authCode,
    acNP = common.authCodeNoProfile,
    acNPl = common.authCodeNoPlaces,
    acNR = common.authCodeNoRequest;

function importTest(name, path) {
    describe(name, function() {
        before(function() {
            defineNocks();
        });
        require(path);
    });
}

describe("Running all tests ...", function() {
    importTest("Uber client general tests", './general');
    importTest("Localization tests", './localization');
    importTest("OAuth2 authorization methods", './oauth');
    importTest("OAuth2 authorization methods (Async)", './oauthAsync');
    importTest("/Estimates", './estimates');
    importTest("/Estimates (Async)", './estimatesAsync');
    importTest("/Payment-Methods", './payment-methods');
    importTest("/Payment-Methods (Async)", './payment-methodsAsync');
    importTest("/Places", './places');
    importTest("/Places (Async)", './placesAsync');
    importTest("/Products", './products');
    importTest("/Products (Async)", './productsAsync');
    importTest("/Reminders", './reminders');
    importTest("/Reminders (Async)", './remindersAsync');
    importTest("/Requests", './requests');
    importTest("/Requests (Async)", './requestsAsync');
    importTest("/User", './user');
    importTest("/User (Async)", './userAsync');
});

defineNocks = function() {
    // Login
    nock('https://login.uber.com')
        .persist()
        .post('/oauth/token', {
            code: ''
        })
        .reply(500)
        .post('/oauth/token', {
            code: ac
        })
        .replyWithFile(200, jp('token'))
        .post('/oauth/token', {
            refresh_token: ac
        })
        .replyWithFile(200, jp('token'))
        .post('/oauth/token', {
            code: acNP
        })
        .replyWithFile(200, jp('tokenNoProfile'))
        .post('/oauth/token', {
            code: acNPl
        })
        .replyWithFile(200, jp('tokenNoPlaces'))
        .post('/oauth/token', {
            code: acNR
        })
        .replyWithFile(200, jp('tokenNoRequest'));

    // Endpoints accessible with OAuth2 Token
    nock('https://api.uber.com', {
            reqheaders: {
                'Authorization': 'Bearer ' + jr('token').access_token
            }
        })
        .persist()
        // Payment-Methods
        .get('/v1/payment-methods')
        .replyWithFile(200, jp('paymentMethod'))
        // Places
        .get('/v1/places/home')
        .replyWithFile(200, jp('placeHome'))
        .put('/v1/places/home')
        .replyWithFile(200, jp('placeHome'))
        .get('/v1/places/work')
        .replyWithFile(200, jp('placeWork'))
        .put('/v1/places/work')
        .replyWithFile(200, jp('placeWork'))
        .get('/v1/places/shop')
        .reply(404)
        .put('/v1/places/shop')
        .reply(404)
        // User
        .get('/v1/me')
        .replyWithFile(200, jp('profile'))
        .get(function(uri) {
            var parts = uri.split('/v1.2/history?offset=0&limit=');
            if (parts.length !== 2) {
                return false;
            }
            // range should be between 1 and 50
            return (parts[1] > 0 && parts[1] <= 50);
        })
        .replyWithFile(200, jp('history'))
        // Requests
        .get('/v1/requests/current')
        .replyWithFile(200, jp('requestAccept'))
        .post('/v1/requests')
        .replyWithFile(200, jp('requestCreate'))
        .patch('/v1/requests/current')
        .reply(204)
        .delete('/v1/requests/current')
        .reply(204)
        .post('/v1/requests/estimate')
        .replyWithFile(200, jp('requestEstimate'))
        .get('/v1/requests/17cb78a7-b672-4d34-a288-a6c6e44d5315')
        .replyWithFile(200, jp('requestAccept'))
        .patch('/v1/requests/abcd')
        .reply(404)
        .get('/v1/requests/abcd')
        .reply(404)
        .patch('/v1/requests/17cb78a7-b672-4d34-a288-a6c6e44d5315')
        .reply(204)
        .delete('/v1/requests/17cb78a7-b672-4d34-a288-a6c6e44d5315')
        .reply(204)
        .get('/v1/requests/17cb78a7-b672-4d34-a288-a6c6e44d5315/map')
        .replyWithFile(200, jp('requestMap'))
        .get('/v1/requests/17cb78a7-b672-4d34-a288-a6c6e44d5315/receipt')
        .replyWithFile(200, jp('requestReceipt'));

    // Endpoints accessible with server_token
    nock('https://api.uber.com', {
            reqheaders: {
                'Authorization': 'Token ' + key.server_token
            }
        })
        .persist()
        //Estimates
        .get('/v1/estimates/price?start_latitude=3.1357169&start_longitude=101.6881501&end_latitude=3.0831659&end_longitude=101.6505078&seat_count=2')
        .replyWithFile(200, jp('price'))
        .get(function(uri) {
            return uri.indexOf('v1/estimates/time?start_latitude=3.1357169&start_longitude=101.6881501') >= 0;
        })
        .replyWithFile(200, jp('time'))
        // Reminders
        .get('/v1/reminders/def-456')
        .replyWithFile(200, jp('reminder'))
        .post('/v1/reminders')
        .replyWithFile(200, jp('reminder'))
        .patch('/v1/reminders/def-456')
        .replyWithFile(200, jp('reminder'))
        .delete('/v1/reminders/def-456')
        .reply(204)
        // Products
        .get('/v1/products?latitude=3.1357169&longitude=101.6881501')
        .replyWithFile(200, jp('product'))
        .get('/v1/products/d4abaae7-f4d6-4152-91cc-77523e8165a4')
        .replyWithFile(200, jp('productDetail'));

    // Endpoints for sandbox mode with server_token
    nock('https://sandbox-api.uber.com', {
            reqheaders: {
                'Authorization': 'Token ' + key.server_token
            }
        })
        .persist()
        .put('/v1/sandbox/products/d4abaae7-f4d6-4152-91cc-77523e8165a4', {
            surge_multiplier: 2.2
        })
        .reply(204)
        .put('/v1/sandbox/products/d4abaae7-f4d6-4152-91cc-77523e8165a4', {
            drivers_available: false
        })
        .reply(204);

    // Endpoints for sandbox mode with OAuth2 Token
    nock('https://sandbox-api.uber.com', {
            reqheaders: {
                'Authorization': 'Bearer ' + jr('token').access_token
            }
        })
        .persist()
        .put('/v1/sandbox/requests/17cb78a7-b672-4d34-a288-a6c6e44d5315', {
            status: 'accepted'
        })
        .reply(204);

    // Geocoder
    nock('http://maps.googleapis.com')
        .persist()
        .get('/maps/api/geocode/json?sensor=false&address=A')
        .replyWithFile(200, jp('locationA'))
        .get('/maps/api/geocode/json?sensor=false&address=B')
        .replyWithFile(200, jp('locationB'))
        .get('/maps/api/geocode/json?sensor=false&address=C')
        .replyWithFile(200, jp('locationC'))
        .get('/maps/api/geocode/json?sensor=false&address=%20')
        .replyWithFile(200, jp('locationEmpty'));
}
