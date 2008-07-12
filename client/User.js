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
    
    // TODO: User Object should not refer to Console - David
    ShiftSpace.Console.showResponse('login_response', 'You have been logged out.');
    ShiftSpace.Console.addTab('login', 'Login');
    ShiftSpace.Console.showTab('login');
    
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
  }

});

User.implement(new Events);
ShiftSpace.User = new User();
