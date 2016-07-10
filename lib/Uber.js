var request = require('request');
var qs = require('querystring');
var OAuth = require('oauth');
var util = require('util');
var RateLimitError = require('./errors/RateLimitError');

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
    this.sandbox = options.sandbox ? options.sandbox : false;
    this.defaults = {
        client_id: options.client_id,
        client_secret: options.client_secret,
        server_token: options.server_token,
        redirect_uri: options.redirect_uri,
        name: options.name,
        base_url: this.sandbox ? 'https://sandbox-api.uber.com/' : 'https://api.uber.com/',
        authorize_url: 'https://login.uber.com/oauth/authorize',
        access_token_url: 'https://login.uber.com/oauth/token',
        language: options.language ? options.language : 'en_US',
        rate_limit: 2000
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

    this.rate_limit = options.rate_limit;
    this.rate_limit_remaining = options.rate_limit;
    this.rate_limit_reset = null;

    this._initResources();
}

module.exports = Uber;

Uber.prototype._updateRateLimit = function(data) {
    var today = new Date();
    if (data && data.headers && data.headers.hasOwnProperty('x-rate-limit-remaining')) {
        this.rate_limit_remaining = parseInt(data.headers['x-rate-limit-remaining']); // Number of requests left in the rate limit window.
    }
    if (data && data.headers && data.headers.hasOwnProperty('x-rate-limit-limit')) {
        this.rate_limit = parseInt(data.headers['x-rate-limit-limit']); // Total number of requests possible.
    }
    if (data && data.headers && data.headers.hasOwnProperty('x-rate-limit-reset')) {
        this.rate_limit_reset = parseInt(data.headers['x-rate-limit-reset']); // Timestamp when the rate limit will reset.
        this.rate_limit_reset_date = new Date(parseInt(data.headers['x-rate-limit-reset']) * 1000); // Timestamp when the rate limit will reset.
        var diffMs = (this.rate_limit_date - today); // milliseconds between now & Christmas
        this.rate_limit_reset_minutes_left = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
    }
    // If we have no rate limit reset date
    if (!this.rate_limit_reset) {
        return;
    }
    if (today > this.rate_limit_date) {
        this.rate_limit_remaining = this.rate_limit;
    }
    if (this.rate_limit_remaining === 0) {
        return new RateLimitError("Rate Limit Reached, will reset in " + this.rate_limit_reset_minutes_left + " mins", data && data.hasOwnProperty('body')? data.body : null);
    }
    // console.log('Rate Limit', this.rate_limit);
    // console.log('Rate Limit Remaining', this.rate_limit_remaining);
    // console.log('Rate Limit Reset', this.rate_limit_date);
    // console.log('Rate Limit Reset Date', this.rate_limit);
    // console.log('Rate Limit Reset Minutes Left', this.rate_limit_reset_minutes_left);
    return null;
};

Uber.prototype._initResources = function() {
    for (var name in this.resources) {
        if ({}.hasOwnProperty.call(this.resources, name)) {
            this[name.toLowerCase()] = new resources[name](this);
        }
    }
};

Uber.prototype.getAuthorizeUrl = function getAuthorizeUrl(scope) {
    if (!Array.isArray(scope)) {
        return new Error('Scope is not an array');
    }
    if (scope.length === 0) {
        return new Error('Scope is empty');
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
    var self = this;
    function interceptCallback(err, data, res) {
        var rate_err = self._updateRateLimit(data);
        callback(rate_err ? rate_err : err, data, res);
    }
    switch (method) {
        case 'delete':
            request.delete(params, interceptCallback);
            break;
        case 'post':
            request.post(params, interceptCallback);
            break;
        case 'put':
            request.put(params, interceptCallback);
            break;
        case 'patch':
            request.patch(params, interceptCallback);
            break;
        default:
            return callback(new Error("Unknown Method"));
    }
};

Uber.prototype.modifierMethodHelper = function modifierMethodHelper(options, callback, method) {
    var access_type;

    if (options && options.server_token) {
        access_type = 'Token ' + this.defaults.server_token;
    } else {
        if (!this.access_token) {
            return callback(new Error('Invalid access token'), 'A valid access token is required for this request');
        } else {
            // defaults to OAuth with access_token
            access_type = 'Bearer ' + this.access_token;
        }
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
        url: this.getRequestURL(options.version, options.url),
        json: true,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': access_type,
            'Accept-Language': this.defaults.language
        },
        body: ((options.params) ? options.params : '')
    };

    this.modifierMethodExecute(method, params, localCallback);

    return this;
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
    var self = this;
    var access_type = this.createAccessHeader(options.server_token);
    if (!access_type) {
        return callback(new Error('Invalid access token'), 'A valid access token is required for this request');
    }
    var url = this.getRequestURL(options.version, options.url);

    // add all further option params
    if (options.params) {
        url += '?' + qs.stringify(options.params);
    }

    // If rate limit is zero, no point to make the request
    if (this.rate_limit === 0) {
        return callback(new RateLimitError("Rate Limit Reached, will reset in " + this.rate_limit_reset_minutes_left + " mins"));
    }

    request.get({
        url: url,
        json: true,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': access_type,
            'Accept-Language': this.defaults.language
        }
    }, function(err, data, res) {
        if (err || data.statusCode >= 400) {
            self._updateRateLimit(data);
            if (data.statusCode === 429 && res.code === 'rate_limited')
                return callback(new RateLimitError("Rate Limit Reached"), data && data.hasOwnProperty('body') ? data.body : null);
            else
                return callback((err ? err : data), res);
        } else {
            var rate_err = self._updateRateLimit(data);
            return callback(rate_err, res);
        }
    });

    return this;
};

Uber.prototype.clearTokens = function clearTokens() {
    this.access_token = null;
    this.refresh_token = null;
};

Uber.prototype.isNumeric = function isNumeric(input) {
    return (!input || isNaN(input)) ? false : true;
};

Uber.prototype.getRequestURL = function getRequestURL(version, url) {
    return this.defaults.base_url + (version ? version : 'v1') + '/' + url;
};

Uber.prototype.deprecateMethod = function deprecateMethod(f, oldMethod, newMethod) {
    return util.deprecate(f, '`' + oldMethod + '` is deprecated. Please use `' + newMethod + '` instead.');
};
