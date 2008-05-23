var username;

var User = new Class({
  
    initialize: function() {
      // we need a user id, not just a user name
      username = GM_getValue('username', '');
      if (username == '') {
        username = false;
      }
    },
    
    getUsername: function() {
      return username;
    },
    
    isLoggedIn: function() {
      return (username != false);
    },
    
    login: function(credentials, callback) {
      serverCall('user.login', credentials, function(json) {
        if (json.status) {
          username = credentials.username;
          GM_setValue('username', credentials.username);
          callback(json);
        } else {
          callback(json);
        }
      }.bind(this));
    },
    
    logout: function() {
      username = false;
      GM_setValue('username', '');
      serverCall('user.logout');
      ShiftSpace.Console.showResponse('login_response', 'You have been logged out.');
      ShiftSpace.Console.addTab('login', 'Login');
      ShiftSpace.Console.showTab('login');
    },
    
    join: function(userInfo, callback) {
      serverCall('user.join', userInfo, function(json) {
        if (json.status) {
          username = userInfo.username;
          GM_setValue('username', userInfo.username);
          callback(json);
        } else {
          callback(json);
        }
      }.bind(this));
    },
    
    isLoggedIn: function()
    {
      return (username != false);
    }
  
});

ShiftSpace.user = new User();
