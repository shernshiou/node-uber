function Places(uber) {
  this._uber = uber;
  this.path = 'places';
  this.requiredScope = 'places';
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
    url: this.path + '/' + id,
    scope: this.requiredScope
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

  return this._uber.put({
    url: this.path + '/' + id,
    params: { address: newAddress },
    scope: this.requiredScope
  }, callback);
};

Places.prototype.updateHome = function updateHome(newAddress, callback) {
  return this.updateByID('home', newAddress, callback);
};

Places.prototype.updateWork = function updateWork(newAddress, callback) {
  return this.updateByID('work', newAddress, callback);
};
