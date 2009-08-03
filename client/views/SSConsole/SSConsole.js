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
      var p = Sandalphon.load('/client/compiledViews/'+SSInfo().env+'/SSConsoleMain');
      this.buildInterface(p);
    }

    SSAddObserver(this, 'onUserLogin', this.handleLogin.bind(this));
    SSAddObserver(this, 'onUserLogout', this.handleLogout.bind(this));
    SSAddObserver(this, 'onUserJoin', this.handleLogin.bind(this));
    SSAddObserver(this, 'onSync', this.handleSync.bind(this));
    
    SSAddObserver(this, 'onShiftSave', this.refreshListViews.bind(this));
    SSAddObserver(this, 'onShiftDelete', this.refreshListViews.bind(this));
    SSAddObserver(this, 'onShiftHide', this.deselectShift.bind(this));
    
    SSAddObserver(this, 'onSpaceInstall', this.onSpaceInstall.bind(this));
    
    SSAddObserver(this, 'userDidClickCheckboxForRowInTableView', this.userDidClickCheckboxForRowInTableView.bind(this));
  },
  
  
  isVisible: function()
  {
    return !this.element.hasClass('SSDisplayNone');
  },
  
  
  show: function()
  {
    this.element.removeClass('SSDisplayNone');
    SSPostNotification('onConsoleShow');
  },
  
  
  hide: function()
  {
    this.element.addClass('SSDisplayNone');
    SSPostNotification('onConsoleHide');
  },
  
  
  handleSync: function()
  {
    this.updateInstalledSpaces();
  },
  
  
  awake: function(context)
  {
    this.mapOutletsToThis();
    
    // in Sandalphon tool mode we're not iframed, in ShiftSpace we are
    if((context == window && typeof SandalphonToolMode != 'undefined') ||
       (context == this.element.contentWindow && typeof SandalphonToolMode == 'undefined'))
    {
      if(this.outlets().get('MainTabView')) this.initMainTabView();
      if(this.AllShiftsListView)
      {
        var p = SSApp.get({resource:'shifts', data:{href:window.location.href.split("#")[0]}})
        this.AllShiftsListView.setData(p);
        this.AllShiftsListView.reloadData(p);
        SSApp.addWatcher(this.AllShiftsListView, 'shift', ['create', 'delete', 'update']);
        SSAddShifts(p);
        this.initAllShiftsView();
      }
      if(this.outlets().get('SSLoginFormSubmit')) this.initLoginForm();
      if(this.outlets().get('SSSignUpFormSubmit')) this.initSignUpForm();
      if(this.outlets().get('SSSelectLanguage')) this.initSelectLanguage();
      if(this.outlets().get('SSSetServers')) this.initSetServersForm();
      if(this.outlets().get('SSInstalledSpaces')) this.initInstalledSpacesListView();
      if(this.outlets().get('clearInstalledButton'))
      {
        this.outlets().get('clearInstalledButton').addEvent('click', function(_evt) {
          var evt = new Event(_evt);
          SSUninstallAllSpaces();
        });
      }

      if(this.outlets()['PublishPane'])
      {
        this.PublishPane = this.outlets()['PublishPane'];
      }
      
      if(ShiftSpaceUser.isLoggedIn() && !this.loginHandled())
      {
        this.handleLogin();
      }
    }
  },
  
  
  onContextActivate: function(context)
  {
    
  },
  
  
  setLoginHandled: function(value)
  {
    this.__loginHandled = value;
  },
  
  
  loginHandled: function()
  {
    return this.__loginHandled;
  },


  handleLogin: function()
  {
    this.setLoginHandled(true);
    
    this.emptyLoginForm();
    this.outlets().get('MainTabView').hideTabByName('LoginTabView');
    if(this.myShiftsDatasource) this.myShiftsDatasource.setProperty('username', ShiftSpaceUser.getUserName());
    this.outlets().get('MainTabView').selectTabByName('AllShiftsView');
    
    this.updateInstalledSpaces();
  },


  handleLogout: function()
  {
    this.setLoginHandled(false);
    
    this.emptyLoginForm();
    this.outlets().get('MainTabView').revealTabByName('LoginTabView');
    if(this.myShiftsDatasource) this.myShiftsDatasource.setProperty('username', null);
    this.outlets().get('MainTabView').refresh();
    
    this.updateInstalledSpaces();
  },


  initMainTabView: function()
  {
    this.MainTabView = this.outlets()['MainTabView'];
  },
  
  
  initAllShiftsView: function()
  {                    
    this.AllShiftsView.addEvent('willShow', this.showFilterPane.bind(this));
    this.AllShiftsView.addEvent('hide', this.hideFilterPane.bind(this));
  },
  
  
  initLoginForm: function()
  {
    this.outlets().get('SSLoginFormSubmit').addEvent('click', this.handleLoginFormSubmit.bind(this));

    this.outlets().get('SSLoginForm').addEvent('submit', function(_evt) {
      var evt = new Event(_evt);
      evt.preventDefault();
      this.handleLoginFormSubmit();
    }.bind(this));

    this.outlets().get('LoginTabView').addEvent('tabSelected', this.handleTabSelect.bind(this));
  },
  
  
  initSetServersForm: function()
  {
    var apiField = this.outlets().get('SSSetApiURLField');
    var spacesDirField = this.outlets().get('SSSetSpaceDirField');
    
    if(SSInfo)
    {
      apiField.setProperty('value', SSInfo().server);
      spacesDirField.setProperty('value', SSInfo().spacesDir);

      apiField.addEvent('keydown', function(_evt) {
        var evt = new Event(_evt);
        var previousValue = SSGetValue('server', SSInfo().server);
        if(evt.key == 'enter')
        {
          SSLog('Update the api variable. prev: ' + previousValue);
        }
      }.bind(this));

      spacesDirField.addEvent('keydown', function(_evt) {
        var evt = new Event(_evt);
        var previousValue = SSGetValue('spacesDir', SSInfo().spacesDir);
        if(evt.key == 'enter')
        {
          SSLog('Update the space dir variable. prev:' + previousValue);
        }
      }.bind(this));
    }
  },


  initInstalledSpacesListView: function()
  {
    if(this.outlets().get('SSInstallSpace'))
    {
      this.outlets().get('SSInstallSpace').addEvent('click', function(_evt) {
        var evt = new Event(_evt);
        this.installSpace(this.outlets().get('SSInstallSpaceField').getProperty('value'));
      }.bind(this));
    }
    this.SSInstalledSpaces = this.outlets().get('SSInstalledSpaces');
  },
  
  
  handleTabSelect: function(args)
  {
    if(args.tabView == this.outlets().get('LoginTabView') && args.tabIndex == 0)
    {
      this.emptyLoginForm();
    }
  },


  emptyLoginForm: function()
  {
    this.outlets().get('SSLoginFormUsername').setProperty('value', '');
    this.outlets().get('SSLoginFormPassword').setProperty('value', '');
  },


  handleLoginFormSubmit: function()
  {
    ShiftSpaceUser.login({
      userName: this.outlets().get('SSLoginFormUsername').getProperty('value'),
      password: this.outlets().get('SSLoginFormPassword').getProperty('value')
    }, this.loginFormSubmitCallback.bind(this));
  },


  loginFormSubmitCallback: function(response)
  {
    this.fireEvent('onUserLogin');
  },


  initSignUpForm: function()
  {
    this.outlets().get('SSSignUpFormSubmit').addEvent('click', this.handleSignUpFormSubmit.bind(this));
    
    this.outlets().get('SSLoginForm').addEvent('submit', function(_evt) {
      var evt = new Event(_evt);
      evt.preventDefault();
      this.handleSignUpFormSubmit();
    }.bind(this));
  },


  handleSignUpFormSubmit: function()
  {
    var joinInput = {
      userName: this.outlets().get('SSSignUpFormUsername').getProperty('value'),
      email: this.outlets().get('SSSignUpFormEmail').getProperty('value'),
      password: this.outlets().get('SSSignUpFormPassword').getProperty('value'),
      passwordVerify: this.outlets().get('SSSignUpFormPassword').getProperty('value')
    };

    var p = ShiftSpaceUser.join(joinInput);
    $if(SSApp.noErr(p),
        this.signUpFormSubmitCallback.bind(null, [p]));
  },


  signUpFormSubmitCallback: function(userData)
  {
    this.outlets().get('MainTabView').selectTabByName('AllShiftsView');
  }.asPromise(),
  
  
  showLogin: function()
  {
    if(!this.isVisible()) this.show();
    this.outlets().get('MainTabView').selectTabByName('LoginTabView');
  },


  initSelectLanguage: function()
  {
    this.outlets().get('SSSelectLanguage').addEvent('change', function(_evt) {
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


  userClickedRow: function(args)
  {
    
  },


  userSelectedRow: function(evt)
  {
    if(evt.listView == this.AllShiftsListView)
    {
      // show the shift
      if(typeof SSShowShift != 'undefined') 
      {
        var id = evt.listView.data()[args.rowIndex].id;
        SSShowShift(id);
        this.showShift(id);
      }
    }
    else if(evt.listView == this.myShiftsTableView)
    {
      // set a variable for opening this shift on the next page if the url is different
    }
  },
  
  
  showShift: function(shiftId)
  {
    // highlight the shift
  },
  
  
  hideShift: function(shiftId)
  {
    // unhighlight the shift
  },
  
  
  focusShift: function(shiftId)
  {
    
  },
  
  
  blurShift: function(shiftId)
  {
    
  },
  
  
  userDeselectedRow: function(evt)
  {
    if(evt.listView == this.AllShiftsListView)
    {
      SSHideShift(evt.listView.data()[evt.rowIndex].id);
    }
  },


  canSelectRow: function(data)
  {

  },


  canSelectColumn: function(data)
  {

  },


  canEditRow: function(evt)
  {
    // in the all shifts table the user can edit only if she owns the shift
    if(evt.tableView == this.AllShiftsListView)
    {
      return (ShiftSpaceUser.getUserName() == this.allShiftsDatasource.valueForRowColumn(evt.rowIndex, 'username'));
    }

    return true;
  },
  
  
  getVisibleListView: function()
  {
    if(this.AllShiftsListView.isVisible()) return this.AllShiftsListView;
  },
  
  
  refreshListViews: function(shiftId)
  {
    var visibleListView = this.getVisibleListView();

    if(visibleListView)
    {
      visibleListView.reloadData();
    }
  },
  
  
  deselectShift: function(shiftId)
  {
    
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
  
  
  userDidClickCheckboxForRowInTableView: function(data)
  {
    var checkedRows = data.tableView.checkedRows();
    
    if(checkedRows.length > 0)
    {
      this.PublishPane.show();
    }
    else
    {
      this.PublishPane.hide();
    }
  },
  
  
  checkedShifts: function()
  {
    var tv = this.visibleTableView();
    if(tv)
    {
      var indices = tv.checkedShifts();
      return indices.map(function(idx) {
        return this.allShiftsDatasource.rowForIndex(idx)['id'];
      }.bind(this));
    }
  },
  
  
  subViews: function()
  {
    return this.context.$$('*[uiclass]').map(SSControllerForNode);
  },
  
  
  listViews: function()
  {
    return this.subViews().filter(function(subView) {
      return $memberof(subView.name, 'SSListView');
    });
  },
  
  
  visibleListView: function()
  {
    return this.listViews().filter($msg('isVisible')).first();
  },
  
  
  showFilterPane: function()
  {
    this.FilterPane.show();
    this.AllShiftsView.element.addClass('SSFilterPaneOpen');
  },
  
  
  hideFilterPane: function()
  {
    this.FilterPane.hide();
    this.AllShiftsView.element.removeClass('SSFilterPaneOpen');
  }
});
