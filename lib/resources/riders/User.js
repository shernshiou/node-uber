function User(uber) {
  this._uber = uber;
  this.path = ['me', 'history'];
  this.requiredScope = ['profile', 'history', 'history_lite'];
}

module.exports = User;

User.prototype.getHistory = function getHistory(off, lim, callback) {
  var newOffset = off || 0;
  // ensure query limit is set. Maximum is 50. Default is 5.
  var newLimit = (lim) ? Math.min(lim, 50) : 5;

  return this._uber.get({
    url: this.path[1],
    params: { offset: newOffset, limit: newLimit },
    scope: [this.requiredScope[1], this.requiredScope[2]]
  }, callback);
};

User.prototype.getProfile = function getProfile(callback) {
  return this._uber.get({
    url: this.path[0],
    scope: this.requiredScope[0]
  }, callback);
};

User.prototype.applyPromo = function applyPromo(promo, callback) {
  return this._uber.patch({
    url: this.path[0],
    params: { applied_promotion_codes: promo },
    scope: this.requiredScope[0]
  }, callback);
}
