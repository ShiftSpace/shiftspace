// ==Builder==
// @optional
// @export            ShiftSpaceUser as User
// @package           ShiftSpaceCore
// @dependencies      AbstractUser
// ==/Builder==

/*
  Class: User
    A an object wrapping the current ShiftSpace User.  Use this class to check the user's display
    name as well as checking if the user is logged in or out.
*/
var ShiftSpaceUserClass = new Class({
  
  Extends: AbstractUser,
  name: "ShiftSpaceUserClass",
  
  defaultUserName: function()
  {
    return "guest";
  },
  
  
  initialize: function()
  {
    this.parent();
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
    SSSetValue([this.getUserName(), pref].join('.'), value);
  },
  
  
  getPreference: function(pref, defaultValue)
  {
    return SSGetValue([this.getUserName(), pref].join('.'), defaultValue);
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
