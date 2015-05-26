function Promotions(uber) {
  this._uber = uber;
  this.path = 'promotions';
}

module.exports = Promotions;

Promotions.prototype.list = function (query, callback) {
  if (!query.start_latitude || !query.start_longitude || 
    !query.end_latitude || !query.end_longitude) {
      return callback(new Error('Invalid parameters'));
    }

  return this._uber.get({ url: this.path, params: query }, callback);
};