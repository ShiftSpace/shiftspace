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
      private: true,
      createStream: false,
    }
  },


  initialize: function(options)
  {
    this.setOptions(this.defaults(), options);
    
    if(this.options.createStream)
    {
      SSCreateStream(this.options.displayName, this.options.uniqueName, this.options.private, this.onCreate.bind(this));
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
  
  
  oneFeed: function(id, callback)
  {
    
  },
  
  
  setPermission: function(id, level)
  {
    
  },
  
  
  postEvent: function(name, private, callback)
  {
    
  },
  
  
  subscribe: function(id)
  {
    
  },
  

  unsubscribe: function(id)
  {
    
  }

});