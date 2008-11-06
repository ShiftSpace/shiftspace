// ==Builder==
// @optional
// @name              User
// @package           System
// ==/Builder==

/*
  Class: User
    A an object wrapping the current ShiftSpace User.  Use this class to check the user's display
    name as well as checking if the user is logged in or out.
*/
var User = new Class({
  
  Implements: Events,
  
  setUsername: function(_username)
  {
    console.log('SETTING USER NAME ' + username + ' ' + _username);
    var fireLogIn = (username == false) && (_username != null);
    username = _username;
    if(fireLogIn)
    {
      this.fireEvent('onUserLogin');
    }
  },

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
  
  
  setEmail: function(email)
  {
    this.__email__ = email;
  },
  
  
  email: function()
  {
    return this.__email__;
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
    SSServerCall('user.login', credentials, function(json) {
      if (json.status) 
      {
        SSLog('//////////////////////////////////////////////////////////');
        SSLog(json);
        // set username
        username = credentials.username;
        // set email
        this.setEmail(json.email);
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
    SSSetValue('username', '');
    SSServerCall('user.logout');
    this.fireEvent('onUserLogout');
  },
  
  /*
    Function: join (private)
      Join a new user.  Will probably be moved into ShiftSpace.js.
  */
  join: function(userInfo, callback) 
  {
    SSServerCall('user.join', userInfo, function(json) {
      if (json.status) 
      {
        username = userInfo.username;
        SSSetValue('username', userInfo.username);
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
    SSServerCall('user.update', info, callback);
  },
  
  /*
    Function: resetPassword (private)
      Reset a user's password
      
    Parameters:
      info - ?
      callback - callback function to be run when resetPassword is complete.
  */
  resetPassword: function(info, callback) {
    SSServerCall('user.resetPassword', info, callback);
  },
  
  
  setPublishDefault: function()
  {
    
  },
  
  
  setEmailCommentsDefault: function(newValue, callback)
  {
    SSLog('setEmailCommentsDefault ' + newValue);
    // setting the value, can't use zero because of PHP, GRRR - David
    SSSetDefaultEmailComments(newValue+1);
    
    SSServerCall('user.update', {
      email_comments: newValue
    }, function(json) {
      SSLog('>>>>>>>>>>>>>>>>>>>>>>>>>>> Default changed!');
      SSLog(json);
    });
  },
  
  
  getEmailCommentsDefault: function()
  {
    // setting the value, can't user zero because of PHP, GRRR - David
    return (SSGetDefaultEmailComments(true)-1);
  },
  
  
  setDefault: function(aDefault, value)
  {
    
  }

});

ShiftSpace.User = new User();