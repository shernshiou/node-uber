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
    "name": "nodejs uber wrapper"
};

var uber = new Uber(key);

exports.chai = chai;
exports.nock = nock;
exports.request = request;
exports.should = should;
exports.qs = qs;
exports.uber = uber;
exports.key = key;
