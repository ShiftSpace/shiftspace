// ==Builder==
// @optional
// @name              SSException
// @package           System
// ==/Builder==

var SSException = new Class({
  
  name: 'SSException',
  
  initialize: function(_error)
  {
    this.theError = _error;
  },
  
  message: function()
  {
    return this.theError.message;
  },
  
  fileName: function()
  {
    return this.theError.fileName;
  },

  lineNumber: function()
  {
    return this.theError.lineNumber;
  },
  
  originalError: function()
  {
    return this.theError;
  },
  
  toString: function()
  {
    return ["[SSException] message:", this.message(), " fileName:", this.fileName(), " lineNumber:", this.lineNumber(), " objectId:", this.objectId].join(", ");
  }
  
});

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