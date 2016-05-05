var request = require('request');
var qs = require('querystring');
var OAuth = require('oauth');

var resources = {
    Estimates: require('./resources/Estimates'),
    Products: require('./resources/Products'),
    User: require('./resources/User'),
    Requests: require('./resources/Requests'),
    Places: require('./resources/Places'),
    Payment: require('./resources/Payment'),
    Reminders: require('./resources/Reminders')
};

function Uber(options) {
    this.sandbox = options.sandbox;
    this.defaults = {
        client_id: options.client_id,
        client_secret: options.client_secret,
        server_token: options.server_token,
        redirect_uri: options.redirect_uri,
        name: options.name,
        base_url: this.sandbox ? 'https://sandbox-api.uber.com/' : 'https://api.uber.com/',
        authorize_url: 'https://login.uber.com/oauth/authorize',
        access_token_url: 'https://login.uber.com/oauth/token',
        accept_language: options.language ? options.language : 'en_US'
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

Uber.prototype._initResources = function() {
    for (var name in this.resources) {
        if ({}.hasOwnProperty.call(this.resources, name)) {
            this[name.toLowerCase()] = new resources[name](this);
        }
    }
};

Uber.prototype.getAuthorizeUrl = function getAuthorizeUrl(scope, redirect_uri) {
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
        response_type: 'code',
        redirect_uri: this.defaults.redirect_uri,
        scope: scope.join(' ')
    });
};

Uber.prototype.authorization = function authorization(options, callback) {
    var self = this;
    var grantType = '';
    var code = '';

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
    }, function(err, access_token, refresh_token) {
        if (err) {
            return callback(err);
        } else {
            self.access_token = access_token;
            self.refresh_token = refresh_token;
            return callback(null, self.access_token, self.refresh_token);
        }
    });

    return self;
};

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

Uber.prototype.generateAccessHeaders = function generateAccessHeaders(params) {
    if(params && params.auth_type === 'server_token') {
        return 'Token ' + this.defaults.server_token;
    } else {
        if(!this.access_token) {
            return null;
        } else {
            // defaults to OAuth with access_token
            return 'Bearer ' + this.access_token;
        }
    }
};

Uber.prototype.modifierMethodHelper = function modifierMethodHelper(options, callback, method) {
    var access_type = this.generateAccessHeaders(options.params);
    if(options.params && options.params.auth_type) {
        delete options.params.auth_type;
    }

    if(!access_type) {
        return callback(new Error('Invalid access token'));
    }

    var localCallback = function localCallback(err, data, res) {
        // shared callback between put, post, patch, and delete requests
        if (err || data.statusCode >= 400) {
            return callback(((err) ? err : 'HTTP Response with error code: ' + data.statusCode), data);
        } else {
            return callback(null, res);
        }
    };

    var params = {
        url: this.defaults.base_url + ((options.version) ? options.version : 'v1') + '/' + options.url,
        json: true,
        headers: {
            'Accept-Language': options.accept_language,
            'Content-Type': 'application/json',
            Authorization: access_type
        },
        body: ((options.params) ? options.params : '')
    };

    this.modifierMethodExecute(method, params, localCallback);

    return this;
};

Uber.prototype.get = function get(options, callback) {
    var access_type = this.generateAccessHeaders(options.params);
    if(options.params && options.params.auth_type) {
        delete options.params.auth_type;
    }

    if(!access_type) {
        return callback(new Error('Invalid access token'));
    }

    if (options.params) {
        url += '&' + qs.stringify(options.params);
    }

    request.get({
        url: this.defaults.base_url + ((options.version) ? options.version : 'v1') + '/' + options.url,
        json: true,
        headers: {
            'Accept-Language': options.accept_language,
            'Content-Type': 'application/json',
            Authorization: access_type
        }
    }, function(err, data, res) {
        if (err || data.statusCode >= 400) {
            return callback(err, data);
        } else {
            return callback(null, res);
        }
    });

    return this;
};

Uber.prototype.validateCoordinates = function validateCoordinates(lat, lon) {
    if (!lat || !lon) {
        return false;
    }
    // use regex to check for validaty of latitude and longitude
    var location = lat + ', ' + lon;
    // taken from: http://stackoverflow.com/questions/3518504/regular-expression-for-matching-latitude-longitude-coordinates
    var locationReg = new RegExp('^[-+]?([1-8]?\\d(\\.\\d+)?|90(\\.0+)?)' +
        '\\s*,\\s*[-+]?(180(\\.0+)?|((1[0-7]\\d)|([1-9]?\\d)‌​)(\\.\\d+)?)$');

    return locationReg.exec(location);
};

Uber.prototype.isNumeric = function isNumeric(input) {
    return (!input || isNaN(input)) ? false : true;
};
