// ==Builder==
// @optional
// @export            ShiftSpaceUser as User
// @package           ShiftSpaceCore
// @dependencies      AbstractUser
// ==/Builder==

/*
  Class: User
    A an object wrapping the current ShiftSpace User. Handles ShiftSpace specific
    user functionality such as setting persistent local preferences.
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
  
  /*
    Function: setPreference
      Set a preference for a user.

    Parameters:
      pref - a string key to store the value under.
      value - a value to store.

    See Also:
      Space.setPreference
   */
  setPreference: function(pref, value)
  {
    SSSetValue([this.getUserName(), pref].join('.'), value);
  },
  
  /*
    Function: getPreference
      Get a preference for a user.

    Returns:
      The value or null if passed a callback.

    See Also:
      Space.getPreference
   */
  getPreference: function(pref, defaultValue, callback)
  {
    return SSGetValue([this.getUserName(), pref].join('.'), defaultValue, callback);
  },
  
  /*
    Function: removePreference
      Remove a user's preference.
   */
  removePreference: function()
  {
  },
  
  /*
    Function: setInstalledSpaces
      Set the list of installed spaces for a user.
   */
  setInstalledSpaces: function(installed)
  {
    this.setPreference('installed', installed);
  },
  
  /*
    Function: installedSpaces
      Return the list of installed spaces for a user.
     
    Returns:
      An array of space attributes.
   */
  installedSpaces: function()
  {
    return this.getPreference('installed', null) || SSDefaultSpaces();
  }
});

var ShiftSpaceUser = new ShiftSpaceUserClass();
