function Payment(uber) {
    this._uber = uber;
    this.path = 'payment-methods';

    // deprecated
    this.methods = this._uber.deprecateMethod(function methods(callback) {
        return this.getMethods(callback);
    }, 'payment.methods', 'payment.getMethods');
}

module.exports = Payment;

Payment.prototype.getMethods = function getMethods(callback) {
    return this._uber.get({
        url: this.path
    }, callback);
};
