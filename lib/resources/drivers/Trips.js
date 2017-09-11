function Trips(uber) {
  this._uber = uber;
  this.path = 'partners/trips';
  this.requiredScope = 'partner.trips';
}

module.exports = Trips;

Trips.prototype.getTrips = function getTrips(off, lim, from, to, callback) {
  var newOffset = off || 0;
  // ensure query limit is set. Maximum is 50. Default is 5.
  var newLimit = (lim) ? Math.min(lim, 50) : 5;

  if(isNaN(new Date(from).getTime()) || isNaN(new Date(to).getTime())) {
    return callback(new Error('from_time and to_time need to be valid Unix timestamps'));
  }

  return this._uber.get({
    url: this.path,
    params: {
      offset: newOffset,
      limit: newLimit,
      from_time: from,
      to_time: to
     },
    scope: this.requiredScope
  }, callback);
};
