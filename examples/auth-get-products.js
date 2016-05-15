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
var authURL = uber.getAuthorizeUrl(['history','profile', 'request', 'places']);


uber.authorization({
    // this code will be provided via the callback after logging in using the authURL
    authorization_code: 'YOUR AUTH CODE'
}, function(err, access_token, refresh_token) {
    if (err) console.error(err);
    else {
        console.log('Your access_token is: ' + access_token);
        console.log('Your refresh_token is: ' + refresh_token);

        uber.products.getAllForLocation(3.1357, 101.6880, function(err, res) {
            if (err) console.error(err);
            else console.log(res);
        });
    }
});
