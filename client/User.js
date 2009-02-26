// ==Builder==
// @optional
// @export            ShiftSpaceUser as User
// @name              User
// @package           ShiftSpaceCore
// ==/Builder==

/*
  Class: User
    A an object wrapping the current ShiftSpace User.  Use this class to check the user's display
    name as well as checking if the user is logged in or out.
*/
var ShiftSpaceUserClass = new Class({
  
  Implements: Events,
  
  
  initialize: function()
  {
    this.setUsername(null);
    this.setId(null);
    this.setEmail(null);
  },
  
  
  syncData: function(data)
  {
    this.setUsername(data.username);
    this.setId(data.id);
    this.setEmail(data.email);
  },
  
  
  setId: function(id)
  {
    this.__userId = id;
  },
  
  
  getId: function()
  {
    return this.__userId;
  },
  
  
  setUsername: function(username)
  {
    if(username != null && username != false)
    {
      this.__username = username;
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
    return this.__username;
  },
  
  
  setEmail: function(email)
  {
    this.__email = email;
  },
  
  
  email: function()
  {
    return this.__email;
  },
  

  /*
    Function: isLoggedIn
      Checks whether there is a logged in user.
      
    Returns:
      A boolean.
  */
  isLoggedIn: function(showErrorAlert) 
  {
    return (this.getId() != null);
  },
  
  
  query: function(_callback)
  {
    var callback = _callback;
    SSServerCall('user.query', null, function(json) {
      if(json.data) this.syncData(json.data);
      if(callback) callback(json);
      this.fireEvent('onUserQuery', json);
    }.bind(this));
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
      if(json.data) this.syncData(json.data);
      if(callback) callback(json);
      this.fireEvent('onUserLogin', json);
    }.bind(this));
  },
  
  /*
    Function: logout (private)
      Logout a user. Will probably be moved into ShiftSpace.js.
  */
  logout: function()
  {
    SSServerCall('user.logout', null, function(json) {
      // clear out all values
      this.setUsername(null);
      this.setId(null);
      this.setEmail(null);
      this.fireEvent('onUserLogout');
    }.bind(this));
  },
  
  /*
    Function: join (private)
      Join a new user.  Will probably be moved into ShiftSpace.js.
  */
  join: function(userInfo, _callback) 
  {
    var callback = _callback;
    SSServerCall('user.join', userInfo, function(json) {
      if(json.data) this.syncData(json.data);
      if(callback) callback(json);
      this.fireEvent('onUserJoin', json);
    }.bind(this));
  },
  
  /*
    Function: update
      Update a user's info.
      
    Parameters:
      info - info to be updated.
      callback - callback function to be run when update server call is complete.
  */
  update: function(info, callback) 
  {
    SSServerCall('user.update', info, callback);
  },
  
  /*
    Function: resetPassword (private)
      Reset a user's password
      
    Parameters:
      info - ?
      callback - callback function to be run when resetPassword is complete.
  */
  resetPassword: function(info, callback) 
  {
    SSServerCall('user.resetPassword', info, callback);
  },

  
  setEmailCommentsDefault: function(newValue, callback)
  {
    SSLog('setEmailCommentsDefault ' + newValue);
    // setting the value, can't use zero because of PHP, GRRR - David
    SSSetDefaultEmailComments(newValue+1);
    
    SSServerCall('user.update', {
      email_comments: newValue
    }, function(json) {
    });
  },
  
  
  getEmailCommentsDefault: function()
  {
    // setting the value, can't user zero because of PHP, GRRR - David
    return (SSGetDefaultEmailComments(true)-1);
  }
});

var ShiftSpaceUser = new ShiftSpaceUserClass();