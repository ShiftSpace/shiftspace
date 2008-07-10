var SSException = new Class({
  
  initialize: function(_error)
  {
    var error = _error;
    
    this.message = function()
    {
      return error.message;
    }
    
    this.fileName = function()
    {
      return error.fileName;
    }

    this.lineNumber = function()
    {
      return error.lineNumber;
    }
  }
  
});