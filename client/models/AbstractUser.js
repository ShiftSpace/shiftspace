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
  
  /*
    Function: defaultUserName
      *abstract*
      Convenience function for displaying a username when not logged in. For
      example, this funtion could return "guest".
  */
  defaultUserName: function() { return ""; },
  initialize: function() { this.clearData(); },
  
  /*
    Function: data
      *private*
      Returns all the fields for the current user.
  */
  data: function()
  {
    return {
      id: this.getId(),
      userName: this.getUserName(),
      email: this.email()
    };
  },
  
  /*
    Function: syncData
      *private*
      Synchronize data from a JSON object with the user's fields. If you override this you should
      probably call parent.
      
    Parameters:
      data - a JSON object.
      
    See Also:
      <query>
  */
  syncData: function(data)
  {
    this.setUserName(data.userName || null);
    this.setEmail(data.email || null);
    this.setId(data.id || data._id || null);
  }.asPromise(),
  
  /*
    Function: clearData
      *private*
      Clears all the user's fields. Called when the user logs out.
  */
  clearData: function()
  {
    this.__userName = null;
    this.__userId = null;
    this.__email = null;
  },
  
  /*
    Function: setId
      *private*
      Set the id of the user.
      
    Parameters:
      id - a string.
      
    See Also:
      <syncData>
  */
  setId: function(id)
  {
    this.__userId = id;
  },
  
  /*
    Function: getId
      *private*
      Getter for the user's id.
      
    Returns:
      The user's id.
      
    See Also:
      <data>
  */
  getId: function()
  {
    return this.__userId;
  },
  
  /*
    Function: userName
      *private*
      Set the username. Should not be called directly.
      
    Parameters:
      userName - the user name as a string.
  */
  setUserName: function(userName)
  {
    if(userName != null && userName != false) this.__userName = userName;
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
  
  /*
    Function: setEmail
      *private*
      Setter for the user's email property. Should not be called directly.

    Parameters:
      email - a string.
  */
  setEmail: function(email)
  {
    this.__email = (email != '' && email != 'NULL' && email != null) ? email : '';
  },
  
  /*
    Function: email
      Returns the user's email.
      
    Returns:
      A string.
  */
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
  isLoggedIn: function() 
  {
    return (this.getId() != null);
  },
  
  /*
    Function: query
      Query for a session. Returns a promise for the currently logged in user's data 
      as a JSON object.
      
    See Also:
      <syncData>, <onQuery>
  */
  query: function()
  {
    var p = SSApp.query(credentials);
    $if(SSApp.noErr(p),
        function() {
          var json = p.value();
          this.syncData(json);
          this.onQuery(json);
          SSPostNotification('onUserQuery', json);
        }.bind(this),
        function() {
          var err = p.value();
          this.onQueryError(err);
          SSLog(err, SSLogError);
        }.bind(this));
    return p;
  },
  
  /*
    Function: onQuery
      *abstract*
      Called when the the query is made.
  */
  onQuery: function(json) {},
  
  /*
    Function: onQueryError
      *abstract*
      Called when there was an error in the query.
  */
  onQueryError: function(json) {},
  
  /*
    Function: login
      *private*
      Login a user. Will probably be moved into ShiftSpace.js.

    Parameters:
      credentials - object with userName and password properties.
      
    Returns:
      A promise.
  */
  login: function(credentials) 
  {
    var p = SSApp.login(credentials);
    $if(SSApp.noErr(p),
        function() {
          var json = p.value();
          this.syncData(json);
          this.onLogin(json);
          SSPostNotification('onUserLogin', json);
        }.bind(this),
        function() {
          var err = p.value();
          this.onLoginError(err);
          SSPostNotification('onUserLoginFailed', err);
          SSLog(err, SSLogError);
        }.bind(this));
    return p;
  },
  
  /*
    Function: onLogin
      *abstract*
      Called on successful login.
      
    Parameters:
      json - a JSON object containing the user's data.
  */
  onLogin: function(json) {},
  
  /*
    Function: onLoginError 
      *abstract*
      Called on failed login.
      
    Parameters:
      err - the JSON error object.
  */
  onLoginError: function(err) {},

  /*
    Function: logout
      *private*
      Logout a user. Will probably be moved into ShiftSpace.js.
  */
  logout: function()
  {
    var p = SSApp.logout();
    $if(SSApp.noErr(p),
        function() {
          var json = p.value();
          this.clearData();
          this.onLogout(json);
          SSPostNotification('onUserLogout', json);
        }.bind(this),
        function() {
          var err = p.value();
          this.onLogoutError(err);
          SSLog(err, SSLogError);
        }.bind(this));
    return p;
  },
  
  /*
    Function: onLogout
      *abstract*
      Called when the user is successfully logged out.
      
    Parameters:
      ack - a JSON object representing acknowledgement.
  */
  onLogout: function(ack) {},
  
  /*
    Function: onLogoutError
      *abstract*
      Called when error occurs on logout attempt.

    Parameters:
      err - a JSON error object.
  */
  onLogoutError: function(err) {},
  
  /*
    Function: join
      *private*
      Join a new user. Returns a promise for the user's data if login successful.
      Implicitly logins in the user.
    
    Parameters:
      userInfo - a JSON object containing the user's data.
  */
  join: function(userInfo) 
  {
    var p = SSApp.join(userInfo);
    $if(SSApp.noErr(p),
        function() {
          var json = p.value();
          this.syncData(json);
          this.onJoin(json);
          SSPostNotification('onUserJoin', json);
          this.onLogin(json);
          SSPostNotification('onUserLogin', json);
        }.bind(this),
        function() {
          var err = p.value();
          this.onJoinError(err);
          SSPostNotification('onUserJoinFailed', err);
          SSLog(err, SSLogError);
        }.bind(this));
    return p;
  },
  
  /*
    Function: onJoin
      *abstract*
      Called on a successful user join.
      
    Parameters:
      json - a JSON object of the user's data.
  */
  onJoin: function(json) {},
  
  /*
    Function: onJoinError
      *abstract*
      Called on unsuccessful join attempt.
      
    Parameters:
      err - the JSON error object.
  */
  onJoinError: function(err) {},
  
  /*
    Function: update
      Update a user's info.
      
    Parameters:
      info - info to be updated.
  */
  update: function(data) 
  {
    var p = SSApp.update('user', this.getUserName(), data);
    $if(SSApp.noErr(p),
        function() {
          var json = p.value();
          this.syncData(json);
          this.onUpdate(json);
          SSPostNotification('onUserUpdate', json);
        }.bind(this),
        function() {
          var err = p.value();
          this.onUpdateError(err);
          SSLog(err, SSLogError);
        }.bind(this));
    return p;
  },
  
  /*
    Function: onUpdate 
      *abstract*
      Called when the user has been successfully updated.
      
    Parameters:
      json - the user's data.
  */
  onUpdate: function(json) {},
  
  /*
    Function: onUpdateError
      *abstract*
      Called when a user update fails.
      
    Parameters:
      err - the error JSON object.
  */
  onUpdateError: function(err) {},
  
  /*
    Function: resetPassword
      *private*
      Reset a user's password
      
    Parameters:
      info - ?
  */
  resetPassword: function(userName) 
  {
    var p = SSApp.post({resource:'user', id:userName, action:"resetPassword"});
    $if(SSApp.noErr(p),
        function() {
          var ack = p.value();
          this.onResetPassword(ack);
          SSPostNotification('onUserPasswordReset', ack);
        }.bind(this),
        function() {
          var err = p.value();
          this.onResetPasswordError(err);
          SSLog(err, SSLogError);
        }.bind(this));
    return p;
  },
  
  /*
    Function: onResetPassword
      *abstract*
      Called on successful password reset.
      
    Parameters:
      ack - acknowledgement JSON object.
  */
  onResetPassword: function(ack) {},
  
  /*
    Function: onResetPasswordError
      *abstract*
      Called on failed password reset.
      
    Parameters:
      err - a error JSON object.
  */
  onResetPasswordError: function(err) {}
});
