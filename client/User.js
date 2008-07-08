var User = new Class({

  getUsername: function() {
    return username;
  },
  
  isLoggedIn: function(showErrorAlert) {
    return (username != false);
  },
  
  login: function(credentials, _callback) {
    console.log('logging in the user!');
    var callback = _callback;
    serverCall('user.login', credentials, function(json) {
      console.log(json.status);
      if (json.status) {
        console.log(credentials.username);
        username = credentials.username;
        callback(json);
      } else {
        callback(json);
      }
    }.bind(this));
  },
  
  logout: function() {
    username = false;
    setValue('username', '');
    serverCall('user.logout');
    ShiftSpace.Console.showResponse('login_response', 'You have been logged out.');
    ShiftSpace.Console.addTab('login', 'Login');
    ShiftSpace.Console.showTab('login');
  },
  
  join: function(userInfo, callback) {
    serverCall('user.join', userInfo, function(json) {
      if (json.status) {
        username = userInfo.username;
        setValue('username', userInfo.username);
        callback(json);
      } else {
        callback(json);
      }
    }.bind(this));
  }

});

ShiftSpace.User = new User();
