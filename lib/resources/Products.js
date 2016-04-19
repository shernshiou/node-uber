"use strict";

const util = require('util');

function Products(uber) {
  this._uber = uber;
  this.path = 'products';
}

module.exports = Products;

Products.prototype.getAllForLocation = function getAllForLocation(query, callback) {
  if (!query.latitude && !query.longitude) {
    return callback(new Error('Invalid parameters'));
  }

  return this._uber.get({ url: this.path, params: query }, callback);
};

Products.prototype.getByID = function getByID(query, callback) {
  if (!query.product_id || query.product_id === '') {
    return callback(new Error('Missing product_id parameter'));
  }

  return this._uber.get({ url: `${this.path}/${query.product_id}` }, callback);
};

// deprecated
Products.prototype.list = util.deprecate(function list(query, callback) {
  return Products.prototype.getAllForLocation(query, callback);
}, '`products.list` is deprecated. Please use `products.getAllForLocation` instead.');
