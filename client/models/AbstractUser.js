// ==Builder==
// @optional
// @package           ShiftSpaceCore
// ==/Builder==

/*
  Class: AbstractUser
    Base class for representing users.
*/
var AbstractUser = new Class({
  
  Implements: Events,
  name: 'AbstractUser',
  
  defaultUserName: function()
  {
    return "";
  },
  
  
  initialize: function()
  {
    this.clearData();
  },
  
  
  data: function()
  {
    return {
      id: this.getId(),
      userName: this.getUserName(),
      email: this.email()
    };
  },
  
  
  syncData: function(data)
  {
    this.setUserName(data.userName || null);
    this.setEmail(data.email || null);
    this.setId(data.id || data._id || null);
  }.asPromise(),
  
  
  clearData: function()
  {
    this.__userName = null;
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
  
  
  setUserName: function(userName)
  {
    if(userName != null && userName != false)
    {
      this.__userName = userName;
    }
  },

  /*
    Function: getUserName
      Returns the logged in user's name.
      
    Returns:
      User name as string. Returns false if there is no logged in user.
  */
  getUserName: function() 
  {
    return (this.isLoggedIn() ? this.__userName : this.defaultUserName());
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
      this.onQuery(json);
    }.bind(this));
  },
  
  
  onQuery: function(json)
  {
    SSPostNotification('onUserQuery', json);
  },
  
  /*
    Function: login (private)
      Login a user. Will probably be moved into ShiftSpace.js.

    Parameters:
      credentials - object with userName and password properties.
  */
  login: function(credentials) 
  {
    var p = SSApp.login(credentials);
    $if(SSApp.noErr(p),
        function() {
          this.syncData(p);
          this.onJoin(p);
          this.onLogin(p);
        }.bind(this));
    return p;
  },
  
  
  onLogin: function(json)
  {
    SSPostNotification('onUserLogin', json);
  },


  /*
    Function: logout (private)
      Logout a user. Will probably be moved into ShiftSpace.js.
  */
  logout: function()
  {
    var p = SSApp.logout();
    $if(SSApp.noErr(p),
        function() {
          this.clearData();
          this.onLogout(p);
        }.bind(this));
    return p;
  },
  
  
  onLogout: function(json)
  {
    SSPostNotification('onUserLogout', json);
  },
  
  
  /*
    Function: join (private)
      Join a new user. Returns a promise for the user's data.
      This promise may be an error and should be handled.
  */
  join: function(userInfo) 
  {
    var p = SSApp.join(userInfo);
    $if(SSApp.noErr(p),
        function() {
          this.syncData(p);
          this.onJoin(p);
          this.onLogin(p);
        }.bind(this));
    return p;
  },
  
  
  onJoin: function(json)
  {
    SSPostNotification('onUserJoin', json);
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
      if(!json['error'])
      {
        if(json.data) this.syncData(json.data);
        this.onUpdate(json);
      }
    }.bind(this));
  },
  
  
  onUpdate: function(json)
  {
    SSPostNotification('onUserUpdate', json);
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
      if(!json['error'])
      {
        this.onResetPassword(json);
      }
    });
  },
  
  
  onResetPassword: function(json)
  {
    SSPostNotification('onUserPasswordReset', json);
  },
  
  
  onResetPasswordError: function(json)
  {
    SSPostNotification('onUserPasswordResetError', json);
  }
});
