// ==Builder==
// @optional
// @package           ShiftSpaceCore
// ==/Builder==

var SSAbstractStream = new Class({

  Implements: [Events, Options],
  name: "SSAbstractStream",

  defaults: function() 
  {
    return {
      displayName: null,
      uniqueName: null,
      objectRef: null,
      private: 1,
      createStream: false,
      superStream: false
    }
  },


  initialize: function(options)
  {
    this.setOptions(this.defaults(), options);
    
    if(this.options.createStream)
    {
      this.create();
    }
  },
  
  
  isUnique: function(uniqueName, trueCb, falseCb)
  {
    SSFindStreamByUniqueName(uniqueName, function(json) {
      if(!json.data)
      {
        trueCb();
      }
      else
      {
        falseCb(json.data);
      }
    });
  },
  
  
  create: function()
  {
    SSCreateStream(this.options.displayName,
                   this.options.uniqueName,
                   this.options.objectRef,
                   this.options.private,
                   this.options.meta,
                   this.options.superStream,
                   this.onCreate.bind(this));
  },
  
  
  coll: function()
  {
    return this.__coll;
  },
  
  
  setData: function(data)
  {
    this.__data = data;
    this.setColl(this.__data.id);
    this.fireEvent('load', this);
  },
  
  
  setColl: function(streamId)
  {
    this.__coll = new SSCollection("stream:"+streamId, {
      table: "!"+streamId,
      orderby: [">", "created"],
      properties: "*"
    });    
  },
  
  
  data: function()
  {
    return this.__data;
  },
  
  
  id: function()
  {
    return this.data().id;
  },
  
  
  onCreate: function(json)
  {
    this.setData(json.data);
  },
  
  
  feeds: function(callback)
  {
    
  },
  
  
  feed: function(callback)
  {
    if(this.coll())
    {
      this.coll().read(callback);
    }
  },
  
  
  setPermission: function(level)
  {
    
  },
  
  
  postEvent: function(_options)
  {
    if(this.coll())
    {
      var options = {
        display_string: _options.displayString,
        user_id: _options.userId,
        user_name: _options.userName,
        object_ref: _options.objectRef,
        has_read_status: (_options.hasReadStatus ? 1 : 0),
        unique_name: _options.uniqueName,
        url: _options.url
      };
      
      this.coll().create(options, {onCreate:this.onPostEvent.bind(this)});
    }
  },
  
  
  onPostEvent: function(evt)
  {
    SSLog('onPostEvent', SSLogForce);
    SSLog(evt, SSLogForce);
  },
  
  
  updateEvent: function(id, data)
  {
    if(this.coll())
    {
      this.coll().udpateById(id, data, this.onUpdateEvent.bind(this));
    }
  },
  

  onUpdateEvent: function(evt)
  {
    SSLog('onUpdateEvent', SSLogForce);
    SSLog(evt, SSLogForce);
  },
  
  
  deleteEvent: function(id)
  {
    if(this.coll())
    {
      var options = $merge((this.isSuperStream() && {bare:1}), {
        onDelete: this.onDeleteEvent.bind(this)
      });
      this.coll().deleteById(id, options);
    }
  },
  
  
  deleteEventByObjectRef: function(objectRef)
  {
    SSFindEvents(objectRef, function(ary) {
      this.deleteEvent(ary[0].id);
    }.bind(this));
  },
  
  
  onDeleteEvent: function(evt)
  {
    this.fireEvent('onDeleteEvent', evt);
  },
  
  
  deleteAllEvents: function()
  {
    this.coll().deleteByConstraint(null, this.onDeleteAllEvents.bind(this));
  },
  
  
  onDeleteAllEvents: function(json)
  {
    this.fireEvent('onDeleteAllEvents', json)
  },
  
  
  isSuperStream: function()
  {
    return this.data().superstream == 1;
  },
  
  
  subscribe: function(id)
  {
    
  },
  

  unsubscribe: function(id)
  {
    
  },
  
  
  meta: function()
  {
    return this.data().meta;
  },
  
  
  displayString: function()
  {
    return this.data().display_string;
  },
  
  
  uniqueName: function()
  {
    return this.data().unique_name;
  },
  
  
  streamName: function()
  {
    return this.data().stream_name;
  },
  
  
  objectRef: function()
  {
    return this.data().object_ref;
  },
  
  
  structure: function(callback)
  {
    return SSStreamStructure(this.data().id, callback);
  }

});

SSAbstractStream.findStreamsWithEvents = SSFindStreamsWithEvents;
