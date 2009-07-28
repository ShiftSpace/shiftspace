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
      private: 0,
      id: null
    });
  },
  
  
  initialize: function(tagName, options)
  {
    options = options || {};
    
    options.displayName = tagName;
    options.uniqueName = tagName;
    options.meta = "tag";

    if(options.category)
    {
      options.meta = "category";
      options.superStream = true;
    }

    this.parent(options);
    
    if(!this.options.id)
    {
      this.isUnique(tagName,
                    this.create.bind(this, [options]),
                    this.notUnique.bind(this));
    }
    else
    {
      this.setData({
        id:options.id, 
        superstream: (this.options.category) ? 1 : 0
      });
    }
  },
  
  
  onCreate: function(json)
  {
    this.parent(json);
    SSPostNotification('tagCreated');
  },
  
  
  notUnique: function(stream)
  {
    this.setData(stream);
  },
  
  
  addTag: function(id, resource, options)
  {
    var objectRef = (resource && !this.isCategory()) ? [resource, id].join(":") : id;
    
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
    this.fireEvent('onAddTag', json);
  },
  
  
  removeTag: function(id, resource)
  {
    var objectRef = (resource) ? [resource, id].join(":") : id; 
    if(!this.isCategory())
    {
      // we're deleting a real event, can do it by objectRef - David
      this.deleteEventByObjectRef(objectRef);
    }
    else
    {
      // this is a category tag (superstream), find the real event id by the stream id of the substream. - David
      this.coll().read(function(events) {
        window.dbg = events;
        var eventToDelete = events.select(function(v) { return v.object_ref == id; });
        if(eventToDelete) this.deleteEvent(eventToDelete.id);
      }.bind(this), {bare:1});
    }
  },
  
  
  onDeleteEvent: function(json)
  {
    this.onRemoveTag(json);
  },

  
  onRemoveTag: function(json)
  {
    this.fireEvent('onRemoveTag', json);
  },
  
  
  isCategory: function()
  {
    return this.isSuperStream();
  }
  
});

SSTag.tagClasses = ["SSTag"];
SSTag.isTag = function(obj)
{
  return SSTagClasses.indefOf(obj.name) != -1;
}

SSTag.find = function(objectRef, callback) {
  SSAbstractStream.findStreamsWithEvents(objectRef, callback);
};

SSTag.tag = function(tagName)
{
  return new SSTag(tagName);
}