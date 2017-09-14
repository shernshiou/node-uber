var request = require('request');
var qs = require('querystring');
var OAuth = require('oauth');
var util = require('util');
var Promise = require('bluebird');
var geocoder = require('geocoder');
var ProxyAgent = require('proxy-agent');

var resources = {
  Estimates: require('./resources/riders/Estimates'),
  Products: require('./resources/riders/Products'),
  User: require('./resources/riders/User'),
  Requests: require('./resources/riders/Requests'),
  Places: require('./resources/riders/Places'),
  Payment: require('./resources/riders/Payment'),
  PartnerPayments: require('./resources/drivers/PartnerPayments'),
  PartnerProfile: require('./resources/drivers/PartnerProfile'),
  PartnerTrips: require('./resources/drivers/PartnerTrips')
};

function Uber(options) {
  this.sandbox = options.sandbox
    ? options.sandbox
    : false;
  this.defaults = {
    client_id: options.client_id,
    client_secret: options.client_secret,
    server_token: options.server_token,
    redirect_uri: options.redirect_uri,
    name: options.name,
    base_url: this.sandbox
      ? 'https://sandbox-api.uber.com/'
      : 'https://api.uber.com/',
    base_version: 'v1.2',
    language: options.language
      ? options.language
      : 'en_US',
    authorize_url: 'https://login.uber.com/oauth/v2/authorize',
    access_token_url: 'https://login.uber.com/oauth/v2/token',
    revoke_token_url: 'https://login.uber.com/oauth/v2/revoke',
    proxy: options.proxy
      ? options.proxy
      : ''
  };

  this.oauth2 = new OAuth.OAuth2(this.defaults.client_id, this.defaults.client_secret, '', this.defaults.authorize_url, this.defaults.access_token_url);

  if (this.defaults.proxy) {
    this.oauth2.setAgent(new ProxyAgent(this.defaults.proxy));
  }
  this.oauth2.useAuthorizationHeaderforGET(true);

  this.resources = resources;
  this.access_token = options.access_token;
  this.refresh_token = options.refresh_token;
  this.tokenExpiration = '';
  this.authorizedScopes = '';

  this._initResources();
}

module.exports = Uber;

Uber.prototype._initResources = function _initResources() {
  for (var name in this.resources) {
    if ({}.hasOwnProperty.call(this.resources, name)) {
      this[name.toLowerCase()] = Promise.promisifyAll(new resources[name](this));
    }
  }
};

Uber.prototype.getCoordinatesForAddress = function getCoordinatesForAddress(address, callback) {
  geocoder.geocode(address, function(err, data) {
    if (err || data.results.length === 0) {
      return callback((err
        ? err
        : new Error('No coordinates found for: "' + address + '"')), {
        lat: '',
        lng: ''
      });
    }

    callback(null, data.results[0].geometry.location);
  });
};

Uber.prototype.replaceAddressWithCoordinates = function
replaceAddressWithCoordinates(params, addressField, latField, lngField, callback) {
  if (this.hasOwnNestedProperty(params, addressField) && !this.getNestedProperty(params, latField) && !this.getNestedProperty(params, lngField)) {
    // get coordinates from address
    this.getCoordinatesForAddress(this.getNestedProperty(params, addressField), function(err, data) {
      if (err) {
        return callback(err);
      }

      this.removeNestedProperty(params, addressField);
      this.setNestedProperty(params, latField, data.lat);
      this.setNestedProperty(params, lngField, data.lng);

      return callback(null, params);
    }.bind(this));
  } else {
    return callback(null, params);
  }
};

Uber.prototype.getAuthorizeUrl = function getAuthorizeUrl(scope) {
  if (!Array.isArray(scope)) {
    return new Error('Scope is not an array');
  }
  if (scope.length === 0) {
    return new Error('Scope is empty');
  }

  return this.oauth2.getAuthorizeUrl({response_type: 'code', redirect_uri: this.defaults.redirect_uri, scope: scope.join(' ')});
};

