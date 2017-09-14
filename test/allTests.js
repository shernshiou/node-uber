var common = require("./common"),
    nock = common.nock,
    jp = common.jsonReplyPath,
    key = common.key,
    jr = common.jsonReply,
    ac = common.authCode,
    acNP = common.authCodeNoProfile,
    acNPl = common.authCodeNoPlaces,
    acNR = common.authCodeNoRequest,
    acTE = common.authCodeTokenExpired,
    acTR = common.authCodeTokenRefresh,
    acTNR = common.authCodeTokenNoRefresh,
    acRTE = common.authCodeRefreshTokenError,
    rPC = common.requestProductCreate,
    rPS = common.requestProductSurge,
    rSC = common.requestSurgeConfirmationID,
    rPSOE = common.requestProductSomeOtherError;
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
    // Auth
    importTest("OAuth2 authorization methods", './auth/oauth');
    importTest("OAuth2 authorization methods (Async)", './auth/oauthAsync');
    // Riders
    importTest("/Estimates", './riders/estimates');
    importTest("/Estimates (Async)", './riders/estimatesAsync');
    importTest("/Payment-Methods", './riders/payment-methods');
    importTest("/Payment-Methods (Async)", './riders/payment-methodsAsync');
    importTest("/Places", './riders/places');
    importTest("/Places (Async)", './riders/placesAsync');
    importTest("/Products", './riders/products');
    importTest("/Products (Async)", './riders/productsAsync');
    importTest("/Requests", './riders/requests');
    importTest("/Requests (Async)", './riders/requestsAsync');
    importTest("/User", './riders/user');
    importTest("/User (Async)", './riders/userAsync');
    // Drivers
    importTest("/Partners/Me", './drivers/profile');
    importTest("/Partner/Me (Async)", './drivers/profileAsync');
    importTest("/Partners/Payments", './drivers/payments');
    importTest("/Partner/Payments (Async)", './drivers/paymentsAsync');
    importTest("/Partners/Trips", './drivers/trips');
    importTest("/Partner/Trips (Async)", './drivers/tripsAsync');
});

