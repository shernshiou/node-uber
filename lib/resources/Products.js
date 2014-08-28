function Products(uber) {
  this._uber = uber;
  this.path = 'products';
}

module.exports = Products;

Products.prototype.list = function (query, callback) {
  if (!query.latitude && !query.longitude) {
    return callback(new Error('Invalid parameters'));
  }

  return this._uber.get({ url: this.path, params: query }, callback);
};