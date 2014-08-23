function Products(uber) {
  this._uber = uber;
  this.path = 'products';
}

module.exports = Products;

Products.prototype.get = function (query, callback) {
  return this._uber.get({ url: this.path, params: query }, callback);
};