defineNocks = function() {
    // Login
    nock('https://login.uber.com')
        .persist()
        .post('/oauth/v2/revoke')
        .reply(200)
        .post('/oauth/v2/token', {
            code: ''
        })
        .reply(500)
        .post('/oauth/v2/token', {
            code: ac
        })
        .replyWithFile(200, jp('auth/token'))
        .post('/oauth/v2/token', {
            refresh_token: ac
        })
        .replyWithFile(200, jp('auth/token'))
        .post('/oauth/v2/token', {
            code: acNP
        })
        .replyWithFile(200, jp('auth/tokenNoProfile'))
        .post('/oauth/v2/token', {
            code: acNPl
        })
        .replyWithFile(200, jp('auth/tokenNoPlaces'))
        .post('/oauth/v2/token', {
            code: acNR
        })
        .replyWithFile(200, jp('auth/tokenNoRequest'))
        .post('/oauth/v2/token', {
            code: acTE
        })
        .replyWithFile(200, jp('auth/tokenExpired'))
        .post('/oauth/v2/token', {
            refresh_token: acTR
        })
        .replyWithFile(200, jp('auth/tokenRefreshed'))
        .post('/oauth/v2/token', {
            code: acTNR
        })
        .replyWithFile(200, jp('auth/tokenNoRefresh'))
        .post('/oauth/v2/token', {
            refresh_token: acRTE
        })
        .reply(500);

    // Endpoints accessible with OAuth2 Token
    nock('https://api.uber.com', {
            reqheaders: {
                'Authorization': 'Bearer ' + jr('auth/token').access_token
            }
        })
        .persist()
        // Payment-Methods
        .get('/v1.2/payment-methods')
        .replyWithFile(200, jp('riders/paymentMethod'))
        // Places
        .get('/v1.2/places/home')
        .replyWithFile(200, jp('riders/placeHome'))
        .put('/v1.2/places/home')
        .replyWithFile(200, jp('riders/placeHome'))
        .get('/v1.2/places/work')
        .replyWithFile(200, jp('riders/placeWork'))
        .put('/v1.2/places/work')
        .replyWithFile(200, jp('riders/placeWork'))
        .get('/v1.2/places/shop')
        .reply(404)
        .put('/v1.2/places/shop')
        .reply(404)
        // User
        .get('/v1.2/me')
        .replyWithFile(200, jp('riders/profile'))
        .patch('/v1.2/me', {
            applied_promotion_codes: 'FREE_RIDEZ'
        })
        .replyWithFile(200, jp('riders/profilePromoSuccess'))
        .patch('/v1.2/me', {
            applied_promotion_codes: 'already-used-code'
        })
        .replyWithFile(400, jp('riders/profilePromoError'))
        .get(function(uri) {
            var parts = uri.split('/v1.2/history?offset=0&limit=');
            if (parts.length !== 2) {
                return false;
            }
            // range should be between 1 and 50
            return (parts[1] > 0 && parts[1] <= 50);
        })
        .replyWithFile(200, jp('riders/history'))
        // Requests
        .get('/v1.2/requests/current')
        .replyWithFile(200, jp('riders/requestAccept'))
        .post('/v1.2/requests', {
            product_id : rPC
        })
        .replyWithFile(200, jp('riders/requestCreate'))
        .post('/v1.2/requests', {
            product_id : rPS,
            surge_confirmation_id : rSC
        })
        .replyWithFile(200, jp('riders/requestCreate'))
        .post('/v1.2/requests', {
            product_id : rPS
        })
        .replyWithFile(409, jp('riders/requestSurge'))
        .post('/v1.2/requests', {
            product_id : rPSOE
        })
        .replyWithFile(409, jp('riders/requestFareExpired'))
        .patch('/v1.2/requests/current')
        .reply(204)
        .delete('/v1.2/requests/current')
        .reply(204)
        .post('/v1.2/requests/estimate')
        .replyWithFile(200, jp('riders/requestEstimate'))
        .get('/v1.2/requests/17cb78a7-b672-4d34-a288-a6c6e44d5315')
        .replyWithFile(200, jp('riders/requestAccept'))
        .patch('/v1.2/requests/abcd')
        .reply(404)
        .get('/v1.2/requests/abcd')
        .reply(404)
        .patch('/v1.2/requests/17cb78a7-b672-4d34-a288-a6c6e44d5315')
        .reply(204)
        .delete('/v1.2/requests/17cb78a7-b672-4d34-a288-a6c6e44d5315')
        .reply(204)
        .get('/v1.2/requests/17cb78a7-b672-4d34-a288-a6c6e44d5315/map')
        .replyWithFile(200, jp('riders/requestMap'))
        .get('/v1.2/requests/17cb78a7-b672-4d34-a288-a6c6e44d5315/receipt')
        .replyWithFile(200, jp('riders/requestReceipt'))
        // Driver Partners
        .get('/v1/partners/me')
        .replyWithFile(200, jp('drivers/partnerProfile'))
        .get('/v1/partners/payments?offset=0&limit=5&from_time=1451606400&to_time=1505160819')
        .replyWithFile(200, jp('drivers/partnerPayments'))
        .get('/v1/partners/payments?offset=0&limit=50&from_time=1451606400&to_time=1505160819')
        .replyWithFile(200, jp('drivers/partnerPayments'))
        .get('/v1/partners/payments?offset=0&limit=5')
        .replyWithFile(200, jp('drivers/partnerPayments'))
        .get('/v1/partners/trips?offset=0&limit=5&from_time=1451606400&to_time=1505160819')
        .replyWithFile(200, jp('drivers/partnerTrips'))
        .get('/v1/partners/trips?offset=0&limit=50&from_time=1451606400&to_time=1505160819')
        .replyWithFile(200, jp('drivers/partnerTrips'))
        .get('/v1/partners/trips?offset=0&limit=5')
        .replyWithFile(200, jp('drivers/partnerTrips'));


    // Endpoints accessible with server_token
    nock('https://api.uber.com', {
            reqheaders: {
                'Authorization': 'Token ' + key.server_token
            }
        })
        .persist()
        //Estimates
        .get('/v1.2/estimates/price?start_latitude=3.1357169&start_longitude=101.6881501&end_latitude=3.0831659&end_longitude=101.6505078&seat_count=2')
        .replyWithFile(200, jp('riders/price'))
        .get(function(uri) {
            return uri.indexOf('v1.2/estimates/time?start_latitude=3.1357169&start_longitude=101.6881501') >= 0;
        })
        .replyWithFile(200, jp('riders/time'))
        // Products
        .get('/v1.2/products?latitude=3.1357169&longitude=101.6881501')
        .replyWithFile(200, jp('riders/product'))
        .get('/v1.2/products/d4abaae7-f4d6-4152-91cc-77523e8165a4')
        .replyWithFile(200, jp('riders/productDetail'));

    // Endpoints for sandbox mode with server_token
    nock('https://sandbox-api.uber.com', {
            reqheaders: {
                'Authorization': 'Token ' + key.server_token
            }
        })
        .persist()
        .put('/v1.2/sandbox/products/d4abaae7-f4d6-4152-91cc-77523e8165a4', {
            surge_multiplier: 2.2
        })
        .reply(204)
        .put('/v1.2/sandbox/products/d4abaae7-f4d6-4152-91cc-77523e8165a4', {
            drivers_available: false
        })
        .reply(204);

    // Endpoints for sandbox mode with OAuth2 Token
    nock('https://sandbox-api.uber.com', {
            reqheaders: {
                'Authorization': 'Bearer ' + jr('auth/token').access_token
            }
        })
        .persist()
        .put('/v1.2/sandbox/requests/17cb78a7-b672-4d34-a288-a6c6e44d5315', {
            status: 'accepted'
        })
        .reply(204);

    // Geocoder
    nock('http://maps.googleapis.com')
        .persist()
        .get('/maps/api/geocode/json?sensor=false&address=A')
        .replyWithFile(200, jp('geocoder/locationA'))
        .get('/maps/api/geocode/json?sensor=false&address=B')
        .replyWithFile(200, jp('geocoder/locationB'))
        .get('/maps/api/geocode/json?sensor=false&address=C')
        .replyWithFile(200, jp('geocoder/locationC'))
        .get('/maps/api/geocode/json?sensor=false&address=%20')
        .replyWithFile(200, jp('geocoder/locationEmpty'));
};
