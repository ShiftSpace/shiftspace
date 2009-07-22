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
    }
  },


  initialize: function(options)
  {
    this.setOptions(this.defaults(), options);
    
    if(this.options.createStream)
    {
      this.create(options);
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
  
  
  create: function(options)
  {
    SSCreateStream(this.options.displayName,
                   this.options.uniqueName,
                   this.options.objectRef,
                   this.options.private,
                   this.options.meta,
                   this.onCreate.bind(this));
  },
  
  
  coll: function()
  {
    return this.__coll;
  },
  
  
  setId: function(id)
  {
    this.__id = id;
    this.__coll = new SSCollection({
      table: "!"+this.__id,
      orderby: [">", "created"],
      properties: "*"
    });
  },
  
  
  id: function()
  {
    return this.__id;
  },
  
  
  onCreate: function(json)
  {
    this.setId(json.data.id);
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
        display_string: options.displayString,
        user_id: options.userId,
        user_name: options.userName,
        object_ref: options.objectRef,
        has_read_status: options.hasReadStatus,
        url: url
      };
      
      this.coll().create(options, this.onPostEvent.bind(this));
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
      this.coll().deleteById(id, this.onDeleteEvent.bind(this));
    }
  },
  
  
  onDeleteEvent: function(evt)
  {
    SSLog('onDeleteEvent', SSLogForce);
    SSLog(evt, SSLogForce);
  },
  
  
  subscribe: function(id)
  {
    
  },
  

  unsubscribe: function(id)
  {
    
  }

});

SSAbstractStream.findStreamsWithEvents = SSFindStreamsWithEvents;
