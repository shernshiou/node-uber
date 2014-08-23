function Estimates(uber) {
  this._uber = uber;
  this.path = 'estimates';
}

module.exports = Estimates;

Estimates.prototype.getPrice = function (query, callback) {
  return this._uber.get({ url: this.path + '/price', params: query }, callback);
};

Estimates.prototype.getTime = function (query, callback) {
  return this._uber.get({ url: this.path + '/time', params: query }, callback);
};