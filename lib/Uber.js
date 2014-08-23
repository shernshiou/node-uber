var request = require('request')
  , qs = require('querystring')
  , OAuth = require('oauth');

var resources = {
  Estimates: require('./resources/Estimates'),
  Products: require('./resources/Products')
};

function Uber(options) {
  this.defaults = {
    client_id: options.client_id,
    client_secret: options.client_secret,
    server_token: options.server_token,
    //callback_url: options.callback_url,
    name: options.name,
    base_url: 'https://api.uber.com/v1',
    authorize_url: 'https://login.uber.com/oauth/authorize',
    access_token_url: 'https://login.uber.com/oauth/token'    
  };

  this.oauth2 = new OAuth.OAuth2(
    this.defaults.client_id,
    this.defaults.client_secret,
    '',
    this.defaults.authorize_url,
    this.defaults.access_token_url
  );

  this.resources = resources;

  this._initResources();
}

module.exports = Uber;

Uber.prototype._initResources = function () {
  for (var name in this.resources) {
    this[name.toLowerCase()] = new resources[name](this);
  }
};

Uber.prototype.get = function (options, callback) {
  var url = this.defaults.base_url + '/' + options.url + '?' + qs.stringify(options.params);
  request.get({
    url: url + '&server_token=' + this.defaults.server_token,
    json: true
  }, function (err, data, res) {
    if (err) {
      callback(err);
    } else {
      callback(null, res);
    }
  });

  return this;
};
