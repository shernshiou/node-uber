var Uber = require('node-uber');

// create new Uber instance
var uber = new Uber({
    client_id: 'YOUR CLIENT ID',
    client_secret: 'YOUR CLIENT SECRET',
    server_token: 'YOUR SERVER TOKEN',
    redirect_uri: 'http://localhost/callback',
    name: 'nodejs uber wrapper',
    language: 'en_US',
    sandbox: true
});

// get authorization URL
var authURL = uber.getAuthorizeUrl(['history', 'profile', 'request', 'places']);

// redirect user to the authURL

// the authorizarion_code will be provided via the callback after logging in using the authURL
uber.authorization({
    authorization_code: 'YOUR AUTH CODE'
}, function(err, res) {
    if (err) {
        console.error(err);
    } else {
        // store the user id and associated properties:
        // access_token = res[0], refresh_token = res[1], scopes = res[2]),and token expiration date = res[3]
        console.log('New access_token retrieved: ' + res[0]);
        console.log('... token allows access to scopes: ' + res[2]);
        console.log('... token is valid until: ' + res[3]);
        console.log('... after token expiration, re-authorize using refresh_token: ' + res[1]);

        uber.products.getAllForLocation(3.1357169, 101.6881501, function(err, res) {
            if (err) console.error(err);
            else console.log(res);
        });
    }
});
