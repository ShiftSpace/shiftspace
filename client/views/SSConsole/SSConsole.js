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

    SSAddObserver(this, 'onUserLogin', this.update.bind(this));
    SSAddObserver(this, 'onUserLogout', this.update.bind(this));
    SSAddObserver(this, 'onUserJoin', this.update.bind(this));
    SSAddObserver(this, 'onNewShiftSave', this.onNewShiftSave.bind(this));
    SSAddObserver(this, 'onLocalizationChanged', this.localizationChanged.bind(this));
    SSAddObserver(this, 'toggleConsole', this.toggle.bind(this));
  },

  
  show: function()
  {
    if(this.isVisible()) return;
    this.parent();
    this.update();
    SSPostNotification('onConsoleShow');
  }.decorate(ssfv_ensure),
  
  
  hide: function()
  {
    this.parent();
    SSPostNotification('onConsoleHide');
  },
  
  
  toggle: function()
  {
    if(this.isVisible())
    {
      this.hide();
    }
    else
    {
      this.show();
    }
  },
  

  updateTabs: function()
  {
    if(ShiftSpaceUser.isLoggedIn())
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


  update: function()
  {
    if(this.isLoaded())
    {
      if(ShiftSpace.User.isLoggedIn())
      {
        this.updateTabs();   
        this.MainTabView.selectTabByName('AllShiftsView');
        if(SSTableForName("AllShifts")) SSTableForName("AllShifts").refresh();
        if(SSTableForName("MyShifts")) SSTableForName("MyShifts").refresh();
      }
      else
      {
        this.updateTabs();
        this.MainTabView.selectTabByName('AllShiftsView');
        this.MainTabView.refresh();
        if(SSTableForName("AllShifts")) SSTableForName("AllShifts").refresh();
      }
    }
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
  
  
  initResizer: function()
  {
    this.resizer = new SSElement('div', {
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
  
  
  subViews: function()
  {
    return this.contentWindow().$$('*[uiclass]').map(SSControllerForNode).filter(function(controller) {
      return (controller.isAwake() && controller.superView() == this);
    }, this);
  },
  
  
  localizationChanged: function(evt)
  {
    if(this.delayed()) return;
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
      this.mapOutletsToThis();
      this.MainTabView.addEvent('tabSelected', function(evt) {});
      this.updateTabs();
    }
  },


  onInterfaceLoad: function(ui)
  {
    this.parent(ui);
    this.element.addClass('SSDisplayNone');
  }.asPromise(),


  buildInterface: function()
  {
    this.parent();
    this.initResizer();
    this.setIsLoaded(true);
    SSPostNotification(SSConsoleIsReadyNotification, this);
  }
});