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

    SSAddObserver(this, "onUserLogout", this.onLogout.bind(this));
  },


  onLogout: function()
  {
    this.hide();
  },
  

  initResizer: function()
  {
    this.resizer = new SSElement('div', {
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

    $(document.body).grab(this.resizer);

    this.resizer.addEvent('mousedown', SSAddDragDiv);
    
    this.resizer.makeDraggable({
      modifiers: {x:'', y:'bottom'},
      invert: true,
      onComplete: SSRemoveDragDiv
    });

    this.element.makeResizable({
      handle: this.resizer,
      modifiers: {x:'', y:'height'},
      invert: true
    });
  },


  hide: function()
  {
    this.parent();
    this.sendFront();
  },


  sendFront: function()
  {
    this.__isBack = false;
    this.element.removeClass("SSConsoleWindowBack");
    this.element.addClass("SSConsoleWindowFront");
  },


  sendBack: function()
  {
    this.__isBack = true;
    this.element.removeClass("SSConsoleWindowFront");
    this.element.addClass("SSConsoleWindowBack");
  },


  attachEvents: function()
  {
    this.SSConsoleWindowClose.addEvent("click", this.hide.bind(this));
    $(this.contentDocument().body).addEvent("click", function(evt) {
      evt = new Event(evt);
      if(this.__isBack) this.sendFront();
    }.bind(this));
  },
  
  
  tall: function()
  {
    this.element.removeClass("SSConsoleWindowShort");
    this.element.addClass("SSConsoleWindowTall");
    this.resizer.removeClass("SSConsoleWindowResizerShort");
    this.resizer.addClass("SSConsoleWindowResizerTall");
    this.element.setStyles({
      height: ''
    });
    this.resizer.setStyles({
      bottom: ''
    });
  },


  "short": function()
  {
    this.element.removeClass("SSConsoleWindowTall");
    this.element.addClass("SSConsoleWindowShort");
    this.resizer.removeClass("SSConsoleWindowResizerTall");
    this.resizer.addClass("SSConsoleWindowResizerShort");
    this.element.setStyles({
      height: ''
    });
    this.resizer.setStyles({
      bottom: ''
    });
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