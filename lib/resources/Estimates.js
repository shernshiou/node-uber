function Estimates(uber) {
  this._uber = uber;
  this.path = 'estimates';
}

module.exports = Estimates;

Estimates.prototype.price = function (query, callback) {
  if (!query.start_latitude && !query.start_longitude && 
    !query.end_latitude && !query.end_longitude) {
      return callback(new Error('Invalid parameters'));
    }

  return this._uber.get({ url: this.path + '/price', params: query }, callback);
};

Estimates.prototype.time = function (query, callback) {
  if (!query.start_latitude && !query.start_longitude) {
    return callback(new Error('Invalid parameters'));
  }
  
  return this._uber.get({ url: this.path + '/time', params: query }, callback);
};