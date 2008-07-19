var User = new Class({

  getUsername: function() 
  {
    return username;
  },
  
  
  isLoggedIn: function(showErrorAlert) 
  {
    return (username != false);
  },
  
  
  login: function(credentials, _callback) 
  {
    var callback = _callback;
    serverCall('user.login', credentials, function(json) {
      if (json.status) 
      {
        username = credentials.username;
        callback(json);
        this.fireEvent('onUserLogin');
      } 
      else 
      {
        callback(json);
      }
    }.bind(this));
  },
  
  
  logout: function() 
  {
    username = false;
    setValue('username', '');
    serverCall('user.logout');
    this.fireEvent('onUserLogout');
  },
  
  
  join: function(userInfo, callback) 
  {
    serverCall('user.join', userInfo, function(json) {
      if (json.status) 
      {
        username = userInfo.username;
        setValue('username', userInfo.username);
        callback(json);
      } 
      else 
      {
        callback(json);
      }
    }.bind(this));
  },
  
  update: function(info, callback) {
    serverCall('user.update', info, callback);
  }

});

User.implement(new Events);
ShiftSpace.User = new User();
