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
      private: true,
      createStream: false,
    }
  },


  initialize: function(options)
  {
    this.setOptions(this.defaults(), options);
    
    if(this.options.createStream)
    {
      SSCreateStream(this.options.displayName,
                     this.options.uniqueName,
                     this.options.private,
                     this.options.objectRef,
                     this.onCreate.bind(this));
    }
  },
  
  
  setId: function(id)
  {
    this.__id = id;
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
    
  },
  
  
  setPermission: function(level)
  {
    
  },
  
  
  postEvent: function(options)
  {
    SSPostEventToStream(this.id(),
                        options.displayString,
                        options.userId,
                        options.userName,
                        options.objectRef,
                        options.hasReadStatus,
                        this.onPostEvent.bind(this));
  },
  
  
  onPostEvent: function(json)
  {
    
  },
  
  
  deleteEvent: function(options)
  {
    SSDeleteEvent(options.id,
                  this.onDeleteEvent.bind(this))
  },
  
  
  onDeleteEvent: function(json)
  {
    
  },
  
  
  subscribe: function(id)
  {
    
  },
  

  unsubscribe: function(id)
  {
    
  }

});

SSAbstractStream.findStreamsWithEvents = SSFindStreamsWithEvents;