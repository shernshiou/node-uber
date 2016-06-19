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
