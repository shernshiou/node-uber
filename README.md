[![License](http://img.shields.io/:license-mit-blue.svg)](http://doge.mit-license.org)
[![build status](https://img.shields.io/travis/shernshiou/node-uber.svg?style=flat-square)](https://travis-ci.org/shernshiou/node-uber) [![Dependency Status](https://david-dm.org/shernshiou/node-uber.svg?style=flat-square)](https://david-dm.org/shernshiou/node-uber) [![devDependency Status](https://david-dm.org/shernshiou/node-uber/dev-status.svg)](https://david-dm.org/shernshiou/node-uber#info=devDependencies)
[![Code Climate](https://codeclimate.com/github/shernshiou/node-uber/badges/gpa.svg)](https://codeclimate.com/github/shernshiou/node-uber) [![Test Coverage](https://codeclimate.com/github/shernshiou/node-uber/badges/coverage.svg)](https://codeclimate.com/github/shernshiou/node-uber/coverage)

Uber Rides Node.js Wrapper
=========
This projects helps you to make HTTP requests to the Uber Rides API.


Installation
------------

Before you begin, you need to register your app in the [Uber developer dashboard](https://developer.uber.com/dashboard). Notice that the app gets a client ID, secret, and server token required for authenticating with the API.

After registering your application, you need to install this module in your Node.js project:
```sh
npm install node-uber
```


Initialization
-----
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
  language: 'en_US' // optional, defaults to en_US
});
```

Authenticating
-----
To make HTTP calls, you need to create an authenticated session with the API. User-specific operations require you to use a OAuth 2 bearer token with specific [scopes](https://developer.uber.com/docs/scopes). Jump to the [method overview section](https://github.com/shernshiou/node-uber#method-overview) to identify required scopes for methods. General operations can use a simple server-token authentication.

### Step one: Authorize
To obtain an OAuth 2 bearer token, you have to authorize your application with the required scope. Available scopes are: ``history``, ``history_lite``, ``profile``, ``request``, ``all_trips``, and ``places``.

To do so, you are initially required to redirect your user to an authorization URL. You can generate the authorization URL using ``uber.getAuthorizeUrl``. In case you are using [Express](http://expressjs.com/), your route definition could look as follows:

```javascript
app.get('/api/login', function(request, response) {
  var url = uber.getAuthorizeUrl(['history','profile', 'request', 'places']);
  response.redirect(url);
});
```

The URL will lead to a page where your user will be required to login and approve access to his/her Uber account. In case that step was successful, Uber will issue an HTTP 302 redirect to the redirect_uri defined in the [Uber developer dashboard](https://developer.uber.com/dashboard). On that redirect, you will receive an authorization code, which is single use and expires in 10 minutes.

### Step two: Receive redirect and get an access token
 To complete the authorization you now need to receive the callback and convert the given authorization code into an OAuth access token. You can accomplish that using ``uber.authorization``. This method will retrieve and store the access token within the uber object for consecutive requests.

 Using Express, you could achieve that as follows:

 ```javascript
 app.get('/api/callback', function(request, response) {
    uber.authorization({
      authorization_code: request.query.code
    }, function(err, access_token, refresh_token) {
      if (err) {
        console.error(err);
      } else {
        // store the user id and associated access token
        // redirect the user back to your actual app
        response.redirect('/web/index.html');
      }
    });
});
 ```

### Step three: Make HTTP requests to available resources
Now that you are authenticated, you can issue requests using provided methods.

For instance, to obtain a list of available Uber products for a specific location, you can use ``uber.products.getAllForLocation``.

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

Method Overview
-------

| HTTP Method 	| Endpoint                          	| Auth Method            	| Required Scope                                   	| Methods                            	|
|-------------	|-----------------------------------	|------------------------	|-------------------------------------------------	|-----------------------------------	|
| GET         	| /v1/products                      	| OAuth or server_token 	|                                                 	| products.getAllForLocation        	|
| GET         	| /v1/products/{product_id}         	| OAuth or server_token 	|                                                 	| products.getByID                  	|
| GET         	| /v1/estimates/price               	| OAuth or server_token 	|                                                 	| estimates.getPriceForRoute        	|
| GET         	| /v1/estimates/time                	| OAuth or server_token 	|                                                 	| estimates.getETAForLocation       	|
| GET         	| /v1.2/history                     	| OAuth                  	| history or history_lite                          	| user.getHistory                   	|
| GET         	| /v1/me                            	| OAuth                  	| profile                                         	| user.getProfile                   	|
| POST        	| /v1/requests                      	| OAuth                  	| request (privileged)                            	| requests.create                   	|
| GET         	| /v1/requests/current              	| OAuth                  	| request (privileged) or all_trips (privileged)  	| requests.getCurrent               	|
| PATCH       	| /v1/requests/current              	| OAuth                  	| request (privileged)                            	| requests.updateCurrent            	|
| DELETE      	| /v1/requests/current              	| OAuth                  	| request (privileged)                            	| requests.deleteCurrent            	|
| POST        	| /v1/requests/estimate             	| OAuth                  	| request (privileged)                            	| requests.getEstimates             	|
| GET         	| /v1/requests/{request_id}         	| OAuth                  	| request (privileged)                            	| requests.getByID                  	|
| PATCH       	| /v1/requests/{request_id}         	| OAuth                  	| request (privileged)                            	| requests.updateByID               	|
| DELETE      	| /v1/requests/{request_id}         	| OAuth                  	| request (privileged)                            	| requests.deleteByID               	|
| GET         	| /v1/requests/{request_id}/map     	| OAuth                  	| request (privileged)                            	| requests.getMapByID               	|
| GET         	| /v1/requests/{request_id}/receipt 	| OAuth                  	| request_receipt (privileged)                    	| requests.getReceiptByID           	|
| GET         	| /v1/places/{place_id}             	| OAuth                  	| places                                          	| places.getHome and places.getWork 	|
| PUT         	| /v1/places/{place_id}             	| OAuth                  	| places                                          	| places.updateByID                 	|
| GET         	| v1/payment-methods                	| OAuth                  	| request (privileged)                            	| payment.getMethods                	|
| POST        	| /v1/reminders                     	| server_token           	|                                                 	| reminders.create                  	|
| GET         	| /v1/reminders/{reminder_id}       	| server_token           	|                                                 	| reminders.getByID                 	|
| PATCH       	| /v1/reminders/{reminder_id}       	| server_token           	|                                                 	| reminders.updateByID              	|
| DELETE      	| /v1/reminders/{reminder_id}       	| server_token           	|                                                 	| reminders.deleteByID              	|


Endpoint Details
---------------------

### Authorization (OAuth 2.0)

#### Generate Authorize URL
After getting the authorize url, the user will be redirected to the redirect url with authorization code used in the next function.
```javascript
uber.getAuthorizeUrl(parameter);
```
##### Parameter
* Array of scopes

##### Example
```javascript
uber.getAuthorizeUrl(['history','profile', 'request', 'places']);
```

#### Authorize
Used to convert authorization code or refresh token into access token.
```javascript
uber.authorization(parameter, callback);
```
##### Parameter
* JS Object with attribute ``authorization_code`` OR ``refresh_token``

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

### /products
The product endpoint can be accessed either with an OAuth ``access_token`` or simply with the ``server_token`` because it is not user-specific. It has, therefore, no required scope for access.

#### [Get available products for location](https://developer.uber.com/docs/v1-products)
```javascript
uber.products.getAllForLocation(latitude, longitude, callback);
```

##### Example
```javascript
uber.products.getAllForLocation(3.1357, 101.6880, function (err, res) {
  if (err) console.error(err);
  else console.log(res);
});
```

#### [Get product details by product_id](https://developer.uber.com/docs/v1-products-details)
```javascript
uber.products.getByID(product_id, callback);
```

##### Example
```javascript
uber.products.getByID('d4abaae7-f4d6-4152-91cc-77523e8165a4', function (err, res) {
  if (err) console.error(err);
  else console.log(res);
});
```

### /estimates
The estimates endpoint can be accessed either with an OAuth ``access_token`` or simply with the ``server_token`` because it is not user-specific. It has, therefore, no required scope for access.

#### [Get price estimates for specific route](https://developer.uber.com/docs/v1-estimates-price)
```javascript
uber.estimates.getPriceForRoute(start_latitude, start_longitude, end_latitude, end_longitude [, seats], callback);
```

``seats`` default to 2, which is also the maximum value for this parameter.

##### Example
```javascript
uber.estimates.getPriceForRoute(3.1357, 101.6880, 3.0833, 101.6500, function (err, res) {
  if (err) console.error(err);
  else console.log(res);
});
```

#### [Get ETA for location](https://developer.uber.com/docs/v1-estimates-time)
```javascript
uber.estimates.getETAForLocation(latitude, longitude [, product_id], callback);
```

##### Example
```javascript
uber.estimates.getETAForLocation(3.1357, 101.6880, function (err, res) {
  if (err) console.error(err);
  else console.log(res);
});
```

### /history
The history endpoint can be accessed ONLY with an OAuth ``access_token`` authorized with either the ``history`` or ``history_lite`` (without city information) scope.

#### [Get user activity](https://developer.uber.com/docs/v12-history)
```javascript
uber.user.getHistory(offset, limit [, access_token], callback);
```

``offset`` defaults to 0 and ``limit`` defaults to 5 with a maximum value of 50.

##### Example
```javascript
uber.user.getHistory(0, 5, function(err, res) {
  if (err) console.log(err);
  else console.log(res);
});
```

### /me
The me endpoint can be accessed ONLY with an OAuth ``access_token`` authorized with either the ``profile`` scope.
#### [Get user profile](https://developer.uber.com/docs/v1-me)
```javascript
uber.user.getProfile([access_token], callback);
```

##### Example
```javascript
uber.user.getProfile(function (err, res) {
  if (err) console.log(err);
  else console.log(res);
});
```

Test
------------
You can execute all existing tests using script ``test/allTests.js``. These tests include linting, code coverage, and unit tests.

```sh
npm test
```

In case you would like to contribute to this project, please ensure that all the tests pass before you create a PR. We have a strict code style and code coverage (>= 95%) requirements.

Version History
-------
The change-log can be found in the [Wiki: Version History](https://github.com/shernshiou/node-uber/wiki/Version-History).

TODOs
------------
- [ ] Update README to cover all modified and new methods
- [ ] Add translations via 'Accept-Language'
- [ ] Test translation support
- [ ] Advance Sandbox implementation
- [ ] Implement rate limit status
- [ ] Leverage Surge Pricing responses
- [ ] Checks for scopes
- [ ] Checks for auth methods
- [ ] Leverage Webhooks
