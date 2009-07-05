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
      createStream: true,
      private: 0
    });
  },
  
  
  initialize: function(tagName, options)
  {
    options = options || {};
    
    options.displayName = tagName;
    options.uniqueName = tagName;
    
    this.parent(options);
  },
  
  
  addTag: function(objectRef)
  {
    this.postEvent({
      displayString: null,
      userId: ShiftSpace.User.getId(),
      userName: ShiftSpace.User.getUsername(),
      objectRef: objectRef,
      hasReadStatus: false
    }, this.onAddTag.bind(this));
  },
  
  
  onPostEvent: function(json)
  {
    this.onAddTag(json);
  },
  
  
  onAddTag: function(json)
  {
  },
  
  
  removeTag: function(objectRef)
  {
    this.deleteEvent({
      displayString: null,
      userId: ShiftSpace.User.getId(),
      userName: ShiftSpace.User.getUsername(),
      objectRef: objectRef,
      hasReadStatus: false
    }, this.onAddTag.bind(this));
  },
  
  
  onRemoveTag: function(json)
  {
  }
  
});

SSTag.find = function(objectRef, callback) {
  SSAbstractStream.findStreamsWithEvents(objectRef, callback);
};