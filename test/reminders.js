var common = require("./common"),
    should = common.should,
    uber = common.uber,
    reply = common.jsonReply,
    ac = common.authCode;

it('should create new reminder', function(done) {
    uber.reminders.create({
        reminder_time: 1429294463,
        phone_number: 16508420126,
        event: {
            time: 1429294463,
            name: 'Frisbee with friends',
            location: 'Dolores Park',
            latitude: 37.7598258,
            longitude: -122.4260558,
            product_id: 'a1111c8c-c720-46c3-8534-2fcdd730040d'
        },
        trip_branding: {
            link_text: 'View team roster',
            partner_deeplink: 'partner://team/9383'
        }
    }, function(err, res) {
        should.not.exist(err);
        res.should.deep.equal(reply('reminder'));
        done();
    });
});

it('should create new reminder using address', function(done) {
    uber.reminders.create({
        reminder_time: 1429294463,
        phone_number: 16508420126,
        event: {
            time: 1429294463,
            name: 'Frisbee with friends',
            location: 'Dolores Park',
            address: 'C',
            product_id: 'a1111c8c-c720-46c3-8534-2fcdd730040d'
        },
        trip_branding: {
            link_text: 'View team roster',
            partner_deeplink: 'partner://team/9383'
        }
    }, function(err, res) {
        should.not.exist(err);
        res.should.deep.equal(reply('reminder'));
        done();
    });
});

it('should return error for new reminder with empty address', function(done) {
    uber.reminders.create({
        reminder_time: 1429294463,
        phone_number: 16508420126,
        event: {
            time: 1429294463,
            name: 'Frisbee with friends',
            location: 'Dolores Park',
            address: ' ',
            product_id: 'a1111c8c-c720-46c3-8534-2fcdd730040d'
        },
        trip_branding: {
            link_text: 'View team roster',
            partner_deeplink: 'partner://team/9383'
        }
    }, function(err, res) {
        err.message.should.equal('No coordinates found for: " "');
        done();
    });
});

it('should return error for new reminder with null address', function(done) {
    uber.reminders.create({
        reminder_time: 1429294463,
        phone_number: 16508420126,
        event: {
            time: 1429294463,
            name: 'Frisbee with friends',
            location: 'Dolores Park',
            address: null,
            product_id: 'a1111c8c-c720-46c3-8534-2fcdd730040d'
        },
        trip_branding: {
            link_text: 'View team roster',
            partner_deeplink: 'partner://team/9383'
        }
    }, function(err, res) {
        err.message.should.equal('Geocoder.geocode requires a location.');
        done();
    });
});

it('should return error if there is no required params for POST', function(done) {
    uber.reminders.create(null, function(err, res) {
        err.message.should.equal('Invalid parameters');
        done();
    });
});

it('should return error if reminder time is missing for POST', function(done) {
    uber.reminders.create({
        phone_number: 16508420126,
        event: {
            time: 1429294463,
            name: 'Frisbee with friends',
            location: 'Dolores Park',
            latitude: 37.7598258,
            longitude: -122.4260558,
            product_id: 'a1111c8c-c720-46c3-8534-2fcdd730040d'
        },
        trip_branding: {
            link_text: 'View team roster',
            partner_deeplink: 'partner://team/9383'
        }
    }, function(err, res) {
        err.message.should.equal('Missing parameter(s). Ensure to declare: reminder_time, phone_number, event & event.time');
        done();
    });
});

it('should return error if phone number is missing for POST', function(done) {
    uber.reminders.create({
        reminder_time: 1429294463,
        event: {
            time: 1429294463,
            name: 'Frisbee with friends',
            location: 'Dolores Park',
            latitude: 37.7598258,
            longitude: -122.4260558,
            product_id: 'a1111c8c-c720-46c3-8534-2fcdd730040d'
        },
        trip_branding: {
            link_text: 'View team roster',
            partner_deeplink: 'partner://team/9383'
        }
    }, function(err, res) {
        err.message.should.equal('Missing parameter(s). Ensure to declare: reminder_time, phone_number, event & event.time');
        done();
    });
});

