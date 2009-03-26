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
    
    this.setInterfaceInitialized(false);
    
    if(options.listView)
    {
      this.setListView(options.listView);

      if(options.listView.dataIsReady())
      {
        this.initalizeInterface();
      }
      this.listView().addEvent('onReloadData', this.initalizeInterface.bind(this));
    }
  },
  
  
  setListVew: function(newListView)
  {
    this.__listView = newListView;
  },
  
  
  listView: function()
  {
    return this.__listView;
  },
  
  
  setInterfaceInitialized: function(val)
  {
    this.__interfaceInitialized = val;
  },
  
  
  interfaceInitialized: function()
  {
    return this.__interfaceInitialized;
  },
  
  
  initalizeInterface: function()
  {
    // initialize the page control
  },
  
  
  show: function()
  {
    this.element.removeClass('SSDisplayNone');
  },
  
  
  hide: function()
  {
    this.element.addClass('SSDisplayNone');
  }

});