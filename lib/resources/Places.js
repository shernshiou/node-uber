function Places(uber) {
  this._uber = uber;
  this.path = 'places';

  // deprecated
  this.home = this._uber.deprecateMethod(function home(callback) {
    return this.getHome(callback);
  }, this.path + '.home', this.path + '.getHome');

  this.work = this._uber.deprecateMethod(function work(callback) {
    return this.getWork(callback);
  }, this.path + '.work', this.path + '.getWork');
}

module.exports = Places;

Places.prototype.getByID = function getByID(id, callback) {
  if (!id) {
    return callback(new Error('Invalid place_id'));
  }

  // as long as only two ids are allowed
  if (id !== 'home' && id !== 'work') {
    return callback(new Error('place_id needs to be either "home" or "work"'));
  }

  var options = {
    url: this.path + '/' + id
  };

  return this._uber.get(options, callback);
};

Places.prototype.getHome = function getHome(callback) {
  return this.getByID('home', callback);
};

Places.prototype.getWork = function getWork(callback) {
  return this.getByID('work', callback);
};

Places.prototype.updateByID = function updateByID(id, newAddress, callback) {
  if (!id) {
    return callback(new Error('Invalid place_id'));
  }

  // as long as only two ids are allowed
  if (id !== 'home' && id !== 'work') {
    return callback(new Error('place_id needs to be either "home" or "work"'));
  }

  if (!newAddress) {
    return callback(new Error('Invalid address'));
  }

  return this._uber.put({ url: this.path + '/' + id,
    params: { address: newAddress }}, callback);
};

Places.prototype.updateHome = function updateHome(newAddress, callback) {
  return this.updateByID('home', newAddress, callback);
};

Places.prototype.updateWork = function updateWork(newAddress, callback) {
  return this.updateByID('work', newAddress, callback);
};
