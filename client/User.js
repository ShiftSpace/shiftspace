/*
  Class: User
    A an object wrapping the current ShiftSpace User.  Use this class to check the user's display
    name as well as checking if the user is logged in or out.
*/
var User = new Class({

  /*
    Function: getUsername
      Returns the logged in user's name.
      
    Returns:
      User name as string. Returns false if there is no logged in user.
  */
  getUsername: function() 
  {
    return username;
  },
  
  /*
    Function: isLoggedIn
      Checks whether there is a logged in user.
      
    Returns:
      A boolean.
  */
  isLoggedIn: function(showErrorAlert) 
  {
    return (username != false);
  },
  
  /*
    Function: login (private)
      Login a user. Will probably be moved into ShiftSpace.js.

    Parameters:
      credentials - object with username and password properties.
      _callback - a function to be called when login action is complete.
  */
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
        if(callback) callback(json);
      }
    }.bind(this));
  },
  
  /*
    Function: logout (private)
      Logout a user. Will probably be moved into ShiftSpace.js.
  */
  logout: function() 
  {
    username = false;
    setValue('username', '');
    serverCall('user.logout');
    this.fireEvent('onUserLogout');
  },
  
  /*
    Function: join (private)
      Join a new user.  Will probably be moved into ShiftSpace.js.
  */
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
  
  /*
    Function: update
      Update a user's info.
      
    Parameters:
      info - info to be updated.
      callback - callback function to be run when update server call is complete.
  */
  update: function(info, callback) {
    serverCall('user.update', info, callback);
  },
  
  /*
    Function: resetPassword (private)
      Reset a user's password
      
    Parameters:
      info - ?
      callback - callback function to be run when resetPassword is complete.
  */
  resetPassword: function(info, callback) {
    serverCall('user.resetPassword', info, callback);
  }

});

User.implement(new Events);
ShiftSpace.User = new User();
