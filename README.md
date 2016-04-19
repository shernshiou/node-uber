node-uber
=========
[![build status](https://img.shields.io/travis/shernshiou/node-uber.svg?style=flat-square)](https://travis-ci.org/shernshiou/node-uber) [![npm version](http://img.shields.io/npm/v/gh-badges.svg?style=flat-square)](https://npmjs.org/package/gh-badges) [![Dependency Status](https://david-dm.org/shernshiou/node-uber.svg?style=flat-square)](https://david-dm.org/shernshiou/node-uber) [![devDependency Status](https://david-dm.org/shernshiou/node-uber/dev-status.svg)](https://david-dm.org/shernshiou/node-uber#info=devDependencies)

A Node.js wrapper for Uber API


Version
-------
0.0.9 Support Payment-Methods

0.0.8 Support Places

0.0.7 Support multiple scopes

0.0.6 Support User History v1.2

0.0.5 Support Promotions & Fixes oauth warning message

0.0.4 Mocha tests

0.0.3 Error handling

0.0.2 Support User Profile

0.0.1 Support Product Types, Time Estimates & Price Estimates

License
-------

MIT

Implementation Status
-------
- [x] GET /v1/products - ``products.getAllForLocation``
- [x] GET /v1/products/{product_id} - ``products.getByID``
- [x] GET /v1/estimates/price - ``estimates.getPriceForRoute``
- [x] GET /v1/estimates/time - ``estimates.getETAForLocation``
- [x] GET /v1.2/history - ``user.getHistory``
- [x] GET /v1/me - ``user.getProfile``
- [x] POST /v1/requests - ``requests.createRequest``
- [x] GET /v1/requests/current - ``requests.getCurrentRequest``
- [x] PATCH /v1/requests/current - ``requests.updateCurrentRequest``
- [x] DELETE /v1/requests/current - ``requests.deleteCurrentRequest``
- [x] POST /v1/requests/estimate - ``requests.getEstimatesForCurrentRequest``
- [] GET /v1/requests/{request_id}
- [] PATCH /v1/requests/{request_id}
- [] DELETE /v1/requests/{request_id}
- [] GET /v1/requests/{request_id}/map
- [] GET /v1/requests/{request_id}/receipt
- [x] GET /v1/places/{place_id} - ``places.getHome`` and ``places.getWork``
- [] PUT /v1/places/{place_id}
- [x] GET /v1/payment-methods - ``payment.getMethods``
- [] POST /v1/reminders
- [] GET /v1/reminders/{reminder_id}
- [] PATCH /v1/reminders/{reminder_id}
- [] DELETE /v1/reminders/{reminder_id}

Installation
------------

```sh
npm install node-uber
```

Test
------------

```sh
npm test
```

Usage
-----
```javascript
var Uber = require('node-uber');

var uber = new Uber({
  client_id: 'CLIENT_ID',
  client_secret: 'CLIENT_SECRET',
  server_token: 'SERVER_TOKEN',
  redirect_uri: 'REDIRECT URL',
  name: 'APP_NAME'
});
```

Resources / Endpoints
---------------------

### Authorization (OAuth 2.0)
#### Authrorize Url
After getting the authorize url, the user will be redirected to the redirect url with authorization code used in the next function.
```javascript
uber.getAuthorizeUrl(params);
```

##### Params
* scope (array)

_NOTE: `history` scope is still not working_

##### Example
```javascript
uber.getAuthorizeUrl(['profile']);
```
#### Authorization
Used to convert authorization code or refresh token into access token.
```javascript
uber.authorization(params, callback);
```
##### Params
* authorization_code OR
* refresh_token

##### Example
```javascript
uber.authorization({ refresh_token: 'REFRESH_TOKEN' },
  function (err, access_token, refresh_token) {
    if (err) console.error(err);
    else {
      console.log(access_token);
      console.log(refresh_token);
    }
  });

```

### Product
#### Types
```javascript
uber.products.list(params, callback);
```
##### Params
* latitude
* longitude

##### Example
```javascript
uber.products.list({ latitude: 3.1357, longitude: 101.6880 }, function (err, res) {
  if (err) console.error(err);
  else console.log(res);
});
```


### Estimates
#### Price
```javascript
uber.estimates.price(params, callback);
```
##### Params
* start_latitude
* start_longitude
* end_latitude
* end_longitude

##### Example
```javascript
uber.estimates.price({
  start_latitude: 3.1357, start_longitude: 101.6880,
  end_latitude: 3.0833, end_longitude: 101.6500
}, function (err, res) {
  if (err) console.error(err);
  else console.log(res);
});
```

#### Time
```javascript
uber.estimates.time(params, callback);
```
##### Params
* start_latitude
* start_longitude
* customer_uuid (not implemented)
* product_id (not implemented)

##### Example
```javascript
uber.estimates.time({
  start_latitude: 3.1357, start_longitude: 101.6880
}, function (err, res) {
  if (err) console.error(err);
  else console.log(res);
});
```

### User
#### Activity
```javascript
uber.user.activity(params, callback);
```

##### Params
* access_token
* offset (defautls to 0)
* limit (defaults to 5, maximum 50)

##### Example
```javascript
uber.user.activity({
  access_token: 'ACCESS_TOKEN'
}, function (err, res) {
  if (err) console.log(err);
  else console.log(res);
});
```

#### Profile
```javascript
uber.user.profile(params, callback);
```

##### Params (optional)
* access_token

_If this params is unable, the object will try to retrieve `access_token` inside_

##### Example
```javascript
uber.user.profile(params, function (err, res) {
  if (err) console.log(err);
  else console.log(res);
});
```

### Places
The `/places/{place_id}` endpoint provides access to predefined addresses for the current user. Must have authorization with `places` scope.

Right now, only home and work `place_id` is supported by the Uber API.



#### Home
```javascript
uber.places.home(callback);
```

##### Example
```javascript
uber.places.home(function(err, res) {
  if (err) {
    console.log(err);
  } else {
    console.log(res);
  }
});
```

#### Work
```javascript
uber.places.work(callback);
```

##### Example
```javascript
uber.places.work(function(err, res) {
  if (err) {
    console.log(err);
  } else {
    console.log(res);
  }
});
```

### Payment-Methods
The `/payment-methods` endpoint allows retrieving the list of the user’s available payment methods. These can be leveraged in order to supply a payment_method_id to the POST /v1/requests endpoint. Must have authorization with `request` scope.

```javascript
uber.payment.methods(callback);
```

#### Example
```javascript
uber.payment.methods(function(err, res) {
  if (err) {
    console.log(err);
  } else {
    console.log(res);
  }
});
```
