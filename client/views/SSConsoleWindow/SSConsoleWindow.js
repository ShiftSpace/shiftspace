// ==Builder==
// @uiclass
// @framedView
// @package           ShiftSpaceUI
// @dependencies      SSFramedView
// ==/Builder==

/*
  Class: SSConsoleWindow
    The Console Window class. Comments, the Publish Pane, User details, Group details,
    Space settings, they all live here :)
*/
var SSConsoleWindow = new Class({

  Extends: SSFramedView,
  name: "SSConsoleWindow",

  defaults: function() {
    return $merge(this.parent(), {
      multipleSelection: true
    });
  },
  
  
  initialize: function(el, options)
  {
    this.parent(el, options);
  },
  

  attachEvents: function()
  {
  },
  
  
  /* SSFramedView Stuff ============================ */
  
  awake: function() {},
  
  
  onInterfaceLoad: function(ui)
  {
    this.parent(ui);
    this.element.addClass("SSDisplayNone");
  }.asPromise(),
  
  
  onContextActivate: function(context)
  {
    if(context == this.element.contentWindow)
    {
      this.mapOutletsToThis();
      this.attachEvents();
    }
  },
  
  
  buildInterface: function()
  {
    this.parent();
    SSPostNotification('onConsoleWindowLoad', this);
    this.setIsLoaded(true);
  }
});