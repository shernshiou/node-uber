var common = require("../common"),
    should = common.should,
    uber = common.uber,
    reply = common.jsonReply,
    ac = common.authCode,
    acNP = common.authCodeNoProfile;

describe('Profile', function() {
    it('should return invalid access token error when no token found', function(done) {
        uber.clearTokens();
        uber.user.getProfile(function(err, res) {
            err.message.should.equal('Invalid access token');
            done();
        });
    });

    it('should get user profile after authentication', function(done) {
        uber.authorization({
                authorization_code: ac
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.user.getProfile(function(err, res) {
                    should.not.exist(err);
                    res.should.deep.equal(reply('riders/profile'));
                    done();
                });
            });
    });

    it('should return error for user profile with missing profile scope', function(done) {
        uber.authorization({
                authorization_code: acNP
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.user.getProfile(function(err, res) {
                    err.message.should.equal('Required scope not found');
                    done();
                });
            });
    });

    it('should fail apply promo code for user profile after authentication', function(done) {
        uber.authorization({
                authorization_code: ac
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.user.applyPromo('already-used-code', function(err, res) {
                    should.exist(err);
                    done();
                });
            });
    });

    it('should successfully apply promo code for user profile after authentication', function(done) {
        uber.authorization({
                authorization_code: ac
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.user.applyPromo('FREE_RIDEZ', function(err, res) {
                    should.exist(res);
                    should.not.exist(err);
                    res.should.deep.equal(reply('riders/profilePromoSuccess'));
                    done();
                });
            });
    });
});

describe('History', function() {
    it('should get user activity after authentication', function(done) {
        uber.authorization({
                authorization_code: ac
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.user.getHistory(0, 5, function(err, res) {
                    should.not.exist(err);
                    res.should.deep.equal(reply('riders/history'));
                    done();
                });
            });
    });

    it('should get user activity after authentication, even with a too high limit', function(done) {
        uber.authorization({
                authorization_code: ac
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.user.getHistory(0, 99, function(err, res) {
                    should.not.exist(err);
                    res.should.deep.equal(reply('riders/history'));
                    done();
                });
            });
    });

    it('should get user activity after authentication without required parameters', function(done) {
        uber.authorization({
                authorization_code: ac
            },
            function(err, accessToken, refreshToken) {
                should.not.exist(err);
                uber.user.getHistory(null, null, function(err, res) {
                    should.not.exist(err);
                    res.should.deep.equal(reply('riders/history'));
                    done();
                });
            });
    });

    it('should return invalid access token error when no token found', function(done) {
        uber.clearTokens();
        uber.user.getHistory(null, null, function(err, res) {
            err.message.should.equal('Invalid access token');
            done();
        });
    });
});
