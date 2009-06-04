// ==Builder==
// @optional
// @export            ShiftSpaceUser as User
// @package           ShiftSpaceCore
// ==/Builder==

/*
  Class: User
    A an object wrapping the current ShiftSpace User.  Use this class to check the user's display
    name as well as checking if the user is logged in or out.
*/
var ShiftSpaceUserClass = new Class({
  
  Implements: Events,
  
  
  defaultUserName: function()
  {
    return "guest";
  },
  
  
  initialize: function()
  {
    this.clearData();
  },
  
  
  syncData: function(data)
  {
    this.setUsername(data.username || null);
    this.setId(data.id || null);
    this.setEmail(data.email || null);
  },
  
  
  clearData: function()
  {
    this.__username = null;
    this.__userId = null;
    this.__email = null;
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
    return (this.isLoggedIn() ? this.__username : this.defaultUserName());
  },
  
  
  setEmail: function(email)
  {
    if(email != '' && email != 'NULL' && email != null)
    {
      this.__email = email;
    }
    else
    {
      this.__email = '';
    }
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
  
  
  query: function()
  {
    SSServerCall('user.query', null, function(json) {
      if(json.data) this.syncData(json.data);
      SSPostNotification('onUserQuery', json);
    }.bind(this));
  },
  
  /*
    Function: login (private)
      Login a user. Will probably be moved into ShiftSpace.js.

    Parameters:
      credentials - object with username and password properties.
  */
  login: function(credentials) 
  {
    SSServerCall('user.login', credentials, function(json) {
      if(!json.error)
      {
        if(json.data) this.syncData(json.data);
        SSPostNotification('onInstalledSpacesDidChange');
        SSPostNotification('onUserLogin', json);
      }
      else
      {
        SSPostNotification('onUserLoginError', json);
      }
    }.bind(this));
  },
  
  /*
    Function: logout (private)
      Logout a user. Will probably be moved into ShiftSpace.js.
  */
  logout: function()
  {
    SSServerCall('user.logout', null, function(json) {
      this.clearData();
      if(!json.error)
      {
        SSLog('user is logging out', SSLogForce);
        SSPostNotification('onInstalledSpacesDidChange');
        SSPostNotification('onUserLogout', json);
      }
      else
      {
        SSPostNotification('onUserLogoutError', json);
      }
    }.bind(this));
  },
  
  /*
    Function: join (private)
      Join a new user.  Will probably be moved into ShiftSpace.js.
  */
  join: function(userInfo) 
  {
    SSServerCall('user.join', userInfo, function(json) {
      if(!json.error)
      {
        if(json.data) this.syncData(json.data);
        SSPostNotification('onInstalledSpacesDidChange');
        SSPostNotification('onUserJoin', json);
      }
      else
      {
        SSPostNotification('onUserJoinError', json);
      }
    }.bind(this));
  },
  
  /*
    Function: update
      Update a user's info.
      
    Parameters:
      info - info to be updated.
  */
  update: function(info) 
  {
    SSServerCall('user.update', info, function(json) {
      if(!json.error)
      {
        if(json.data) this.syncData(json.data);
        SSPostNotification('onUserUpdate', json);
      }
      else
      {
        SSPostNotification('onUserUpdateError', json);
      }
    }.bind(this));
  },
  
  
  /*
    Function: resetPassword (private)
      Reset a user's password
      
    Parameters:
      info - ?
  */
  resetPassword: function(info) 
  {
    SSServerCall('user.resetPassword', info, function(json) {
      if(!json.error)
      {
        SSPostNotification('onUserPasswordReset', json);
      }
      else
      {
        SSPostNotification('onUserPasswordResetError', json);
      }
    });
  },

  
  setEmailCommentsDefault: function(newValue)
  {
    // setting the value, can't use zero because of PHP, GRRR - David
    SSSetDefaultEmailComments(newValue+1);
    
    SSServerCall('user.update', {email_comments: newValue}, function(json) {
      if(!json.error)
      {
        SSPostNotification('onUserUpdate', json)
      }
      else
      {
        SSPostNotification('onUserUpdateError', json);
      }
    });
  },
  
  
  getEmailCommentsDefault: function()
  {
    // setting the value, can't user zero because of PHP, GRRR - David
    return (SSGetDefaultEmailComments(true)-1);
  },
  
  
  setPreference: function(pref, value)
  {
    SSSetValue([this.getUsername(), pref].join('.'), JSON.encode(value));
  },
  
  
  getPreference: function(pref, defaultValue)
  {
    return SSGetValue([this.getUsername(), pref].join('.'), defaultValue);
  },
  
  
  removePreference: function()
  {
  },
  
  
  setInstalledSpaces: function(installed)
  {
    this.setPreference('installed', installed);
  },
  
  
  installedSpaces: function()
  {
    return this.getPreference('installed', null);
  }
});

var ShiftSpaceUser = new ShiftSpaceUserClass();
