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
  

  initResizer: function()
  {
    var resizer = new SSElement('div', {
        id: 'SSConsoleWindowResizer',
        styles: {
          position: 'fixed',
          bottom: 178,
          cursor: 'ns-resize',
          height: 5,
          right: 80,
          width: 320,
          'z-index': 1000004
        }
    });

    $(document.body).grab(resizer);

    resizer.addEvent('mousedown', SSAddDragDiv);
    
    resizer.makeDraggable({
      modifiers: {x:'', y:'bottom'},
      invert: true,
      onComplete: SSRemoveDragDiv
    });

    this.element.makeResizable({
      handle: resizer,
      modifiers: {x:'', y:'height'},
      invert: true
    });
  },


  sendFront: function()
  {
    this.element.removeClass("SSConsoleWindowBack");
    this.element.addClass("SSConsoleWindowFront");
  },


  sendBack: function()
  {
    this.element.removeClass("SSConsoleWindowFront");
    this.element.addClass("SSConsoleWindowBack");
  },


  attachEvents: function()
  {
    this.SSConsoleWindowClose.addEvent("click", this.hide.bind(this));
  },
  
  
  /* SSFramedView Stuff ============================ */
  
  awake: function() {},
  
  
  onInterfaceLoad: function(ui)
  {
    this.parent(ui);
    this.element.addClass("SSDisplayNone");
    this.element.addClass("SSConsoleWindowFront");
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
    this.initResizer();
    this.attachEvents();
    SSPostNotification('onConsoleWindowLoad', this);
    this.setIsLoaded(true);
  }
});