// ==Builder==
// @uiclass
// @framedView
// @package           ShiftSpaceUI
// @dependencies      SSFramedView
// ==/Builder==

var SSConsoleIsReadyNotification = 'SSConsoleIsReadyNotification';

var SSConsole = new Class({

  Extends: SSFramedView,
  name: 'SSConsole',
  

  initialize: function(el, options)
  {
    this.parent(el, options);

    SSAddObserver(this, 'onUserLogin', this.handleLogin.bind(this));
    SSAddObserver(this, 'onUserLogout', this.handleLogout.bind(this));
    SSAddObserver(this, 'onUserJoin', this.handleLogin.bind(this));
    SSAddObserver(this, 'onNewShiftSave', this.onNewShiftSave.bind(this));
    SSAddObserver(this, 'onLocalizationChanged', this.localizationChanged.bind(this));
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
  
  
  updateTabs: function()
  {
    if (ShiftSpaceUser.isLoggedIn())
    {
      this.MainTabView.hideTabByName('LoginTabView');

      this.MainTabView.revealTabByName('MyShiftSpacePane');
      this.MainTabView.revealTabByName('PeoplePane');
      this.MainTabView.revealTabByName('GroupsPane');
      this.MainTabView.revealTabByName('InboxPane');
    }
    else
    {
      this.MainTabView.revealTabByName('LoginTabView');

      this.MainTabView.hideTabByName('MyShiftSpacePane');
      this.MainTabView.hideTabByName('PeoplePane');
      this.MainTabView.hideTabByName('GroupsPane');
      this.MainTabView.hideTabByName('InboxPane');
    }
  },


  handleLogin: function()
  {
    this.updateTabs();   
    this.MainTabView.selectTabByName('AllShiftsView');
    if(SSTableForName("AllShifts")) SSTableForName("AllShifts").refresh();
    if(SSTableForName("MyShifts")) SSTableForName("MyShifts").refresh();
  },


  handleLogout: function()
  {
    this.updateTabs();
    this.MainTabView.selectTabByName('AllShiftsView');
    this.MainTabView.refresh();
    if(SSTableForName("AllShifts")) SSTableForName("AllShifts").refresh();
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

  
  showInbox: function()
  {
    if(!this.isVisible()) this.show();
    this.MainTabView.selectTabByName('InboxPane');
  },
  
  
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
          bottom: 205,
          cursor: 'ns-resize',
          height: 5,
          left: 10,
          right: 10,
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
  
  
  subViews: function()
  {
    return this.contentWindow().$$('*[uiclass]').map(SSControllerForNode).filter(function(controller) {
      return (controller.isAwake() && controller.superView() == this);
    }, this);
  },
  
  
  localizationChanged: function(evt)
  {
    SSUpdateStrings(evt.strings, evt.lang, this.contentWindow());
  },

  /* SSFramedView Stuff ---------------------------------------- */

  awake: function(context)
  {
    this.mapOutletsToThis();
  },


  onContextActivate: function(context)
  {
    if(context == this.element.contentWindow)
    {
      if(context == this.element.contentWindow)
      {
        this.MainTabView.addEvent('tabSelected', function(evt) {
        });
      }
      this.updateTabs();
    }
  },


  onInterfaceLoad: function(ui)
  {
    this.parent(ui);
    this.element.setProperty('id', 'SSConsole');
    this.element.addClass('SSDisplayNone');
  }.asPromise(),


  buildInterface: function()
  {
    this.parent();
    this.initResizer();
    this.attachEvents();
    SSPostNotification(SSConsoleIsReadyNotification, this);
    this.setIsLoaded(true);
  }

});