Uber.prototype.authorization = function authorization(options, callback) {
  var self = this;
  var grantType = '';
  var code = '';
  var nD = null;

  if (options.hasOwnProperty('authorization_code')) {
    grantType = 'authorization_code';
    code = options.authorization_code;
  } else if (options.hasOwnProperty('refresh_token')) {
    grantType = 'refresh_token';
    code = options.refresh_token;
  } else {
    return callback(new Error('No authorization_code or refresh_token'));
  }

  this.oauth2.getOAuthAccessToken(code, {
    client_id: this.defaults.client_id,
    client_secret: this.defaults.client_secret,
    redirect_uri: this.defaults.redirect_uri,
    grant_type: grantType
  }, function(err, access_token, refresh_token, results) {
    if (err) {
      return callback(err);
    } else {
      self.access_token = access_token;
      self.refresh_token = refresh_token;
      // store auth scopes
      self.authorizedScopes = results.scope;
      // store expiration date
      nD = new Date();
      // expires value indicates seconds
      nD.setSeconds(nD.getSeconds() + results.expires_in);
      self.tokenExpiration = nD;
      return callback(null, [self.access_token, self.refresh_token, self.authorizedScopes, self.tokenExpiration]);
    }
  });

  return self;
};

Uber.prototype.authorizationAsync = Promise.promisify(Uber.prototype.authorization);

Uber.prototype.delete = function(options, callback) {
  return this.modifierMethodHelper(options, callback, 'delete');
};

Uber.prototype.patch = function patch(options, callback) {
  return this.modifierMethodHelper(options, callback, 'patch');
};

Uber.prototype.post = function post(options, callback) {
  return this.modifierMethodHelper(options, callback, 'post');
};

Uber.prototype.put = function put(options, callback) {
  return this.modifierMethodHelper(options, callback, 'put');
};

Uber.prototype.modifierMethodExecute = function modifierMethodExecute(method, params, callback) {
  if (this.defaults.proxy) {
    params.agent = new ProxyAgent(this.defaults.proxy);
  }

  switch (method) {
    case 'delete':
      request.delete(params, callback);
      break;
    case 'post':
      request.post(params, callback);
      break;
    case 'put':
      request.put(params, callback);
      break;
    case 'patch':
      request.patch(params, callback);
      break;
  }
};

Uber.prototype.modifierMethodHelper = function modifierMethodHelper(options, callback, method) {
  var access_type;
  var self = this;
  var localCallback = function localCallback(err, data, res) {
    // shared callback between put, post, patch, and delete requests
    if (err || data.statusCode >= 400) {
      return callback(((err)
        ? err
        : 'HTTP Response with error code: ' + data.statusCode), data);
    } else {
      return callback(null, res);
    }
  };
  var refreshCallback = function refreshCallback() {
    if (!self.checkScopes(options)) {
      return callback(new Error('Required scope not found'));
    }

    // remove scope parameter from options
    delete options.scope;

    var params = {
      url: self.getRequestURL(options.version, options.url),
      json: true,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': access_type,
        'Accept-Language': self.defaults.language
      },
      body: ((options.params)
        ? options.params
        : '')
    };

    self.modifierMethodExecute(method, params, localCallback);

    return self;
  };
  if (options && options.server_token) {
    access_type = 'Token ' + this.defaults.server_token;
    refreshCallback();
  } else {
    if (!this.access_token) {
      return callback(new Error('Invalid access token'));
    } else {
      // defaults to OAuth with access_token
      // auto renew if required
      if (this.isTokenStale()) {
        this.authorization({
          refresh_token: this.refresh_token
        }, function(err, res) {
          if (err) {
            return callback(err);
          } else {
            access_type = 'Bearer ' + res[0];
            refreshCallback();
          }
        });
      } else {
        access_type = 'Bearer ' + this.access_token;
        refreshCallback();
      }
    }
  }
};

Uber.prototype.createAccessHeader = function createAccessHeader(server_token) {
  var access_type;

  if (server_token) {
    access_type = 'Token ' + this.defaults.server_token;
  } else {
    if (this.access_token) {
      access_type = 'Bearer ' + this.access_token;
    }
  }

  return access_type;
};

