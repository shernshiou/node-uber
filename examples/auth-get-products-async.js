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
uber.authorizationAsync({
        authorization_code: 'YOUR AUTH CODE'
    })
    .spread(function(access_token, refresh_token, authorizedScopes, tokenExpiration) {
        // store the user id and associated access_token, refresh_token, scopes and token expiration date
        console.log('New access_token retrieved: ' + access_token);
        console.log('... token allows access to scopes: ' + authorizedScopes);
        console.log('... token is valid until: ' + tokenExpiration);
        console.log('... after token expiration, re-authorize using refresh_token: ' + refresh_token);

        // chain the promise to retrive all products for location
        return uber.products.getAllForLocationAsync(3.1357169, 101.6881501);
    })
    .then(function(res) {
        // response with all products
        console.log(res);
    })
    .error(function(err) {
        console.error(err);
    });
