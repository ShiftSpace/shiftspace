var SSException = new Class({
  
  name: 'SSException',
  
  initialize: function(_error, obj)
  {
    this.objectId = (obj && obj.getId()) || null;
    
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
  },
  
  toString: function()
  {
    return ["[SSException] message:", this.message(), " fileName:", this.fileName(), " lineNumber:", this.lineNumber(), " objectId:", this.objectId].join(", ");
  }
  
});