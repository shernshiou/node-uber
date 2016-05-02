var util = require('util');

function Places(uber) {
  this._uber = uber;
  this.path = 'places';
}

module.exports = Places;

Places.prototype.getPlaceByID = function getPlaceByID(id, callback) {
  var accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }

  if (!id || id === '') {
    return callback(new Error('Invalid place_id'));
  }

  // as long as only two ids are allowed
  if (id !== 'home' && id !== 'work') {
    return callback(new Error('place_id needs to be either "home" or "work"'));
  }

  var options = {
    url: this.path + '/' + id,
    access_token: accessToken
  };

  return this._uber.get(options, callback);
};

Places.prototype.getHome = function getHome(callback) {
  return this.getPlaceByID('home', callback);
};

Places.prototype.getWork = function getWork(callback) {
  return this.getPlaceByID('work', callback);
};

Places.prototype.updatePlaceByID = function updatePlaceByID(id, newAddress, callback) {
  var accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }

  if (!id || id === '') {
    return callback(new Error('Invalid place_id'));
  }

  // as long as only two ids are allowed
  if (id !== 'home' && id !== 'work') {
    return callback(new Error('place_id needs to be either "home" or "work"'));
  }

  if (!newAddress || newAddress === '') {
    return callback(new Error('Invalid address'));
  }

  return this._uber.put({ url: this.path + '/' + id,
    params: { address: newAddress },
    access_token: accessToken }, callback);
};

// deprecated
Places.prototype.home = util.deprecate(function home(callback) {
  return this.getHome(callback);
}, '`places.home` is deprecated. Please use `places.getHome` instead.');

// deprecated
Places.prototype.work = util.deprecate(function work(callback) {
  return this.getWork(callback);
}, '`places.work` is deprecated. Please use `places.getWork` instead.');
