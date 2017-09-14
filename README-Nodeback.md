# Initialization

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
  sandbox: true // optional, defaults to false
});
```

> **Note**: For all available `language` options check out the [Localization page of the API](https://developer.uber.com/docs/localization).

# Authenticating

To make HTTP calls, you need to create an authenticated session with the API. User-specific operations require you to use a OAuth 2 bearer token with specific [scopes](https://developer.uber.com/docs/scopes). Jump to the [method overview section](https://github.com/shernshiou/node-uber#method-overview) to identify required scopes for methods. General operations can use a simple server-token authentication.

## Step one: Authorize

To obtain an OAuth 2 bearer token, you have to authorize your application with the required scope. Available scopes are: `history`, `history_lite`, `profile`, `request`, `all_trips`, and `places`.

To do so, you are initially required to redirect your user to an authorization URL. You can generate the authorization URL using `uber.getAuthorizeUrl`. In case you are using [Express](http://expressjs.com/), your route definition could look as follows:

```javascript
app.get('/api/login', function(request, response) {
  var url = uber.getAuthorizeUrl(['history','profile', 'request', 'places']);
  response.redirect(url);
});
```

The URL will lead to a page where your user will be required to login and approve access to his/her Uber account. In case that step was successful, Uber will issue an HTTP 302 redirect to the redirect_uri defined in the [Uber developer dashboard](https://developer.uber.com/dashboard). On that redirect, you will receive an authorization code, which is single use and expires in 10 minutes.

## Step two: Receive redirect and get an access token

To complete the authorization you now need to receive the callback and convert the given authorization code into an OAuth access token. You can accomplish that using `uber.authorization`. This method will retrieve and store the access_token, refresh_token, authorized scopes, and token expiration date within the uber object for consecutive requests.

Using Express, you could achieve that as follows:

```javascript
 app.get('/api/callback', function(request, response) {
    uber.authorization({
      authorization_code: request.query.code
    }, function(err, res) {
      if (err) {
        console.error(err);
      } else {
        // store the user id and associated properties:
        // access_token = res[0], refresh_token = res[1], scopes = res[2]),and token expiration date = res[3]
        console.log('New access_token retrieved: ' + res[0]);
        console.log('... token allows access to scopes: ' + res[2]);
        console.log('... token is valid until: ' + res[3]);
        console.log('... after token expiration, re-authorize using refresh_token: ' + res[1]);

        // redirect the user back to your actual app
        response.redirect('/web/index.html');
      }
    });
});
```

## Step three: Make HTTP requests to available resources

Now that you are authenticated, you can issue requests using provided methods.

For instance, to obtain a list of available Uber products for a specific location, you can use `uber.products.getAllForLocation`.

In case you are using Express, your route definition could look as follows:

```javascript
app.get('/api/products', function(request, response) {
  // extract the query from the request URL
  var query = url.parse(request.url, true).query;

  // if no query params sent, respond with Bad Request
  if (!query || !query.lat || !query.lng) {
    response.sendStatus(400);
  } else {
    uber.products.getAllForLocation(query.lat, query.lng, function(err, res) {
      if (err) {
        console.error(err);
        response.sendStatus(500);
      } else {
        response.json(res);
      }
    });
  }
});
```

### Optional: Revoke user access (token)

If your users decide to disconnect or revoke access to their Uber accounts, you can use the `uber.revokeToken` method. This will invalidate either `access_token` or `refresh_token`. Note that per [RFC7009](https://tools.ietf.org/html/rfc7009), revoke will return success for any string you pass into the function provided the client_id and client_secret are correct. This includes previously revoked tokens and invalid tokens.

```javascript
uber.revokeToken('My_access_token');
```

# Method Overview

## [Riders API](https://developer.uber.com/docs/riders/introduction)

HTTP Method | Endpoint                          | Auth Method           | Required Scope                                 | Methods
----------- | --------------------------------- | --------------------- | ---------------------------------------------- | ---------------------------------------
GET         | /v1.2/products                      | OAuth or server_token |                                                | products.getAllForAddress
GET         | /v1.2/products                      | OAuth or server_token |                                                | products.getAllForLocation
GET         | /v1.2/products/{product_id}         | OAuth or server_token |                                                | products.getByID
PUT         | /v1.2/sandbox/products/{product_id} | OAuth or server_token | (Sandbox mode)                                 | products.setSurgeMultiplierByID
PUT         | /v1.2/sandbox/products/{product_id} | OAuth or server_token | (Sandbox mode)                                 | products.setDriversAvailabilityByID
GET         | /v1.2/estimates/price               | OAuth or server_token |                                                | estimates.getPriceForRoute
GET         | /v1.2/estimates/price               | OAuth or server_token |                                                | estimates.getPriceForRouteByAddress
GET         | /v1.2/estimates/time                | OAuth or server_token |                                                | estimates.getETAForAddress
GET         | /v1.2/estimates/time                | OAuth or server_token |                                                | estimates.getETAForLocation
GET         | /v1.2/history                       | OAuth                 | history or history_lite                        | user.getHistory
GET         | /v1.2/me                            | OAuth                 | profile                                        | user.getProfile
PATCH       | /v1.2/me                            | OAuth                 | profile                                        | user.applyPromo
POST        | /v1.2/requests                      | OAuth                 | request (privileged)                           | requests.create
GET         | /v1.2/requests/current              | OAuth                 | request (privileged) or all_trips (privileged) | requests.getCurrent
PATCH       | /v1.2/requests/current              | OAuth                 | request (privileged)                           | requests.updateCurrent
DELETE      | /v1.2/requests/current              | OAuth                 | request (privileged)                           | requests.deleteCurrent
POST        | /v1.2/requests/estimate             | OAuth                 | request (privileged)                           | requests.getEstimates
GET         | /v1.2/requests/{request_id}         | OAuth                 | request (privileged)                           | requests.getByID
PATCH       | /v1.2/requests/{request_id}         | OAuth                 | request (privileged)                           | requests.updateByID
PUT         | /v1.2/sandbox/requests/{request_id} | OAuth                 | request (privileged & Sandbox mode )           | requests.setStatusByID
DELETE      | /v1.2/requests/{request_id}         | OAuth                 | request (privileged)                           | requests.deleteByID
GET         | /v1.2/requests/{request_id}/map     | OAuth                 | request (privileged)                           | requests.getMapByID
GET         | /v1.2/requests/{request_id}/receipt | OAuth                 | request_receipt (privileged)                   | requests.getReceiptByID
GET         | /v1.2/places/{place_id}             | OAuth                 | places                                         | places.getHome and places.getWork
PUT         | /v1.2/places/{place_id}             | OAuth                 | places                                         | places.updateHome and places.updateWork
GET         | /v1.2/payment-methods                | OAuth                 | request (privileged)                           | payment.getMethods

## [Drivers API](https://developer.uber.com/docs/drivers)

HTTP Method | Endpoint           | Auth Method | Required Scope   | Methods
----------- | ------------------ | ----------- | ---------------- | ---------------------------
GET         | /v1/partners/me       | OAuth       | partner.accounts | partnerprofile.getProfile
GET         | /v1/partners/payments | OAuth       | partner.payments | partnerpayments.getPayments
GET         | /v1/partners/trips    | OAuth       | partner.trips    | partnertrips.getTrips
# Endpoint Details

## Authorization (OAuth 2.0)

### Generate Authorize URL

After getting the authorize url, the user will be redirected to the redirect url with authorization code used in the next function.

```javascript
uber.getAuthorizeUrl(parameter);
```

#### Parameter

- Array of scopes

#### Example

```javascript
uber.getAuthorizeUrl(['history','profile', 'request', 'places']);
```

### Authorize

Used to convert authorization code or refresh token into access token.

```javascript
uber.authorization(parameter, callback);
```

#### Parameter

- JS Object with attribute `authorization_code` OR `refresh_token`

#### Example

> _Note:_ The callback return parameters changed with v1.0.0! This change was necessary to introduce promise-based callbacks.

> ```javascript
> uber.authorization({ refresh_token: 'REFRESH_TOKEN' },
>   function (err, res) {
>     if (err) console.error(err);
>     else {
>       // store the user id and associated properties:
>       // access_token = res[0], refresh_token = res[1], scopes = res[2]),and token expiration date = res[3]
>       console.log('New access_token retrieved: ' + res[0]);
>       console.log('... token allows access to scopes: ' + res[2]);
>       console.log('... token is valid until: ' + res[3]);
>       console.log('... after token expiration, re-authorize using refresh_token: ' + res[1]);
>     }
>   });
> ```

## /products

The product endpoint can be accessed either with an OAuth `access_token` or simply with the `server_token` because it is not user-specific. It has, therefore, no required scope for access.

### [Get available products for address](https://developer.uber.com/docs/v1-products)

This method utilizes [geocoder](https://github.com/wyattdanger/geocoder) to retrieve the coordinates for an address using Google as the provider. It uses the first element of the response. In other words, the coordinates represent what the Google algorithm provides with most confidence value.

> **Note**: To ensure correct coordinates you should provide the complete address, including city, ZIP code, state, and country.

```javascript
uber.products.getAllForAddress(address, callback);
```

#### Example

```javascript
uber.products.getAllForAddress('1455 Market St, San Francisco, CA 94103, US', function (err, res) {
  if (err) console.error(err);
  else console.log(res);
});
```

### [Get available products for location](https://developer.uber.com/docs/v1-products)

```javascript
uber.products.getAllForLocation(latitude, longitude, callback);
```

#### Example

```javascript
uber.products.getAllForLocation(3.1357169, 101.6881501, function (err, res) {
  if (err) console.error(err);
  else console.log(res);
});
```

### [Get product details by product_id](https://developer.uber.com/docs/v1-products-details)

```javascript
uber.products.getByID(product_id, callback);
```

#### Example

```javascript
uber.products.getByID('d4abaae7-f4d6-4152-91cc-77523e8165a4', function (err, res) {
  if (err) console.error(err);
  else console.log(res);
});
```

### [Set driver's availability by product_id](https://developer.uber.com/docs/sandbox)

```javascript
uber.products.setDriversAvailabilityByID(product_id, availability, callback);
```

> **Note**: This method is only allowed in Sandbox mode.

#### Parameter

- availability (boolean) will force requests to return a `no_drivers_available` error if set to false

#### Example

```javascript
uber.products.setDriversAvailabilityByID('d4abaae7-f4d6-4152-91cc-77523e8165a4', false, function (err, res) {
  if (err) console.error(err);
  else console.log(res);
});
```

### [Set surge multiplier by product_id](https://developer.uber.com/docs/sandbox)

```javascript
uber.products.setSurgeMultiplierByID(product_id, multiplier, callback);
```

> **Note**: This method is only allowed in Sandbox mode.

#### Parameter

- multiplier (float) will force two stage confirmation for requests if > 2.0

#### Example

```javascript
uber.products.setSurgeMultiplierByID('d4abaae7-f4d6-4152-91cc-77523e8165a4', 2.2, function (err, res) {
  if (err) console.error(err);
  else console.log(res);
});
```

## /estimates

The estimates endpoint can be accessed either with an OAuth `access_token` or simply with the `server_token` because it is not user-specific. It has, therefore, no required scope for access.

### [Get price estimates for specific address](https://developer.uber.com/docs/v1-estimates-price)

This method utilizes [geocoder](https://github.com/wyattdanger/geocoder) to retrieve the coordinates for an address using Google as the provider. It uses the first element of the response. In other words, the coordinates represent what the Google algorithm provides with most confidence value.

> **Note**: To ensure correct coordinates you should provide the complete address, including city, ZIP code, state, and country.

> ```javascript
> uber.estimates.getPriceForRouteByAddress(start_address, end_address, [, seats], callback);
> ```

`seats` defaults to 2, which is also the maximum value for this parameter.

#### Example

```javascript
uber.estimates.getPriceForRouteByAddress(
  '1455 Market St, San Francisco, CA 94103, US',
  '2675 Middlefield Rd, Palo Alto, CA 94306, US',
  function (err, res) {
  if (err) console.error(err);
  else console.log(res);
});
```

### [Get price estimates for specific route](https://developer.uber.com/docs/v1-estimates-price)

```javascript
uber.estimates.getPriceForRoute(start_latitude, start_longitude, end_latitude, end_longitude [, seats], callback);
```

`seats` defaults to 2, which is also the maximum value for this parameter.

#### Example

```javascript
uber.estimates.getPriceForRoute(3.1357169, 101.6881501, 3.0833, 101.6500, function (err, res) {
  if (err) console.error(err);
  else console.log(res);
});
```

### [Get ETA for address](https://developer.uber.com/docs/v1-estimates-time)

This method utilizes [geocoder](https://github.com/wyattdanger/geocoder) to retrieve the coordinates for an address using Google as the provider. It uses the first element of the response. In other words, the coordinates represent what the Google algorithm provides with most confidence value.

> **Note**: To ensure correct coordinates you should provide the complete address, including city, ZIP code, state, and country.

```javascript
uber.estimates.getETAForAddress(address, [, product_id], callback);
```

#### Example

```javascript
uber.estimates.getETAForAddress('455 Market St, San Francisco, CA 94103, US', function (err, res) {
  if (err) console.error(err);
  else console.log(res);
});
```

### [Get ETA for location](https://developer.uber.com/docs/v1-estimates-time)

```javascript
uber.estimates.getETAForLocation(latitude, longitude [, product_id], callback);
```

#### Example

```javascript
uber.estimates.getETAForLocation(3.1357169, 101.6881501, function (err, res) {
  if (err) console.error(err);
  else console.log(res);
});
```

## /history

The history endpoint can be accessed ONLY with an OAuth `access_token` authorized with either the `history` or `history_lite` (without city information) scope.

### [Get user activity](https://developer.uber.com/docs/v12-history)

```javascript
uber.user.getHistory(offset, limit, callback);
```

`offset` defaults to 0 and `limit` defaults to 5 with a maximum value of 50.

#### Example

```javascript
uber.user.getHistory(0, 5, function(err, res) {
  if (err) console.log(err);
  else console.log(res);
});
```

## /me

The me endpoint can be accessed ONLY with an OAuth `access_token` authorized with the `profile` scope.

### [Get user profile](https://developer.uber.com/docs/v1-me)

```javascript
uber.user.getProfile(callback);
```

#### Example

```javascript
uber.user.getProfile(function (err, res) {
  if (err) console.log(err);
  else console.log(res);
});
```

#### [Apply promo code to user account](https://developer.uber.com/docs/riders/references/api/v1.2/me-patch)

```javascript
uber.user.applyPromo(code);
```

##### Parameter

- user promotion code (string)

##### Example

```javascript
uber.user.applyPromo('FREE_RIDEZ', function (err, res) {
  if (err) console.log(err);
  else console.log(res);
});
```

## /requests

The requests endpoint can be accessed ONLY with an OAuth `access_token` authorized with the `request` scope.

### [Create new request](https://developer.uber.com/docs/v1-requests)

```javascript
uber.requests.create(parameter, callback);
```

#### Parameter

- JS Object with at least the following attributes:
  - `start_latitude` & `start_longitude` OR `start_place_id`
  - `end_latitude` & `end_longitude` OR `end_place_id`
  -  The key for the upfront fare of a ride (`fare_id`)
- You can provide `startAddress` instead of `start_latitude` & `start_longitude` and `endAddress` instead of `end_latitude` & `end_longitude` thanks to [geocoder](https://github.com/wyattdanger/geocoder)

> **Note**: To ensure correct coordinates you should provide the complete address, including city, ZIP code, state, and country.

#### Example

```javascript
uber.requests.create({
  "fare_id": "d30e732b8bba22c9cdc10513ee86380087cb4a6f89e37ad21ba2a39f3a1ba960",
  "product_id": "a1111c8c-c720-46c3-8534-2fcdd730040d",
  "start_latitude": 37.761492,
  "start_longitude": -122.423941,
  "end_latitude": 37.775393,
  "end_longitude": -122.417546
}, function (err, res) {
  if (err) console.error(err);
  else console.log(res);
});
```

### [Get current request](https://developer.uber.com/docs/v1-requests-current)

> **Note**: By default, only details about trips your app requested will be returned. This endpoint can be used with the scope `all_trips` to get all trips irrespective of which application initiated them.

```javascript
uber.requests.getCurrent(callback);
```

#### Example

```javascript
uber.requests.getCurrent(function (err, res) {
  if (err) console.log(err);
  else console.log(res);
});
```

### [Update current request](https://developer.uber.com/docs/v1-requests-current-patch)

```javascript
uber.requests.updateCurrent(parameter, callback);
```

#### Parameter

- JS Object with attributes to be updated (only destination-related attributes enabled)
- You can provide `startAddress` instead of `start_latitude` & `start_longitude` and `endAddress` instead of `end_latitude` & `end_longitude` thanks to [geocoder](https://github.com/wyattdanger/geocoder)

> **Note**: To ensure correct coordinates you should provide the complete address, including city, ZIP code, state, and country.

#### Example

```javascript
uber.requests.updateCurrent({
  "end_latitude": 37.775393,
  "end_longitude": -122.417546
}, function (err, res) {
  if (err) console.error(err);
  else console.log(res);
});
```

### [Delete current request](https://developer.uber.com/docs/v1-requests-current-delete)

```javascript
uber.requests.deleteCurrent(callback);
```

#### Example

```javascript
uber.requests.deleteCurrent(function (err, res) {
  if (err) console.log(err);
  else console.log(res);
});
```

### [Get estimates](https://developer.uber.com/docs/v1-requests-estimate)

```javascript
uber.requests.getEstimates(parameter, callback);
```

#### Parameter

- JS Object with at least the following attributes:
  - `start_latitude` & `start_longitude` OR `start_place_id`
  - `end_latitude` & `end_longitude` OR `end_place_id`
- You can provide `startAddress` instead of `start_latitude` & `start_longitude` and `endAddress` instead of `end_latitude` & `end_longitude` thanks to [geocoder](https://github.com/wyattdanger/geocoder)

> **Note**: To ensure correct coordinates you should provide the complete address, including city, ZIP code, state, and country.

#### Example

```javascript
uber.requests.getEstimates({
  "product_id": "a1111c8c-c720-46c3-8534-2fcdd730040d",
  "start_latitude": 37.761492,
  "start_longitude": -122.423941,
  "end_latitude": 37.775393,
  "end_longitude": -122.417546
}, function (err, res) {
  if (err) console.error(err);
  else console.log(res);
});
```

### [Get request by request_id](https://developer.uber.com/docs/v1-requests-details)

```javascript
uber.requests.getByID(request_id, callback);
```

#### Example

```javascript
uber.requests.getByID('17cb78a7-b672-4d34-a288-a6c6e44d5315', function (err, res) {
  if (err) console.log(err);
  else console.log(res);
});
```

### [Update request by request_id](https://developer.uber.com/docs/v1-requests-patch)

```javascript
uber.requests.updateByID(request_id, parameter, callback);
```

#### Parameter

- JS Object with attributes to be updated (only destination-related attributes enabled)
- You can provide `startAddress` instead of `start_latitude` & `start_longitude` and `endAddress` instead of `end_latitude` & `end_longitude` thanks to [geocoder](https://github.com/wyattdanger/geocoder)

> **Note**: To ensure correct coordinates you should provide the complete address, including city, ZIP code, state, and country.

#### Example

```javascript
uber.requests.updateByID('17cb78a7-b672-4d34-a288-a6c6e44d5315', {
  "end_latitude": 37.775393,
  "end_longitude": -122.417546
}, function (err, res) {
  if (err) console.error(err);
  else console.log(res);
});
```

### [Set request status by request_id](https://developer.uber.com/docs/sandbox)

```javascript
uber.requests.setStatusByID(request_id, status, callback);
```

> **Note**: This method is only allowed in Sandbox mode. Check out the [documentation](https://developer.uber.com/docs/sandbox) for valid status properties.

#### Example

```javascript
uber.requests.setStatusByID('17cb78a7-b672-4d34-a288-a6c6e44d5315', 'accepted', function (err, res) {
  if (err) console.error(err);
  else console.log(res);
});
```

### [Delete request by request_id](https://developer.uber.com/docs/v1-requests-cancel)

```javascript
uber.requests.deleteByID(request_id, callback);
```

#### Example

```javascript
uber.requests.deleteByID('17cb78a7-b672-4d34-a288-a6c6e44d5315', function (err, res) {
  if (err) console.log(err);
  else console.log(res);
});
```

### [Get request map by request_id](https://developer.uber.com/docs/v1-requests-map)

```javascript
uber.requests.getMapByID(request_id, callback);
```

Unless the referenced request is in status `accepted`, a 404 error will be returned.

#### Example

```javascript
uber.requests.getMapByID('17cb78a7-b672-4d34-a288-a6c6e44d5315', function (err, res) {
  if (err) console.log(err);
  else console.log(res);
});
```

### [Get request receipt by request_id](https://developer.uber.com/docs/v1-requests-receipt)

> **Note**: This endpoint requires OAuth authentication with the scope `request_receipt`

```javascript
uber.requests.getReceiptByID(request_id, callback);
```

The referenced request must be in status `completed`.

#### Example

```javascript
uber.requests.getReceiptByID('17cb78a7-b672-4d34-a288-a6c6e44d5315', function (err, res) {
  if (err) console.log(err);
  else console.log(res);
});
```

## /places

The places endpoint can be accessed ONLY with an OAuth `access_token` authorized with the `places` scope.

> **Note**: As of right now, only two place_ids are allowed: `home` and `work`.

### [Get home address](https://developer.uber.com/docs/v1-places-get)

```javascript
uber.places.getHome(callback);
```

#### Example

```javascript
uber.places.getHome(function (err, res) {
  if (err) console.log(err);
  else console.log(res);
});
```

### [Get work address](https://developer.uber.com/docs/v1-places-get)

```javascript
uber.places.getWork(callback);
```

#### Example

```javascript
uber.places.getWork(function (err, res) {
  if (err) console.log(err);
  else console.log(res);
});
```

### [Update home address](https://developer.uber.com/docs/v1-places-put)

```javascript
uber.places.updateHome(address, callback);
```

#### Example

```javascript
uber.places.updateHome('685 Market St, San Francisco, CA 94103, USA', function (err, res) {
  if (err) console.log(err);
  else console.log(res);
});
```

### [Update work address](https://developer.uber.com/docs/v1-places-put)

```javascript
uber.places.updateWork(address, callback);
```

#### Example

```javascript
uber.places.updateWork('1455 Market St, San Francisco, CA 94103, USA', function (err, res) {
  if (err) console.log(err);
  else console.log(res);
});
```

## /payment-methods

The payment-methods endpoint can be accessed ONLY with an OAuth `access_token` authorized with the `request` scope.

### [Get available payment methods](https://developer.uber.com/docs/v1-payment-methods)

```javascript
uber.payment.getMethods(callback);
```

#### Example

```javascript
uber.payment.getMethods(function (err, res) {
  if (err) console.log(err);
  else console.log(res);
});
```

## /partners

The partners endpoints (Driver API) can be accessed ONLY with an OAuth `access_token` authorized with [the respective scopes](https://developer.uber.com/docs/drivers/guides/scopes) (`partner.accounts`, `partner.trips`, or `partner.payments`).

### [Get driver profile](https://developer.uber.com/docs/drivers/references/api/v1/partners-me-get)

```javascript
uber.partnerprofile.getProfile(callback);
```

#### Example

```javascript
uber.partnerprofile.getProfile(function (err, res) {
  if (err) console.log(err);
  else console.log(res);
});
```

### [Get driver payments](https://developer.uber.com/docs/drivers/references/api/v1/partners-payments-get)

```javascript
uber.partnerpayments.getPayments(offset, limit, from_time, to_time, callback);
```

##### Parameter

- offset for payments list (sorted by creation time). Defaults to `0`
- limit of payments list. Defaults to `5`
- minimum Unix timestamp for filtered payments list
- maximum Unix timestamp for filtered payments list

#### Example

```javascript
uber.partnerpayments.getPayments(0, 50, 1451606400, 1505160819, function (err, res) {
  if (err) console.log(err);
  else console.log(res);
});
```

### [Get driver trips](https://developer.uber.com/docs/drivers/references/api/v1/partners-trips-get)

```javascript
uber.partnertrips.getTrips(offset, limit, from_time, to_time, callback);
```

##### Parameter

- offset for trips list (sorted by creation time). Defaults to `0`
- limit of trips list. Defaults to `5`
- minimum Unix timestamp for filtered trips list
- maximum Unix timestamp for filtered trips list

#### Example

```javascript
uber.partnertrips.getTrips(0, 50, 1451606400, 1505160819, function (err, res) {
  if (err) console.log(err);
  else console.log(res);
});
```
