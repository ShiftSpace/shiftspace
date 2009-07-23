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
      createStream: false,
      private: 0
    });
  },
  
  
  initialize: function(tagName, options)
  {
    options = options || {};
    
    options.displayName = tagName;
    options.uniqueName = tagName;
    
    this.parent(options);
    
    this.isUnique(tagName, 
                  this.create.bind(this, [options]),
                  this.notUnique.bind(this));
  },
  
  
  notUnique: function(stream)
  {
    this.setId(stream.id);
    return;
  },
  
  
  addTag: function(objectRef, options)
  {
    var defaults = {
      displayString: null,
      objectRef: objectRef,
      hasReadStatus: false
    };
    
    this.postEvent($merge(defaults, options), this.onAddTag.bind(this));
  },
  
  
  onPostEvent: function(json)
  {
    this.onAddTag(json);
  },
  
  
  onAddTag: function(json)
  {
    SSLog('onAddTag', SSLogForce);
    SSLog('json', SSLogForce);
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
    SSLog('onRemoveTag', SSLogForce);
    SSLog(json, SSLogForce);
  }
  
});

SSTag.find = function(objectRef, callback) {
  SSAbstractStream.findStreamsWithEvents(objectRef, callback);
};