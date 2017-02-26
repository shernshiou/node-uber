var common = require("./common"),
    key = common.key,
    uber = common.uber;

it('should load the key from a key.json', function(done) {
    key.should.have.property('client_id');
    key.should.have.property('client_secret');
    key.should.have.property('server_token');
    key.should.have.property('redirect_uri');
    key.should.have.property('name');
    key.should.have.property('language');
    done();
});

it('should initiate Uber client with the key', function(done) {
    uber.should.have.property('defaults');
    uber.defaults.language.should.equal(key.language);
    uber.defaults.client_id.should.equal(key.client_id);
    uber.defaults.client_secret.should.equal(key.client_secret);
    uber.defaults.server_token.should.equal(key.server_token);
    uber.defaults.redirect_uri.should.equal(key.redirect_uri);
    uber.defaults.base_url.should.equal('https://api.uber.com/');
    uber.defaults.authorize_url.should.equal('https://login.uber.com/oauth/v2/authorize');
    uber.defaults.access_token_url.should.equal('https://login.uber.com/oauth/v2/token');
    uber.should.have.property('oauth2');
    done();
});
