var request = require('request')
  , qs = require('querystring')
  , OAuth = require('oauth');

var resources = {
  Estimates: require('./resources/Estimates'),
  Products: require('./resources/Products'),
  User: require('./resources/User')
};

function Uber(options) {
  this.defaults = {
    client_id: options.client_id,
    client_secret: options.client_secret,
    server_token: options.server_token,
    redirect_uri: options.redirect_uri,
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
  this.access_token = options.access_token;
  this.refresh_token = options.refresh_token;

  this._initResources();
}

module.exports = Uber;

Uber.prototype._initResources = function () {
  for (var name in this.resources) {
    this[name.toLowerCase()] = new resources[name](this);
  }
};

Uber.prototype.getAuthorizeUrl = function (scope, redirect_uri) {
  if (!Array.isArray(scope)) {
    return new Error('Scope is not an array');
  }
  if (scope.length === 0) {
    return new Error('Scope is empty');
  }
  if (redirect_uri) {
    this.defaults.redirect_uri = redirect_uri;
  }

  return this.oauth2.getAuthorizeUrl({
    'response_type': 'code',
    'redirect_uri': this.defaults.redirect_uri,
    'scope': scope.join(',')
  });
};

Uber.prototype.authorization = function (options, callback) {
  var self = this
    , grantType = ''
    , code = '';
  if (options.hasOwnProperty('authorization_code')) {
    grantType ='authorization_code';
    code = options.authorization_code;
  } else if (options.hasOwnProperty('refresh_token')) {
    grantType ='refresh_token';
    code = options.refresh_token;
  } else {
    return callback(new Error('No authorization_code or refresh_token'));
  }

  this.oauth2.getOAuthAccessToken(code, {
    client_id: this.defaults.client_id,
    client_secret: this.defaults.client_secret,
    redirect_uri: this.defaults.redirect_uri,
    grant_type: grantType
  }, function (err, access_token, refresh_token) {
    if (err) {
      callback(err);
    } else {
      self.access_token = access_token;
      self.refresh_token = refresh_token;
      callback(null, self.access_token, self.refresh_token);
    }
  });

  return self;
};

Uber.prototype.get = function (options, callback) {
  var url = this.defaults.base_url + '/' + options.url + '?' 
    , accessToken = (options.access_token) ? options.access_token : null;

  if (!accessToken) {
    url += 'server_token=' + this.defaults.server_token;
  } else {
    url += 'access_token=' + accessToken;
  }

  if (options.params) {
    url += '&' + qs.stringify(options.params);
  }

  request.get({
    url: url,
    //auth: accessToken,
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