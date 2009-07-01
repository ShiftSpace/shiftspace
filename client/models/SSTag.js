// ==Builder==
// @optional
// @package           ShiftSpaceCore
// @dependencies      SSAbstractStream
// ==/Builder==

var SSTag = new Class({
  
  Extends: SSAbstractStream,
  name: "SSTag",
  
  
  defaults: function()
  {
    return $merge(this.parent(), {
      createStream: true
    });
  },
  
  
  initialize: function(tagName, options)
  {
    options = options || {};
    
    options.displayName = tagName;
    options.uniqueName = tagName;
    
    this.parent(options);
  },
  
  
  addTag: function(ref)
  {
    this.postEvent({
      
    });
  },
  
  
  removeTag: function()
  {
    
  }
  
});