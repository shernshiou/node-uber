var util = require('util');

function Products(uber) {
  this._uber = uber;
  this.path = 'products';
}

module.exports = Products;

Products.prototype.getAllForLocation = function getAllForLocation(lat, lon, callback) {
  if (!lat || !lon || !this._uber.validateCoordinates(lat, lon)) {
    return callback(new Error('Invalid latitude & longitude'));
  }

  return this._uber.get({ url: this.path, params: { latitude: lat, longitude: lon } }, callback);
};

Products.prototype.getByID = function getByID(id, callback) {
  if (!id || id === '') {
    return callback(new Error('Missing product_id parameter'));
  }

  return this._uber.get({ url: `${this.path}/${id}` }, callback);
};

// deprecated
Products.prototype.list = util.deprecate(function list(query, callback) {
  return Products.prototype.getAllForLocation(query.latitude, query.longitude, callback);
}, '`products.list` is deprecated. Please use `products.getAllForLocation` instead.');