it('should return error if event object is missing for POST', function(done) {
    uber.reminders.create({
        phone_number: 16508420126,
        reminder_time: 1429294463,
        event: {
            name: 'Frisbee with friends',
            location: 'Dolores Park',
            latitude: 37.7598258,
            longitude: -122.4260558,
            product_id: 'a1111c8c-c720-46c3-8534-2fcdd730040d'
        },
        trip_branding: {
            link_text: 'View team roster',
            partner_deeplink: 'partner://team/9383'
        }
    }, function(err, res) {
        err.message.should.equal('Missing parameter(s). Ensure to declare: reminder_time, phone_number, event & event.time');
        done();
    });
});

it('should return error if event.time is missing for POST', function(done) {
    uber.reminders.create({
        phone_number: 16508420126,
        reminder_time: 1429294463,
        trip_branding: {
            link_text: 'View team roster',
            partner_deeplink: 'partner://team/9383'
        }
    }, function(err, res) {
        err.message.should.equal('Missing parameter(s). Ensure to declare: reminder_time, phone_number, event & event.time');
        done();
    });
});

it('should get existing reminder by ID', function(done) {
    uber.reminders.getByID('def-456', function(err, res) {
        should.not.exist(err);
        res.should.deep.equal(reply('reminder'));
        done();
    });
});

it('should return error in case of missing reminder ID', function(done) {
    uber.reminders.getByID(null, function(err, res) {
        err.message.should.equal('Invalid reminder_id');
        done();
    });
});

it('should patch an existing reminder by ID', function(done) {
    uber.reminders.updateByID('def-456', {
        reminder_time: 1429294463,
        phone_number: 16508420126,
        event: {
            time: 1429294463,
            name: 'Frisbee with friends',
            location: 'Dolores Park',
            latitude: 37.7598258,
            longitude: -122.4260558,
            product_id: 'a1111c8c-c720-46c3-8534-2fcdd730040d'
        },
        trip_branding: {
            link_text: 'View team roster',
            partner_deeplink: 'partner://team/9383'
        }
    }, function(err, res) {
        should.not.exist(err);
        res.should.deep.equal(reply('reminder'));
        done();
    });
});

it('should patch an existing reminder by ID using address', function(done) {
    uber.reminders.updateByID('def-456', {
        reminder_time: 1429294463,
        phone_number: 16508420126,
        event: {
            time: 1429294463,
            name: 'Frisbee with friends',
            location: 'Dolores Park',
            address: 'C',
            product_id: 'a1111c8c-c720-46c3-8534-2fcdd730040d'
        },
        trip_branding: {
            link_text: 'View team roster',
            partner_deeplink: 'partner://team/9383'
        }
    }, function(err, res) {
        should.not.exist(err);
        res.should.deep.equal(reply('reminder'));
        done();
    });
});

it('should return error for update reminder by ID using invalid address', function(done) {
    uber.reminders.updateByID('def-456', {
        reminder_time: 1429294463,
        phone_number: 16508420126,
        event: {
            time: 1429294463,
            name: 'Frisbee with friends',
            location: 'Dolores Park',
            address: ' ',
            product_id: 'a1111c8c-c720-46c3-8534-2fcdd730040d'
        },
        trip_branding: {
            link_text: 'View team roster',
            partner_deeplink: 'partner://team/9383'
        }
    }, function(err, res) {
        err.message.should.equal('No coordinates found for: " "');
        done();
    });
});

it('should return error in case of missing reminder ID for patch', function(done) {
    uber.reminders.updateByID(null, {
        reminder_time: 1429294463,
        phone_number: 16508420126,
        event: {
            time: 1429294463,
            name: 'Frisbee with friends',
            location: 'Dolores Park',
            latitude: 37.7598258,
            longitude: -122.4260558,
            product_id: 'a1111c8c-c720-46c3-8534-2fcdd730040d'
        },
        trip_branding: {
            link_text: 'View team roster',
            partner_deeplink: 'partner://team/9383'
        }
    }, function(err, res) {
        err.message.should.equal('Invalid reminder_id');
        done();
    });
});

it('should return error in case of missing parameters for patch', function(done) {
    uber.reminders.updateByID('def-456', null, function(err, res) {
        err.message.should.equal('Invalid parameters');
        done();
    });
});

it('should delete an existing reminder by ID', function(done) {
    uber.reminders.deleteByID('def-456', function(err, res) {
        should.not.exist(err);
        done();
    });
});

it('should return error in case of missing reminder ID for delete', function(done) {
    uber.reminders.deleteByID(null, function(err, res) {
        err.message.should.equal('Invalid reminder_id');
        done();
    });
});
