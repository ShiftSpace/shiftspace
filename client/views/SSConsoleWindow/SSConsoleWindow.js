// ==Builder==
// @uiclass
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
    SSLog("Creating console window!", SSLogForce);
  },
  

  attachEvents: function()
  {
  },
  
  
  /* SSFramedView Stuff ============================ */
  
  awake: function() {},
  
  
  onInterfaceLoad: function(ui)
  {
    this.parent(ui);
    // TODO: Not super intuitive need someway to specify this automatically - David
    this.element.setProperty('id', 'SSConsoleWindow');
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