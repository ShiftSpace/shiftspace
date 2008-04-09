var username;

var User = new Class({
  
    initialize: function() {
      username = GM_getValue('username', '');
      if (username == '') {
        username = false;
      }
    },
    
    getUsername: function() {
      return username;
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
    }
  
});

ShiftSpace.user = new User();
