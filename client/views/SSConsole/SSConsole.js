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
    // only really relevant under Sandalphon
    if(typeof SandalphonToolMode == 'undefined')
    {
      this.parent(el, options);
    }
    else
    {
      this.parent(el, $merge(options, {
        generateElement: false
      }));
    }

    // if not tool mode, we load the interface ourselve
    if(typeof SandalphonToolMode == 'undefined')
    {
      // load from the proper place
      var url = String.urlJoin('client/compiledViews/', SSInfo().env, "SSConsoleMain");
      var p = Sandalphon.load(url);
      this.buildInterface(p);
    }

    SSAddObserver(this, 'onUserLogin', this.handleLogin.bind(this));
    SSAddObserver(this, 'onUserLogout', this.handleLogout.bind(this));
    SSAddObserver(this, 'onUserJoin', this.handleLogin.bind(this));
    SSAddObserver(this, 'onSync', this.handleSync.bind(this));
    SSAddObserver(this, 'onSpaceInstall', this.onSpaceInstall.bind(this));
    
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
      if(this.MainTabView) this.initMainTabView();
      if(this.SSSelectLanguage) this.initSelectLanguage();
      if(this.SSInstalledSpaces) this.initInstalledSpacesListView();
      if(this.clearInstalledButton)
      {
        this.clearInstalledButton.addEvent('click', function(_evt) {
          var evt = new Event(_evt);
          SSUninstallAllSpaces();
        });
      }
    }
  },
  
  
  handleSync: function()
  {
    this.updateInstalledSpaces();
  },


  handleLogin: function()
  {
    this.MainTabView.hideTabByName('LoginTabView');
    this.MainTabView.selectTabByName('AllShiftsView');
    this.updateInstalledSpaces();
    if(SSTableForName("AllShifts")) SSTableForName("AllShifts").refresh();
  },


  handleLogout: function()
  {
    this.MainTabView.revealTabByName('LoginTabView');
    this.MainTabView.refresh();
    this.updateInstalledSpaces();
  },


  initMainTabView: function()
  {
    this.MainTabView = this.MainTabView;
  },


  initInstalledSpacesListView: function()
  {
    if(this.SSInstallSpace)
    {
      this.SSInstallSpace.addEvent('click', function(_evt) {
        var evt = new Event(_evt);
        this.installSpace(this.SSInstallSpaceField.getProperty('value'));
      }.bind(this));
    }
    this.SSInstalledSpaces = this.SSInstalledSpaces;
  },
  
  
  showLogin: function()
  {
    if(!this.isVisible()) this.show();
    this.MainTabView.selectTabByName('LoginTabView');
  },


  initSelectLanguage: function()
  {
    this.SSSelectLanguage.addEvent('change', function(_evt) {
      var evt = new Event(_evt);
      SSLoadLocalizedStrings($(evt.target).getProperty('value'), this.element.contentWindow);
    }.bind(this));
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
    // place the resizer above the thing
    var resizer = new SSElement('div', {
      'id': 'SSConsoleResizer'
    });
    $(document.body).grab(resizer);
    
    resizer.makeDraggable({
      modifiers: {x:'', y:'bottom'},
      invert: true,
      onStart: function()
      {
        SSAddDragDiv();
      },
      onComplete: function()
      {
        SSRemoveDragDiv();
      }
    });

    // make the console resizeable
    this.element.makeResizable({
      handle: resizer,
      modifiers: {x:'', y:'height'},
      invert: true
    });
  },
  
  
  canRemove: function(sender)
  {
    var canRemove = false;
    switch(sender.listView)
    {
      case this.SSInstalledSpaces:
        this.uninstallSpace(sender.index);
        canRemove = true;
        break;
      default:
        SSLog('No matching list view', SSLogForce);
        break;
    }
    
    return canRemove;
  },
  
  
  installSpace:function(spaceName)
  {
    SSInstallSpace(spaceName);
  },
  
  
  onSpaceInstall: function()
  {
    this.updateInstalledSpaces();
    this.refreshInstalledSpaces();
  },
  
  
  updateInstalledSpaces: function()
  {
    this.SSInstalledSpaces.setData(SSSpacesByPosition());
    this.SSInstalledSpaces.refresh();
  },
  
  
  refreshInstalledSpaces: function()
  {
    this.SSInstalledSpaces.refresh(true);
  },
  
  
  uninstallSpace:function(index)
  {
    var spaces = SSSpacesByPosition();
    var spaceToRemove = spaces[index];
    SSUninstallSpace(spaceToRemove.name);
  },
  
  
  subViews: function()
  {
    return this.context.$$('*[uiclass]').map(SSControllerForNode).filter(function(controller) {
      return (controller.isAwake() && controller.superView() == this);
    }, this);
  }
});