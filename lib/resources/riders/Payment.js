function Payment(uber) {
    this._uber = uber;
    this.path = 'payment-methods';
    this.requiredScope = 'request';
}

module.exports = Payment;

Payment.prototype.getMethods = function getMethods(callback) {
    return this._uber.get({
        url: this.path,
        scope: this.requiredScope
    }, callback);
};
