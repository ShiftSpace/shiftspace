// ==Builder==
// @uiclass
// @optional
// @package           ShiftSpaceUI
// ==/Builder==

var SSConsoleIsReadyNotification = 'SSConsoleIsReadyNotification';

var SSConsole = new Class({

  Extends: SSView,
  name: 'SSConsole',
  
  initialize: function(el, options)
  {
    this.parent(el, options);

    var url = String.urlJoin('client/compiledViews/', SSInfo().env, "SSConsoleMain");
    var p = Sandalphon.load(url);
    this.buildInterface(p);

    SSAddObserver(this, 'onUserLogin', this.handleLogin.bind(this));
    SSAddObserver(this, 'onUserLogout', this.handleLogout.bind(this));
    SSAddObserver(this, 'onUserJoin', this.handleLogin.bind(this));
    SSAddObserver(this, 'onNewShiftSave', this.onNewShiftSave.bind(this));
    
    // since we're created programmatically we add entry manually for debugging - David
    ShiftSpaceNameTable.SSConsole = this;
  },
  
  
  isVisible: function()
  {
    return !this.element.hasClass('SSDisplayNone');
  },
  
  
  show: function()
  {
    this.parent();
    SSPostNotification('onConsoleShow');
  },
  
  
  hide: function()
  {
    this.parent();
    SSPostNotification('onConsoleHide');
  },
  
  
  awake: function(context)
  {
    this.mapOutletsToThis();
    if(context == this.element.contentWindow)
    {
      this.MainTabView.addEvent('tabSelected', function(evt) {
      });
    }
  },


  handleLogin: function()
  {
    this.MainTabView.hideTabByName('LoginTabView');
    this.MainTabView.selectTabByName('AllShiftsView');
    if(SSTableForName("AllShifts")) SSTableForName("AllShifts").refresh();
  },


  handleLogout: function()
  {
    this.MainTabView.revealTabByName('LoginTabView');
    this.MainTabView.refresh();
  },
  
  
  onNewShiftSave: function()
  {
    this.MainTabView.selectTabByName('AllShiftsView');
  },


  showLogin: function()
  {
    if(!this.isVisible()) this.show();
    this.MainTabView.selectTabByName('LoginTabView');
  },
  
  
  onFrameLoad: function(ui)
  {
    var context = this.element.contentWindow;
    var doc = context.document;
    
    // under GM not wrapped, erg - David
    if(!context.$)
    {
      context = new Window(context);
      doc = new Document(context.document);
    }

    context.__ssname = this.element.getProperty('id');
    context.__sscontextowner = this;

    this.context = context;
    this.doc = doc;
    
    Sandalphon.addStyle(ui.styles, context);
    
    // grab the interface, strip the outer level, we're putting the console into an iframe
    var fragment = Sandalphon.convertToFragment(ui['interface'], context).getFirst();
    
    $(context.document.body).setProperty('id', 'SSConsoleFrameBody');
    $(context.document.body).grab(fragment);
    
    Sandalphon.activate(context);
    
    this.initResizer();
    this.attachEvents();
    
    SSPostNotification(SSConsoleIsReadyNotification, this);
    this.setIsLoaded(true);
  },
  

  buildInterface: function(ui)
  {
    if($('SSConsole'))
    {
      throw new Error("Ooops it looks an instace of ShiftSpace is already running. Please turn off Greasemonkey or leave this page.");
    }

    // create the iframe where the console will live
    this.element = new IFrame({
      id: 'SSConsole',
      events: {
        load: this.onFrameLoad.bind(this, ui)
      }
    });
    this.element.addClass('SSDisplayNone');
    
    // since we're creating the frame via code we need to hook up the controller reference manually
    SSSetControllerForNode(this, this.element);
    this.element.injectInside(document.body);
  }.asPromise(),
  
  
  attachEvents: function()
  {
    SSAddEvent('keydown', this.handleKeyDown.bind(this));
    SSAddEvent('keyup', this.handleKeyUp.bind(this));
  },
  
  
  handleKeyDown: function(evt)
  {
    evt = new Event(evt);
    if(evt.key == 'shift')
    {
      this.shiftDownTime = $time();
      this.shiftDown = true;
    }
  },
  
  
  handleKeyUp: function(evt)
  {
    evt = new Event(evt);
    
    if(this.shiftDown)
    {
      var now = $time();
      var delta = now - this.shiftDownTime;
    }
    
    if(evt.key == 'shift')
    {
      this.shiftDown = false;
    }
    
    if(this.shiftDown && 
       evt.key == 'space' &&
       delta >= 300)
    {
      if(!this.isVisible())
      {
        this.show();
      }
      else
      {
        this.hide();
      }
      evt.preventDefault();
      evt.stop();
    }
  },
  
  
  initResizer: function()
  {
    var resizer = new SSElement('div', {
        id: 'SSConsoleResizer',
        styles: {
          position: 'fixed',
          bottom: 220,
          cursor: 'ns-resize',
          height: 5,
          left: 10,
          right: 10,
          'z-index': 1000004
        }
    });
    $(document.body).grab(resizer);

    resizer.makeDraggable({
      modifiers: {x:'', y:'bottom'},
      invert: true,
      onStart: SSAddDragDiv,
      onComplete: SSRemoveDragDiv
    });
    
    this.element.makeResizable({
      handle: resizer,
      modifiers: {x:'', y:'height'},
      invert: true
    });
  },
  
  
  subViews: function()
  {
    return this.context.$$('*[uiclass]').map(SSControllerForNode).filter(function(controller) {
      return (controller.isAwake() && controller.superView() == this);
    }, this);
  }
});