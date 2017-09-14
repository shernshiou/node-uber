[![Join the chat at https://gitter.im/shernshiou/node-uber](https://badges.gitter.im/shernshiou/node-uber.svg)](https://gitter.im/shernshiou/node-uber?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![License](http://img.shields.io/:license-mit-blue.svg)](http://doge.mit-license.org) [![build status](https://img.shields.io/travis/shernshiou/node-uber.svg?style=flat-square)](https://travis-ci.org/shernshiou/node-uber) [![Dependency Status](https://david-dm.org/shernshiou/node-uber.svg?style=flat-square)](https://david-dm.org/shernshiou/node-uber) [![devDependency Status](https://david-dm.org/shernshiou/node-uber/dev-status.svg)](https://david-dm.org/shernshiou/node-uber#info=devDependencies) [![Code Climate](https://codeclimate.com/github/shernshiou/node-uber/badges/gpa.svg)](https://codeclimate.com/github/shernshiou/node-uber) [![Test Coverage](https://codeclimate.com/github/shernshiou/node-uber/badges/coverage.svg)](https://codeclimate.com/github/shernshiou/node-uber/coverage)

# Uber Rides Node.js Wrapper

This projects helps you to make HTTP requests to the Uber Rides API.

## Installation

Before you begin, you need to register your app in the [Uber developer dashboard](https://developer.uber.com/dashboard). Notice that the app gets a client ID, secret, and server token required for authenticating with the API.

After registering your application, you need to install this module in your Node.js project:

```sh
npm install node-uber
```

## Initialization

In order to use this module, you have to import it in your application first:

```javasctipt
var Uber = require('node-uber');
```

Next, initialize the Uber object with the keys you obtained from the [Uber developer dashboard](https://developer.uber.com/dashboard):

```javasctipt
var uber = new Uber({
  client_id: 'CLIENT_ID',
  client_secret: 'CLIENT_SECRET',
  server_token: 'SERVER_TOKEN',
  redirect_uri: 'REDIRECT URL',
  name: 'APP_NAME',
  language: 'en_US', // optional, defaults to en_US
  sandbox: true, // optional, defaults to false
  proxy: 'PROXY URL' // optional, defaults to none
});
```

> **Note**: For all available `language` options check out the [Localization page of the API](https://developer.uber.com/docs/localization).

## Authenticating

To make HTTP calls, you need to create an authenticated session with the API. User-specific operations require you to use a OAuth 2 bearer token with specific [scopes](https://developer.uber.com/docs/scopes). Jump to the [method overview section](https://github.com/shernshiou/node-uber#method-overview) to identify required scopes for methods. General operations can use a simple server-token authentication.

### Step one: Authorize

To obtain an OAuth 2 bearer token, you have to authorize your application with the required scope. Available scopes are: `history`, `history_lite`, `profile`, `request`, `all_trips`, and `places`.

To do so, you are initially required to redirect your user to an authorization URL. You can generate the authorization URL using `uber.getAuthorizeUrl`. In case you are using [Express](http://expressjs.com/), your route definition could look as follows:

```javascript
app.get('/api/login', function(request, response) {
  var url = uber.getAuthorizeUrl(['history','profile', 'request', 'places']);
  response.redirect(url);
});
```

The URL will lead to a page where your user will be required to login and approve access to his/her Uber account. In case that step was successful, Uber will issue an HTTP 302 redirect to the redirect_uri defined in the [Uber developer dashboard](https://developer.uber.com/dashboard). On that redirect, you will receive an authorization code, which is single use and expires in 10 minutes.

### Step two: Receive redirect and get an access token

To complete the authorization you now need to receive the callback and convert the given authorization code into an OAuth access token. You can accomplish that using `uber.authorizationAsync`. This method will retrieve and store the access_token, refresh_token, authorized scopes, and token expiration date within the uber object for consecutive requests.

Using Express, you could achieve that as follows:

```javascript
 app.get('/api/callback', function(request, response) {
    uber.authorizationAsync({authorization_code: request.query.code})
    .spread(function(access_token, refresh_token, authorizedScopes, tokenExpiration) {
      // store the user id and associated access_token, refresh_token, scopes and token expiration date
      console.log('New access_token retrieved: ' + access_token);
      console.log('... token allows access to scopes: ' + authorizedScopes);
      console.log('... token is valid until: ' + tokenExpiration);
      console.log('... after token expiration, re-authorize using refresh_token: ' + refresh_token);

      // redirect the user back to your actual app
      response.redirect('/web/index.html');
    })
    .error(function(err) {
      console.error(err);
    });
});
```

> **Nodeback**: Looking for nodeback-style methods? Check out the [nodeback-readme](README-Nodeback.md).

### Step three: Make HTTP requests to available resources

Now that you are authenticated, you can issue requests using provided methods.

For instance, to obtain a list of available Uber products for a specific location, you can use `uber.products.getAllForLocationAsync`.

In case you are using Express, your route definition could look as follows:

```javascript
app.get('/api/products', function(request, response) {
  // extract the query from the request URL
  var query = url.parse(request.url, true).query;

  // if no query params sent, respond with Bad Request
  if (!query || !query.lat || !query.lng) {
    response.sendStatus(400);
  } else {
    uber.products.getAllForLocationAsync(query.lat, query.lng)
    .then(function(res) {
        response.json(res);
    })
    .error(function(err) {
      console.error(err);
      response.sendStatus(500);
    });
  }
});
```

### Optional: Revoke user access (token)

If your users decide to disconnect or revoke access to their Uber accounts, you can use the `uber.revokeTokenAsync` method. This will invalidate either `access_token` or `refresh_token`. Note that per [RFC7009](https://tools.ietf.org/html/rfc7009), revoke will return success for any string you pass into the function provided the client_id and client_secret are correct. This includes previously revoked tokens and invalid tokens.

```javascript
uber.revokeTokenAsync('My_access_token');
```

## Method Overview

> **Nodeback**: Looking for nodeback-style methods? Check out the [nodeback-readme](README-Nodeback.md).

## [Riders API](https://developer.uber.com/docs/riders/introduction)

HTTP Method | Endpoint                          | Auth Method           | Required Scope                                 | Methods
----------- | --------------------------------- | --------------------- | ---------------------------------------------- | -------------------------------------------------
GET         | /v1.2/products                      | OAuth or server_token |                                                | products.getAllForAddressAsync
GET         | /v1.2/products                      | OAuth or server_token |                                                | products.getAllForLocationAsync
GET         | /v1.2/products/{product_id}         | OAuth or server_token |                                                | products.getByIDAsync
PUT         | /v1.2/sandbox/products/{product_id} | OAuth or server_token | (Sandbox mode)                                 | products.setSurgeMultiplierByIDAsync
PUT         | /v1.2/sandbox/products/{product_id} | OAuth or server_token | (Sandbox mode)                                 | products.setDriversAvailabilityByIDAsync
GET         | /v1.2/estimates/price               | OAuth or server_token |                                                | estimates.getPriceForRouteAsync
GET         | /v1.2/estimates/price               | OAuth or server_token |                                                | estimates.getPriceForRouteByAddressAsync
GET         | /v1.2/estimates/time                | OAuth or server_token |                                                | estimates.getETAForAddressAsync
GET         | /v1.2/estimates/time                | OAuth or server_token |                                                | estimates.getETAForLocationAsync
GET         | /v1.2/history                     | OAuth                 | history or history_lite                        | user.getHistoryAsync
GET         | /v1.2/me                            | OAuth                 | profile                                        | user.getProfileAsync
PATCH       | /v1.2/me                          | OAuth                 | profile                                        | user.applyPromoAsync
POST        | /v1.2/requests                      | OAuth                 | request (privileged)                           | requests.createAsync
GET         | /v1.2/requests/current              | OAuth                 | request (privileged) or all_trips (privileged) | requests.getCurrentAsync
PATCH       | /v1.2/requests/current              | OAuth                 | request (privileged)                           | requests.updateCurrentAsync
DELETE      | /v1.2/requests/current              | OAuth                 | request (privileged)                           | requests.deleteCurrentAsync
POST        | /v1.2/requests/estimate             | OAuth                 | request (privileged)                           | requests.getEstimatesAsync
GET         | /v1.2/requests/{request_id}         | OAuth                 | request (privileged)                           | requests.getByIDAsync
PATCH       | /v1.2/requests/{request_id}         | OAuth                 | request (privileged)                           | requests.updateByIDAsync
PUT         | /v1.2/sandbox/requests/{request_id} | OAuth                 | request (privileged & Sandbox mode )           | requests.setStatusByIDAsync
DELETE      | /v1.2/requests/{request_id}         | OAuth                 | request (privileged)                           | requests.deleteByIDAsync
GET         | /v1.2/requests/{request_id}/map     | OAuth                 | request (privileged)                           | requests.getMapByIDAsync
GET         | /v1.2/requests/{request_id}/receipt | OAuth                 | request_receipt (privileged)                   | requests.getReceiptByIDAsync
GET         | /v1.2/places/{place_id}             | OAuth                 | places                                         | places.getHomeAsync and places.getWorkAsync
PUT         | /v1.2/places/{place_id}             | OAuth                 | places                                         | places.updateHomeAsync and places.updateWorkAsync
GET         | /v1.2/payment-methods                | OAuth                 | request (privileged)                           | payment.getMethodsAsync

## [Drivers API](https://developer.uber.com/docs/drivers)

HTTP Method | Endpoint           | Auth Method | Required Scope   | Methods
----------- | ------------------ | ----------- | ---------------- | --------------------------------
GET         | /v1/partners/me       | OAuth       | partner.accounts | partnerprofile.getProfileAsync
GET         | /v1/partners/payments | OAuth       | partner.payments | partnerpayments.getPaymentsAsync
GET         | /v1/partners/trips    | OAuth       | partner.trips    | partnertrips.getTripsAsync

## Endpoint Details

### Authorization (OAuth 2.0)

#### Generate Authorize URL

After getting the authorize url, the user will be redirected to the redirect url with authorization code used in the next function.

```javascript
uber.getAuthorizeUrl(parameter);
```

##### Parameter

- Array of scopes

##### Example

```javascript
uber.getAuthorizeUrl(['history','profile', 'request', 'places']);
```

#### Authorize

Used to convert authorization code or refresh token into access token.

```javascript
uber.authorizationAsync(parameter);
```

##### Parameter

- JS Object with attribute `authorization_code` OR `refresh_token`

##### Example: Just access_token

```javascript
uber.authorizationAsync({ refresh_token: 'REFRESH_TOKEN' })
  .then(function(access_token) { console.log(access_token); })
  .error(function(err) { console.error(err); });
});
```

##### Example: All properties

```javascript
uber.authorizationAsync({ refresh_token: 'REFRESH_TOKEN' })
.spread(function(access_token, refresh_token, authorizedScopes, tokenExpiration) {
  // store the user id and associated access_token, refresh_token, scopes and token expiration date
  console.log('New access_token retrieved: ' + access_token);
  console.log('... token allows access to scopes: ' + authorizedScopes);
  console.log('... token is valid until: ' + tokenExpiration);
  console.log('... after token expiration, re-authorize using refresh_token: ' + refresh_token);
})
  .error(function(err) { console.error(err); });
});
```

### /products

The product endpoint can be accessed either with an OAuth `access_token` or simply with the `server_token` because it is not user-specific. It has, therefore, no required scope for access.

#### [Get available products for address](https://developer.uber.com/docs/v1-products)

This method utilizes [geocoder](https://github.com/wyattdanger/geocoder) to retrieve the coordinates for an address using Google as the provider. It uses the first element of the response. In other words, the coordinates represent what the Google algorithm provides with most confidence value.

> **Note**: To ensure correct coordinates you should provide the complete address, including city, ZIP code, state, and country.

```javascript
uber.products.getAllForAddressAsync(address);
```

##### Example

```javascript
uber.products.getAllForAddressAsync('1455 Market St, San Francisco, CA 94103, US')
.then(function(res) { console.log(res); })
.error(function(err) { console.error(err); });
```

#### [Get available products for location](https://developer.uber.com/docs/v1-products)

```javascript
uber.products.getAllForLocationAsync(latitude, longitude);
```

##### Example

```javascript
uber.products.getAllForLocationAsync(3.1357169, 101.6881501)
.then(function(res) { console.log(res); })
.error(function(err) { console.error(err); });
```

#### [Get product details by product_id](https://developer.uber.com/docs/v1-products-details)

```javascript
uber.products.getByIDAsync(product_id);
```

##### Example

```javascript
uber.products.getByIDAsync('d4abaae7-f4d6-4152-91cc-77523e8165a4')
.then(function(res) { console.log(res); })
.error(function(err) { console.error(err); });
```

#### [Set driver's availability by product_id](https://developer.uber.com/docs/sandbox)

```javascript
uber.products.setDriversAvailabilityByIDAsync(product_id, availability);
```

> **Note**: This method is only allowed in Sandbox mode.

##### Parameter

- availability (boolean) will force requests to return a `no_drivers_available` error if set to false

##### Example

```javascript
uber.products.setDriversAvailabilityByIDAsync('d4abaae7-f4d6-4152-91cc-77523e8165a4', false)
.then(function(res) { console.log(res); })
.error(function(err) { console.error(err); });
```

#### [Set surge multiplier by product_id](https://developer.uber.com/docs/sandbox)

```javascript
uber.products.setSurgeMultiplierByIDAsync(product_id, multiplier);
```

> **Note**: This method is only allowed in Sandbox mode.

##### Parameter

- multiplier (float) will force two stage confirmation for requests if > 2.0

##### Example

```javascript
uber.products.setSurgeMultiplierByIDAsync('d4abaae7-f4d6-4152-91cc-77523e8165a4', 2.2)
.then(function(res) { console.log(res); })
.error(function(err) { console.error(err); });
```

### /estimates

The estimates endpoint can be accessed either with an OAuth `access_token` or simply with the `server_token` because it is not user-specific. It has, therefore, no required scope for access.

#### [Get price estimates for specific address](https://developer.uber.com/docs/v1-estimates-price)

This method utilizes [geocoder](https://github.com/wyattdanger/geocoder) to retrieve the coordinates for an address using Google as the provider. It uses the first element of the response. In other words, the coordinates represent what the Google algorithm provides with most confidence value.

> **Note**: To ensure correct coordinates you should provide the complete address, including city, ZIP code, state, and country.

> ```javascript
> uber.estimates.getPriceForRouteByAddressAsync(start_address, end_address, [, seats]);
> ```

`seats` defaults to 2, which is also the maximum value for this parameter.

##### Example

```javascript
uber.estimates.getPriceForRouteByAddressAsync(
  '1455 Market St, San Francisco, CA 94103, US',
  '2675 Middlefield Rd, Palo Alto, CA 94306, US')
  .then(function(res) { console.log(res); })
  .error(function(err) { console.error(err); });
```

#### [Get price estimates for specific route](https://developer.uber.com/docs/v1-estimates-price)

```javascript
uber.estimates.getPriceForRouteAsync(start_latitude, start_longitude, end_latitude, end_longitude [, seats]);
```

`seats` defaults to 2, which is also the maximum value for this parameter.

##### Example

```javascript
uber.estimates.getPriceForRouteAsync(3.1357169, 101.6881501, 3.0833, 101.6500)
.then(function(res) { console.log(res); })
.error(function(err) { console.error(err); });
```

#### [Get ETA for address](https://developer.uber.com/docs/v1-estimates-time)

This method utilizes [geocoder](https://github.com/wyattdanger/geocoder) to retrieve the coordinates for an address using Google as the provider. It uses the first element of the response. In other words, the coordinates represent what the Google algorithm provides with most confidence value.

> **Note**: To ensure correct coordinates you should provide the complete address, including city, ZIP code, state, and country.

```javascript
uber.estimates.getETAForAddressAsync(address, [, product_id]);
```

##### Example

```javascript
uber.estimates.getETAForAddressAsync('455 Market St, San Francisco, CA 94103, US')
.then(function(res) { console.log(res); })
.error(function(err) { console.error(err); });
});
```

#### [Get ETA for location](https://developer.uber.com/docs/v1-estimates-time)

```javascript
uber.estimates.getETAForLocationAsync(latitude, longitude [, product_id]);
```

##### Example

```javascript
uber.estimates.getETAForLocationAsync(3.1357169, 101.6881501)
.then(function(res) { console.log(res); })
.error(function(err) { console.error(err); });
```

### /history

The history endpoint can be accessed ONLY with an OAuth `access_token` authorized with either the `history` or `history_lite` (without city information) scope.

#### [Get user activity](https://developer.uber.com/docs/v12-history)

```javascript
uber.user.getHistoryAsync(offset, limit);
```

`offset` defaults to 0 and `limit` defaults to 5 with a maximum value of 50.

##### Example

```javascript
uber.user.getHistoryAsync(0, 5)
.then(function(res) { console.log(res); })
.error(function(err) { console.error(err); });
```

### /me

The me endpoint can be accessed ONLY with an OAuth `access_token` authorized with the `profile` scope.

#### [Get user profile](https://developer.uber.com/docs/v1-me)

```javascript
uber.user.getProfileAsync();
```

##### Example

```javascript
uber.user.getProfileAsync()
.then(function(res) { console.log(res); })
.error(function(err) { console.error(err); });
```

#### [Apply promo code to user account](https://developer.uber.com/docs/riders/references/api/v1.2/me-patch)

```javascript
uber.user.applyPromoAsync(code);
```

##### Parameter

- user promotion code (string)

##### Example

```javascript
uber.user.applyPromoAsync('FREE_RIDEZ')
.then(function(res) { console.log(res); })
.error(function(err) { console.error(err); });
```

### /requests

The requests endpoint can be accessed ONLY with an OAuth `access_token` authorized with the `request` scope.

#### [Create new request](https://developer.uber.com/docs/v1-requests)

```javascript
uber.requests.createAsync(parameter);
```

##### Parameter

- JS Object with at least the following attributes:
  - `start_latitude` & `start_longitude` OR `start_place_id`
  - `end_latitude` & `end_longitude` OR `end_place_id`
  -  The key for the upfront fare of a ride (`fare_id`)
- You can provide `startAddress` instead of `start_latitude` & `start_longitude` and `endAddress` instead of `end_latitude` & `end_longitude` thanks to [geocoder](https://github.com/wyattdanger/geocoder)

> **Note**: To ensure correct coordinates you should provide the complete address, including city, ZIP code, state, and country.

##### Example

```javascript
uber.requests.createAsync({
  "fare_id": "d30e732b8bba22c9cdc10513ee86380087cb4a6f89e37ad21ba2a39f3a1ba960",
  "product_id": "a1111c8c-c720-46c3-8534-2fcdd730040d",
  "start_latitude": 37.761492,
  "start_longitude": -122.423941,
  "end_latitude": 37.775393,
  "end_longitude": -122.417546
})
.then(function(res) { console.log(res); })
.error(function(err) { console.error(err); });
```

#### [Get current request](https://developer.uber.com/docs/v1-requests-current)

> **Note**: By default, only details about trips your app requested will be returned. This endpoint can be used with the scope `all_trips` to get all trips irrespective of which application initiated them.

```javascript
uber.requests.getCurrentAsync();
```

##### Example

```javascript
uber.requests.getCurrentAsync()
.then(function(res) { console.log(res); })
.error(function(err) { console.error(err); });
```

#### [Update current request](https://developer.uber.com/docs/v1-requests-current-patch)

```javascript
uber.requests.updateCurrentAsync(parameter);
```

##### Parameter

- JS Object with attributes to be updated (only destination-related attributes enabled)
- You can provide `startAddress` instead of `start_latitude` & `start_longitude` and `endAddress` instead of `end_latitude` & `end_longitude` thanks to [geocoder](https://github.com/wyattdanger/geocoder)

> **Note**: To ensure correct coordinates you should provide the complete address, including city, ZIP code, state, and country.

##### Example

```javascript
uber.requests.updateCurrentAsync({
  "end_latitude": 37.775393,
  "end_longitude": -122.417546
})
.then(function(res) { console.log(res); })
.error(function(err) { console.error(err); });
```

#### [Delete current request](https://developer.uber.com/docs/v1-requests-current-delete)

```javascript
uber.requests.deleteCurrentAsync();
```

##### Example

```javascript
uber.requests.deleteCurrentAsync()
.then(function(res) { console.log(res); })
.error(function(err) { console.error(err); });
```

#### [Get estimates](https://developer.uber.com/docs/v1-requests-estimate)

```javascript
uber.requests.getEstimatesAsync(parameter);
```

##### Parameter

- JS Object with at least the following attributes:
  - `start_latitude` & `start_longitude` OR `start_place_id`
  - `end_latitude` & `end_longitude` OR `end_place_id`
- You can provide `startAddress` instead of `start_latitude` & `start_longitude` and `endAddress` instead of `end_latitude` & `end_longitude` thanks to [geocoder](https://github.com/wyattdanger/geocoder)

> **Note**: To ensure correct coordinates you should provide the complete address, including city, ZIP code, state, and country.

##### Example

```javascript
uber.requests.getEstimatesAsync({
  "product_id": "a1111c8c-c720-46c3-8534-2fcdd730040d",
  "start_latitude": 37.761492,
  "start_longitude": -122.423941,
  "end_latitude": 37.775393,
  "end_longitude": -122.417546
})
.then(function(res) { console.log(res); })
.error(function(err) { console.error(err); });
```

#### [Get request by request_id](https://developer.uber.com/docs/v1-requests-details)

```javascript
uber.requests.getByIDAsync(request_id);
```

##### Example

```javascript
uber.requests.getByIDAsync('17cb78a7-b672-4d34-a288-a6c6e44d5315')
.then(function(res) { console.log(res); })
.error(function(err) { console.error(err); });
```

#### [Update request by request_id](https://developer.uber.com/docs/v1-requests-patch)

```javascript
uber.requests.updateByIDAsync(request_id, parameter);
```

##### Parameter

- JS Object with attributes to be updated (only destination-related attributes enabled)
- You can provide `startAddress` instead of `start_latitude` & `start_longitude` and `endAddress` instead of `end_latitude` & `end_longitude` thanks to [geocoder](https://github.com/wyattdanger/geocoder)

> **Note**: To ensure correct coordinates you should provide the complete address, including city, ZIP code, state, and country.

##### Example

```javascript
uber.requests.updateByIDAsync('17cb78a7-b672-4d34-a288-a6c6e44d5315', {
  "end_latitude": 37.775393,
  "end_longitude": -122.417546
})
.then(function(res) { console.log(res); })
.error(function(err) { console.error(err); });
```

#### [Set request status by request_id](https://developer.uber.com/docs/sandbox)

```javascript
uber.requests.setStatusByIDAsync(request_id, status);
```

> **Note**: This method is only allowed in Sandbox mode. Check out the [documentation](https://developer.uber.com/docs/sandbox) for valid status properties.

##### Example

```javascript
uber.requests.setStatusByIDAsync('17cb78a7-b672-4d34-a288-a6c6e44d5315', 'accepted')
.then(function(res) { console.log(res); })
.error(function(err) { console.error(err); });
```

#### [Delete request by request_id](https://developer.uber.com/docs/v1-requests-cancel)

```javascript
uber.requests.deleteByIDAsync(request_id);
```

##### Example

```javascript
uber.requests.deleteByIDAsync('17cb78a7-b672-4d34-a288-a6c6e44d5315')
.then(function(res) { console.log(res); })
.error(function(err) { console.error(err); });
```

#### [Get request map by request_id](https://developer.uber.com/docs/v1-requests-map)

```javascript
uber.requests.getMapByIDAsync(request_id);
```

Unless the referenced request is in status `accepted`, a 404 error will be returned.

##### Example

```javascript
uber.requests.getMapByIDAsync('17cb78a7-b672-4d34-a288-a6c6e44d5315')
.then(function(res) { console.log(res); })
.error(function(err) { console.error(err); });
```

#### [Get request receipt by request_id](https://developer.uber.com/docs/v1-requests-receipt)

> **Note**: This endpoint requires OAuth authentication with the scope `request_receipt`

```javascript
uber.requests.getReceiptByIDAsync(request_id);
```

The referenced request must be in status `completed`.

##### Example

```javascript
uber.requests.getReceiptByIDAsync('17cb78a7-b672-4d34-a288-a6c6e44d5315')
.then(function(res) { console.log(res); })
.error(function(err) { console.error(err); });
```

### /places

The places endpoint can be accessed ONLY with an OAuth `access_token` authorized with the `places` scope.

> **Note**: As of right now, only two place_ids are allowed: `home` and `work`.

#### [Get home address](https://developer.uber.com/docs/v1-places-get)

```javascript
uber.places.getHomeAsync();
```

##### Example

```javascript
uber.places.getHomeAsync()
.then(function(res) { console.log(res); })
.error(function(err) { console.error(err); });
```

#### [Get work address](https://developer.uber.com/docs/v1-places-get)

```javascript
uber.places.getWorkAsync();
```

##### Example

```javascript
uber.places.getWorkAsync()
.then(function(res) { console.log(res); })
.error(function(err) { console.error(err); });
```

#### [Update home address](https://developer.uber.com/docs/v1-places-put)

```javascript
uber.places.updateHomeAsync(address);
```

##### Example

```javascript
uber.places.updateHomeAsync('685 Market St, San Francisco, CA 94103, USA')
.then(function(res) { console.log(res); })
.error(function(err) { console.error(err); });
```

#### [Update work address](https://developer.uber.com/docs/v1-places-put)

```javascript
uber.places.updateWorkAsync(address);
```

##### Example

```javascript
uber.places.updateWorkAsync('1455 Market St, San Francisco, CA 94103, USA')
.then(function(res) { console.log(res); })
.error(function(err) { console.error(err); });
```

### /payment-methods

The payment-methods endpoint can be accessed ONLY with an OAuth `access_token` authorized with the `request` scope.

#### [Get available payment methods](https://developer.uber.com/docs/v1-payment-methods)

```javascript
uber.payment.getMethodsAsync();
```

##### Example

```javascript
uber.payment.getMethodsAsync()
.then(function(res) { console.log(res); })
.error(function(err) { console.error(err); });
```

### /partners

The partners endpoints (Driver API) can be accessed ONLY with an OAuth `access_token` authorized with [the respective scopes](https://developer.uber.com/docs/drivers/guides/scopes) (`partner.accounts`, `partner.trips`, or `partner.payments`).

#### [Get driver profile](https://developer.uber.com/docs/drivers/references/api/v1/partners-me-get)

```javascript
uber.partnerprofile.getProfileAsync();
```

##### Example

```javascript
uber.partnerprofile.getProfileAsync()
.then(function(res) { console.log(res); })
.error(function(err) { console.error(err); });
```

#### [Get driver payments](https://developer.uber.com/docs/drivers/references/api/v1/partners-payments-get)

```javascript
uber.partnerpayments.getPaymentsAsync(offset, limit, from_time, to_time);
```

##### Parameter

- offset for payments list (sorted by creation time). Defaults to `0`
- limit of payments list. Defaults to `5`
- minimum Unix timestamp for filtered payments list
- maximum Unix timestamp for filtered payments list

##### Example

```javascript
uber.partnerpayments.getPaymentsAsync(0, 50, 1451606400, 1505160819)
.then(function(res) { console.log(res); })
.error(function(err) { console.error(err); });
```

#### [Get driver trips](https://developer.uber.com/docs/drivers/references/api/v1/partners-trips-get)

```javascript
uber.partnertrips.getTripsAsync(offset, limit, from_time, to_time);
```

##### Parameter

- offset for trips list (sorted by creation time). Defaults to `0`
- limit of trips list. Defaults to `5`
- minimum Unix timestamp for filtered trips list
- maximum Unix timestamp for filtered trips list

##### Example

```javascript
uber.partnertrips.getTripsAsync(0, 50, 1451606400, 1505160819)
.then(function(res) { console.log(res); })
.error(function(err) { console.error(err); });
```

## Test

You can execute all existing tests using script `test/allTests.js`. These tests include linting, code coverage, and unit tests.

```sh
npm test
```

In case you would like to contribute to this project, please ensure that all the tests pass before you create a PR. We have strict code style and code coverage (>= 95%) requirements.

## Version History

The change-log can be found in the [Wiki: Version History](https://github.com/shernshiou/node-uber/wiki/Version-History).
