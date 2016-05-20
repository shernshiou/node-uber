function Products(uber) {
  this._uber = uber;
  this.path = 'products';

  // deprecated
  this.list = this._uber.deprecateMethod(function list(query, callback) {
    return this.getAllForLocation(query.latitude, query.longitude, callback);
  }, this.path + '.list', this.path + '.getAllForLocation');
}

module.exports = Products;

Products.prototype.getAllForLocation = function getAllForLocation(lat, lon, callback) {
  if (!lat || !lon) {
    return callback(new Error('Invalid latitude & longitude'));
  }

  return this._uber.get({ url: this.path, params: { latitude: lat, longitude: lon }, server_token: true }, callback);
};

Products.prototype.getByID = function getByID(id, callback) {
  if (!id) {
    return callback(new Error('Missing product_id parameter'));
  }

  return this._uber.get({ url: this.path + '/' + id, server_token: true }, callback);
};
