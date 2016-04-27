var util = require('util');

function Reminders(uber) {
  this._uber = uber;
  this.path = 'reminders';
}

module.exports = Reminders;

Reminders.prototype.createReminder = function createReminder(parameters, callback) {
  if (!parameters || !parameters === '') {
    return callback(new Error('Invalid parameters'));
  }

  if (!parameters.reminder_time) {
    return callback(new Error('Missing parameter: reminder_time'));
  }

  if (!parameters.phone_number) {
    return callback(new Error('Missing parameter: phone_number'));
  }

  if (!parameters.event) {
    return callback(new Error('Missing parameter: event'));
  }

  if (!parameters.event.time) {
    return callback(new Error('Missing parameter: event.time'));
  }

  var accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }

  return this._uber.post({ url: this.path,
    params: parameters,
    access_token: accessToken }, callback);
};

Reminders.prototype.getReminderByID = function getReminderByID(id, callback) {
  var accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }

  if (!id || id === '') {
    return callback(new Error('Invalid reminder_id'));
  }

  return this._uber.get({ url: `${this.path}/${id}`, access_token: accessToken }, callback);
};

Reminders.prototype.updateReminderByID = function updateReminderByID(id, parameters, callback) {
  if (!parameters || !parameters === '') {
    return callback(new Error('Invalid parameters'));
  }

  var accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }

  if (!id || id === '') {
    return callback(new Error('Invalid reminder_id'));
  }

  return this._uber.patch({ url: `${this.path}/${id}`,
    params: parameters,
    access_token: accessToken }, callback);
};

Reminders.prototype.deleteReminderByID = function deleteReminderByID(id, callback) {
  var accessToken = this._uber.access_token;
  if (!accessToken) {
    return callback(new Error('Invalid access token'));
  }

  if (!id || id === '') {
    return callback(new Error('Invalid reminder_id'));
  }

  return this._uber.delete({ url: `${this.path}/${id}`, access_token: accessToken }, callback);
};
