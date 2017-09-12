function PartnerProfile(uber) {
  this._uber = uber;
  this.path = 'partners/me';
  this.requiredScope = 'partner.accounts';
}

module.exports = PartnerProfile;

PartnerProfile.prototype.getProfile = function getProfile(callback) {
  return this._uber.get({
    url: this.path,
    scope: this.requiredScope
  }, callback);
};
