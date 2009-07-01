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
  
  
  onCreate: function(json)
  {
    console.log(json);
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
  
  
  create: function(name, private, callback)
  {
    
  },
  
  
  serverCall: function(method, callback)
  {
    
  },
  
  
  subscribe: function(id)
  {
    
  },
  

  unsubscribe: function(id)
  {
    
  }

});