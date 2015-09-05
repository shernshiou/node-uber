var Uber = require('node-uber');


var uberClient = new Uber({
  client_id: 'YOUR CLIENT ID',
  client_secret: 'YOUR CLIENT SECRET',
  server_token: 'YOUR SERVER TOKEN',
  redirect_uri: 'http://localhost/callback',
  name: 'nodejs uber wrapper'
});

uberClient.authorization({ authorization_code: 'SOME AUTH CODE' }, 
  function (err, accessToken, refreshToken) {
    uberClient.user.profile(accessToken, function (err, res) {
      console.log(err);
      console.log(res);
    });
  });
