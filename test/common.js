var chai = require('chai'),
    nock = require('nock'),
    request = require('superagent'),
    should = chai.should(),
    qs = require('querystring'),
    Uber = require('../lib/Uber');

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

exports.chai = chai;
exports.nock = nock;
exports.request = request;
exports.should = should;
exports.qs = qs;
exports.uber = uber;
exports.uber_sandbox = uber_sandbox;
exports.key = key;