Uber.prototype.get = function get(options, callback) {
  var access_type = this.createAccessHeader(options.server_token);
  if (!access_type) {
    return callback(new Error('Invalid access token'), 'A valid access token is required for this request');
  }
  var url = this.getRequestURL(options.version, options.url);

  if (!this.checkScopes(options)) {
    return callback(new Error('Required scope not found'));
  }

  // remove scope parameter from options
  delete options.scope;

  // add all further option params
  if (options.params) {
    url += '?' + qs.stringify(options.params);
  }

  var reqOptions = {
    url: url,
    json: true,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': access_type,
      'Accept-Language': this.defaults.language
    }
  };
  if (this.defaults.proxy) {
    reqOptions.agent = new ProxyAgent(this.defaults.proxy);
  }

  request.get(reqOptions, function(err, data, res) {
    if (err || data.statusCode >= 400) {
      return callback((err
        ? err
        : data), res);
    } else {
      return callback(null, res);
    }
  });

  return this;
};

Uber.prototype.checkScopes = function checkScopes(options) {
  if (!options || !options.scope) {
    // checking scopes is not relevant
    return true;
  }

  // check if options.scope is array
  if (options.scope && Array === options.scope.constructor) {
    var regExp;
    for (var i = 0; i < options.scope.length; i++) {
      // regEx is required to avoid mismatch between
      // request and request_receipt
      regExp = new RegExp('\\b' + options.scope[i] + '\\b', 'gi');
      if (regExp.test(this.authorizedScopes)) {
        return true;
      }
    }
    return false;
  } else {
    if (this.authorizedScopes.indexOf(options.scope) > -1) {
      return true;
    } else {
      return false;
    }
  }
};

Uber.prototype.revokeToken = function revokeToken(token, callback) {
  if (typeof token !== "string" || token.length === 0) {
    return callback(new Error('Passed token is not acceptable'));
  }

  request.post(this.defaults.revoke_token_url, {
    form: {
      client_id: this.defaults.client_id,
      client_secret: this.defaults.client_secret,
      token: token
    }
  }, function(err, res, body) {
    if (err) {
      return callback(err);
    }

    return callback(null, res);
  });
};

Uber.prototype.revokeTokenAsync = Promise.promisify(Uber.prototype.revokeToken);

Uber.prototype.clearTokens = function clearTokens() {
  this.access_token = null;
  this.refresh_token = null;
  this.tokenExpiration = null;
  this.authorizedScopes = null;
};

Uber.prototype.setTokens = function setTokens(access_token, refresh_token, tokenExpiration, authorizedScopes) {
  this.access_token = access_token;
  this.refresh_token = refresh_token;
  this.tokenExpiration = tokenExpiration;
  this.authorizedScopes = authorizedScopes;
}

Uber.prototype.isNumeric = function isNumeric(input) {
  return (!input || isNaN(input))
    ? false
    : true;
};

Uber.prototype.hasOwnNestedProperty = function hasOwnNestedProperty(obj, key) {
  return key.split('.').every(function(x) {
    if (typeof obj !== 'object' || obj === null || !(x in obj))
      return false;
    obj = obj[x];
    return true;
  });
};

Uber.prototype.getNestedProperty = function getNestedProperty(obj, key) {
  return key.split(".").reduce(function(o, x) {
    return (typeof o === 'undefined' || o === null)
      ? o
      : o[x];
  }, obj);
};

Uber.prototype.removeNestedProperty = function removeNestedProperty(obj, key) {
  var props = key.split('.');
  var propName = props[props.length - 1];
  for (var p in obj) {
    if (obj.hasOwnProperty(p)) {
      if (p === propName) {
        delete obj[p];
      } else if (typeof obj[p] === 'object') {
        this.removeNestedProperty(obj[p], propName);
      }
    }
  }
  return obj;
};

Uber.prototype.setNestedProperty = function setNestedProperty(obj, key, value) {
  var schema = obj;
  var pList = key.split('.');
  var len = pList.length;
  for (var i = 0; i < len - 1; i++) {
    var elem = pList[i];
    schema = schema[elem];
  }

  schema[pList[len - 1]] = value;
};

Uber.prototype.getRequestURL = function getRequestURL(version, url) {
  return this.defaults.base_url + (version
    ? version
    : this.defaults.base_version) + '/' + url;
};

Uber.prototype.isTokenStale = function isTokenStale() {
  var nD = new Date();
  var threshold = 500;
  nD.setSeconds(nD.getSeconds() + threshold);
  return nD > this.tokenExpiration;
};

Uber.prototype.isSurge = function isSurge(err) {
  return err.hasOwnProperty('surge_confirmation');
};
