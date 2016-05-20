function Reminders(uber) {
    this._uber = uber;
    this.path = 'reminders';
}

module.exports = Reminders;

Reminders.prototype.create = function create(parameters, callback) {
    if (!parameters) {
        return callback(new Error('Invalid parameters'));
    } else if (!this.checkReminderParameter(parameters)) {
        return callback(new Error('Missing parameter(s). Ensure to declare: reminder_time, phone_number, event & event.time'));
    } else {
        // reminders resource requires to be accessed using server_token
        parameters.auth_type = 'server_token';

        return this._uber.post({
            url: this.path,
            params: parameters,
            server_token: true
        }, callback);
    }
};

Reminders.prototype.checkReminderParameter = function checkReminderParameter(params) {
    return (!params.reminder_time || !params.phone_number || !params.event || !params.event.time) ? false : true;
}

Reminders.prototype.checkReminderId = function checkReminderId(id) {
    return id ? true : false;
}

Reminders.prototype.getByID = function getByID(id, callback) {
    if(!this.checkReminderId(id)) {
        return callback(new Error('Invalid reminder_id'));
    }

    return this._uber.get({
        url: this.path + '/' + id,
        server_token: true
    }, callback);
};

Reminders.prototype.updateByID = function updateByID(id, parameters, callback) {
    if (!parameters) {
        return callback(new Error('Invalid parameters'));
    }

    if(!this.checkReminderId(id)) {
        return callback(new Error('Invalid reminder_id'));
    }

    // reminders resource requires to be accessed using server_token
    parameters.auth_type = 'server_token';

    return this._uber.patch({
        url: this.path + '/' + id,
        params: parameters,
        server_token: true
    }, callback);
};

Reminders.prototype.deleteByID = function deleteByID(id, callback) {
    if (!id) {
        return callback(new Error('Invalid reminder_id'));
    }

    return this._uber.delete({
        url: this.path + '/' + id,
        params: {
            auth_type: 'server_token'
        },
        server_token: true
    }, callback);
};
