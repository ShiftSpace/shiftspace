// ==Builder==
// @optional
// @package           ShiftSpaceCore
// ==/Builder==

var SSPageControl = new Class({

  Implements: [Events, Options],

  name: "SSPageControl",
  
  defaults: {
    listView: null
  }, 

  initialize: function(el, options)
  {
    this.setOptions(defaults, options);
    this.element = el;
    
    if(options.listView)
    {
      if(options.listView.dataIsReady())
      {
        this.initalizeInterface();
      }
    }
  },
  
  initalizeInterface: function()
  {
    
  }

});