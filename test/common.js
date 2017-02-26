var chai = require('chai'),
    nock = require('nock'),
    request = require('superagent'),
    should = chai.should(),
    qs = require('querystring'),
    Uber = require('../lib/Uber'),
    path = require('path'),
    fs = require('fs');

var key = {
    "client_id": "CLIENTIDCLIENTIDCLIENTIDCLIENT",
    "client_secret": "CLIENTSECRETCLIENTSECRETCLIENTSECRETCLIE",
    "server_token": "SERVERTOKENSERVERTOKENSERVERTOKENSERVERT",
    "redirect_uri": "http://localhost/callback",
    "name": "nodejs uber wrapper",
    "language": "en_US"
};

var uber = new Uber(key);

// uber instance for Sandbox mode
key.sandbox = true;
var uber_sandbox = new Uber(key);

// JSON path for reply files
jsonReplyPath = function(filename) {
    return path.join(__dirname, '/replies/' + filename + '.json');
}

// Load JSON file from replies folder for assertions
jsonReply = function(path) {
    return JSON.parse(fs.readFileSync(this.jsonReplyPath(path), 'utf8'));
}

exports.chai = chai;
exports.nock = nock;
exports.request = request;
exports.should = should;
exports.qs = qs;
exports.uber = uber;
exports.uber_sandbox = uber_sandbox;
exports.key = key;
exports.jsonReplyPath = jsonReplyPath;
exports.jsonReply = jsonReply;
exports.authCode = 'x8Y6dF2qA6iKaTKlgzVfFvyYoNrlkp';
exports.authCodeNoProfile = 'h6Y6dF2qA6iKaTKlgzVfFvyYoNrLK3';
exports.authCodeNoPlaces = 'j1P6dF2qA6iKaTKlgzVfFvyYoNrhU1';
exports.authCodeNoRequest = 'a0P6dK3oA6iKaTKlgzVfFvyYoNrfG5';
exports.authCodeTokenExpired = 'h0P6dK3aA6iKaTK4gzVfFvyYoNrfG5';
exports.authCodeTokenNoRefresh = 'm0P6dK3aTPiKaTK4gzVfFvyYoNrfG5';
exports.authCodeRefreshTokenError = 'Zxkcv8qdSRRseIVlshydoQ4wnZBehr';
exports.authCodeTokenRefresh = 'Zx8fJ8qdSRRseIVlsGgtgQ4wnZBehr';
exports.requestProductCreate = 'a1111c8c-c720-46c3-8534-2fcdd730040d';
exports.requestProductSurge = 'a1111c8c-c720-8150-8534-2fcdd730040d';
exports.requestProductSomeOtherError = 'a2341c8c-c720-8150-8534-2fcdd730040d';
exports.requestSurgeConfirmationID = 'e100a670';