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
    SSAddObserver(this, 'onShiftHide', this.deselectShift.bind(this));
    SSAddObserver(this, 'onSpaceInstall', this.onSpaceInstall.bind(this));
    SSAddObserver(this, 'userDidClickCheckboxForRowInTableView', this.userDidClickCheckboxForRowInTableView.bind(this));
    
    // since we're created programmatically we add entry manually for debugging - David
    ShiftSpaceNameTable.SSConsole = this;
  },
  
  
  initResources: function()
  {
    this.allShifts = new SSResource("AllShifts", {
      resource: {create:'shift', read:'shifts', update:'shift', 'delete':'shift'},
      watches: [{
                  events: [{resource:"shift", method:"create"}],
                  handlers: [function(shift) { SSApplication().setDocument(this.getName(), shift); }]
                },
                {
                  events: [{resource:"shift", method:"create"},
                           {resource:"shift", method:"update"},
                           {resource:"shift", method:"delete"},
                           {resource:"shift", action:"comment"},
                           {resource:"shift", action:"publish"},
                           {resource:"shift", action:"unpublish"}],
                  handlers: [SSResource.dirtyTheViews]
                }],
      delegate: this.PublishPane,
      views: [this.AllShiftsListView]
    });
  },
  
  
  initUserResources: function()
  {
    if(this.__userResourceInitialized) return;
    this.__userResourceInitialized = true
    
    this.myShifts = new SSResource("MyShifts", {
      resource: {read:'user/'+ShiftSpaceUser.getUserName()+'/shifts', update:'shift', 'delete':'shift'},
      watches: [{
                  events: [{resource:"shift", method:"create"}],
                  handlers: [function(shift) { SSApplication().setDocument(this.getName(), shift); }]
                },
                {
                  events: [{resource:"shift", method:"create"},
                           {resource:"shift", method:"update"},
                           {resource:"shift", method:"delete"},
                           {resource:"shift", action:"comment"},
                           {resource:"shift", action:"publish"},
                           {resource:"shift", action:"unpublish"}],
                  handlers: [SSResource.dirtyTheViews]
                }],
      views: [this.MyShiftsListView]
    });    
  },
  
  
  cleanupUserResources: function()
  {
    this.myShifts.dispose();
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
      // initialize the resources
      this.initResources();
      if(this.MainTabView) this.initMainTabView();
      if(this.AllShiftsListView) this.initAllShiftsView();
      if(this.SSLoginFormSubmit) this.initLoginForm();
      if(this.SSSignUpFormSubmit) this.initSignUpForm();
      if(this.SSSelectLanguage) this.initSelectLanguage();
      if(this.SSSetServers) this.initSetServersForm();
      if(this.SSInstalledSpaces) this.initInstalledSpacesListView();
      if(this.clearInstalledButton)
      {
        this.clearInstalledButton.addEvent('click', function(_evt) {
          var evt = new Event(_evt);
          SSUninstallAllSpaces();
        });
      }
      if(ShiftSpaceUser.isLoggedIn() && !this.loginHandled()) this.handleLogin();
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
    this.MainTabView.hideTabByName('LoginTabView');
    if(this.myShiftsDatasource) this.myShiftsDatasource.setProperty('username', ShiftSpaceUser.getUserName());
    this.MainTabView.selectTabByName('AllShiftsView');
    this.updateInstalledSpaces();

    this.initUserResources();
  },


  handleLogout: function()
  {
    this.setLoginHandled(false);
    
    this.emptyLoginForm();
    this.MainTabView.revealTabByName('LoginTabView');
    if(this.myShiftsDatasource) this.myShiftsDatasource.setProperty('username', null);
    this.MainTabView.refresh();
    
    this.updateInstalledSpaces();
  },


  initMainTabView: function()
  {
    this.MainTabView = this.MainTabView;
  },
  
  
  initAllShiftsView: function()
  {                    
    this.AllShiftsView.addEvent('willShow', this.showFilterPane.bind(this));
    this.AllShiftsView.addEvent('hide', this.hideFilterPane.bind(this));
  },
  
  
  initLoginForm: function()
  {
    this.SSLoginFormSubmit.addEvent('click', this.handleLoginFormSubmit.bind(this));
    this.SSLoginForm.addEvent('submit', function(_evt) {
      var evt = new Event(_evt);
      evt.preventDefault();
      this.handleLoginFormSubmit();
    }.bind(this));
    this.LoginTabView.addEvent('tabSelected', this.handleTabSelect.bind(this));
  },
  
  
  initSetServersForm: function()
  {
    var apiField = this.SSSetApiURLField;
    var spacesDirField = this.SSSetSpaceDirField;
    
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
    if(this.SSInstallSpace)
    {
      this.SSInstallSpace.addEvent('click', function(_evt) {
        var evt = new Event(_evt);
        this.installSpace(this.SSInstallSpaceField.getProperty('value'));
      }.bind(this));
    }
    this.SSInstalledSpaces = this.SSInstalledSpaces;
  },
  
  
  handleTabSelect: function(args)
  {
    if(args.tabView == this.LoginTabView && args.tabIndex == 0)
    {
      this.emptyLoginForm();
    }
  },


  emptyLoginForm: function()
  {
    this.SSLoginFormUsername.setProperty('value', '');
    this.SSLoginFormPassword.setProperty('value', '');
  },


  handleLoginFormSubmit: function()
  {
    ShiftSpaceUser.login({
      userName: this.SSLoginFormUsername.getProperty('value'),
      password: this.SSLoginFormPassword.getProperty('value')
    }, this.loginFormSubmitCallback.bind(this));
  },


  loginFormSubmitCallback: function(response)
  {
    this.fireEvent('onUserLogin');
  },


  initSignUpForm: function()
  {
    this.SSSignUpFormSubmit.addEvent('click', this.handleSignUpFormSubmit.bind(this));
    
    this.SSLoginForm.addEvent('submit', function(_evt) {
      var evt = new Event(_evt);
      evt.preventDefault();
      this.handleSignUpFormSubmit();
    }.bind(this));
  },


  handleSignUpFormSubmit: function()
  {
    var joinInput = {
      userName: this.SSSignUpFormUsername.getProperty('value'),
      email: this.SSSignUpFormEmail.getProperty('value'),
      password: this.SSSignUpFormPassword.getProperty('value'),
      passwordVerify: this.SSSignUpFormPassword.getProperty('value')
    };

    var p = ShiftSpaceUser.join(joinInput);
    $if(SSApp.noErr(p),
        this.signUpFormSubmitCallback.bind(null, [p]));
  },


  signUpFormSubmitCallback: function(userData)
  {
    this.MainTabView.selectTabByName('AllShiftsView');
  }.asPromise(),
  
  
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
    return this.context.$$('*[uiclass]').map(SSControllerForNode).filter(function(controller) {
      return (controller.isAwake() && controller.superView() == this);
    }, this);
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