// ==Builder==
// @optional
// @name              SSCustomExceptions
// @package           System
// @dependencies      Exception
// ==/Builder==

var SSSpaceDoesNotExistError = new Class({
  Extends: SSException,
  
  name: 'SSSpaceDoesNotExistError',
  
  initialize: function(_error, spaceName)
  {
    this.parent(_error);
    this.spaceName = spaceName;
  },
  
  message: function()
  {
    return "Space " + this.spaceName + " does not exist.";
  }

});

var ShiftDoesNotExistError = new Class({
  
});