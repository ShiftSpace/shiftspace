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
      Sandalphon.load('/client/compiledViews/SSConsole', this.buildInterface.bind(this));
    }

    // listen for login/logout events, pass in reference to self
    // so that ShiftSpace notifies after this object's awake method has been called
    // this is because outlets won't be set until that point
    SSAddObserver(this, 'onUserLogin', this.handleLogin.bind(this));
    SSAddObserver(this, 'onUserLogout', this.handleLogout.bind(this));
    SSAddObserver(this, 'onSync', this.handleSync.bind(this));
    
    // listen for shift events
    SSAddEvent('onShiftSave', this.refreshTableViews.bind(this));
    SSAddEvent('onShiftHide', this.deselectShift.bind(this));
    
    // space install event
    SSAddEvent('onSpaceInstall', this.onSpaceInstall.bind(this));

    // listen for global events as well

    // allocate datasource for page shifts
    this.allShiftsDatasource = new SSTableViewDatasource({
      dataKey: 'shifts',
      dataUpdateKey: 'id',
      dataUpdateURL: 'shift.update',
      dataProviderURL: 'shift.query',
      dataNormalizer: this.legacyNormalizer
    });

    // allocate datasource for user shifts
    this.myShiftsDatasource = new SSTableViewDatasource({
      dataKey: 'shifts',
      dataUpdateKey: 'id',
      dataUpdateURL: 'shift.update',
      dataProviderURL: 'shift.query',
      dataNormalizer: this.legacyNormalizer,
      requiredProperties: ['username']
    });
  },
  
  
  handleSync: function()
  {
  },
  
  
  awake: function(context)
  {
    this.parent();
    
    // in Sandalphon tool mode we're not iframed, in ShiftSpace we are
    if((context == window && typeof SandalphonToolMode != 'undefined') ||
       (context == this.element.contentWindow && typeof SandalphonToolMode == 'undefined'))
    {
      if(this.outlets().get('AllShiftsTableView')) this.setAllShiftsTableView(this.outlets().get('AllShiftsTableView'));
      if(this.outlets().get('MyShiftsTableView')) this.setMyShiftsTableView(this.outlets().get('MyShiftsTableView'));
      if(this.outlets().get('SSLoginFormSubmit')) this.initLoginForm();
      if(this.outlets().get('SSSignUpFormSubmit')) this.initSignUpForm();
      if(this.outlets().get('SSSelectLanguage')) this.initSelectLanguage();
      if(this.outlets().get('SSSetServers')) this.initSetServersForm();
      if(this.outlets().get('clearInstalledButton'))
      {
        this.outlets().get('clearInstalledButton').addEvent('click', function(_evt) {
          var evt = new Event(_evt);
          SSUninstallAllSpaces();
        });
      }
      // FIXME: postpone until after SSSynch - David 5/27/2009
      if(this.outlets().get('SSInstalledSpaces')) this.initInstalledSpacesListView();
      
      if(ShiftSpaceUser.isLoggedIn() && !this.loginHandled())
      {
        this.handleLogin();
      }
    }
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
    
    // empty the login form
    this.emptyLoginForm();
    // hide the login tab
    this.outlets().get('MainTabView').hideTabByName('LoginTabView');
    // update the datasource
    if(this.myShiftsDatasource) this.myShiftsDatasource.setProperty('username', ShiftSpaceUser.getUsername());
    // switch to the tab view
    this.outlets().get('MainTabView').selectTabByName('AllShiftsTableView');
    
    this.updateInstalledSpaces();
  },


  handleLogout: function()
  {
    this.setLoginHandled(false);
    
    // empty the login form
    this.emptyLoginForm();
    // reveal the login tab
    this.outlets().get('MainTabView').revealTabByName('LoginTabView');
    // update data source
    if(this.myShiftsDatasource) this.myShiftsDatasource.setProperty('username', null);
    // refresh the main tab view
    this.outlets().get('MainTabView').refresh();
    
    this.updateInstalledSpaces();
  },


  setAllShiftsTableView: function(tableView)
  {
    var properties = (typeof SandalphonToolMode == 'undefined' ) ? {href:window.location} : {href:server+'sandbox/index.php'};

    this.allShiftsTableView = tableView;
    tableView.setDelegate(this);
    tableView.setDatasource(this.allShiftsDatasource);
    this.allShiftsDatasource.setProperties(properties);
    this.allShiftsDatasource.fetch();
  },


  setMyShiftsTableView: function(tableView)
  {
    this.myShiftsTableView = tableView;
    tableView.setDelegate(this);
    tableView.setDatasource(this.myShiftsDatasource);
    this.myShiftsDatasource.fetch();
  },


  initLoginForm: function()
  {
    // catch click
    this.outlets().get('SSLoginFormSubmit').addEvent('click', this.handleLoginFormSubmit.bind(this));

    // catch enter
    this.outlets().get('SSLoginForm').addEvent('submit', function(_evt) {
      var evt = new Event(_evt);
      evt.preventDefault();
      this.handleLoginFormSubmit();
    }.bind(this));

    // listen for tabSelected events so we can clear out the login form
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

      // add keydown event handlers on them for carraige return
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
    this.updateInstalledSpaces();
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
      username: this.outlets().get('SSLoginFormUsername').getProperty('value'),
      password: this.outlets().get('SSLoginFormPassword').getProperty('value')
    }, this.loginFormSubmitCallback.bind(this));
  },


  loginFormSubmitCallback: function(response)
  {
    this.fireEvent('onUserLogin');
  },


  initSignUpForm: function()
  {
    // catch click
    this.outlets().get('SSSignUpFormSubmit').addEvent('click', this.handleSignUpFormSubmit.bind(this));
    
    // catch enter
    this.outlets().get('SSLoginForm').addEvent('submit', function(_evt) {
      var evt = new Event(_evt);
      evt.preventDefault();
      this.handleSignUpFormSubmit();
    }.bind(this));
  },


  handleSignUpFormSubmit: function()
  {
    var joinInput = {
      username: this.outlets().get('SSSignUpFormUsername').getProperty('value'),
      email: this.outlets().get('SSSignUpFormEmail').getProperty('value'),
      password: this.outlets().get('SSSignUpFormPassword').getProperty('value'),
      password_again: this.outlets().get('SSSignUpFormPassword').getProperty('value')
    };

    ShiftSpaceUser.join(joinInput, this.signUpFormSubmitCallback.bind(this));
  },


  signUpFormSubmitCallback: function(response)
  {
  },
  
  
  showLogin: function()
  {
    // select the login tab view
    this.outlets().get('MainTabView').selectTabByName('LoginTabView');
  },


  initSelectLanguage: function()
  {
    // attach events to localization switcher
    this.outlets().get('SSSelectLanguage').addEvent('change', function(_evt) {
      var evt = new Event(_evt);
      SSLoadLocalizedStrings(evt.target.getProperty('value'), this.element.contentWindow);
    }.bind(this));
  },
  

  buildInterface: function(ui)
  {
    if($('SSConsole'))
    {
      throw new Error("Ooops it looks an instace of ShiftSpace is already running. Please turn off Greasemonkey or leave this page.");
    }

    // create the iframe where the console will live
    this.element = new IFrame({
      id: 'SSConsole'
    });
    // since we're creating the frame via code we need to hook up the controller
    // reference manually
    SSSetControllerForNode(this, this.element);
    this.element.injectInside(document.body);

    // finish initialization after iframe load
    this.element.addEvent('load', function() {
      var context = this.element.contentWindow;

      // under GM not wrapped, erg - David
      if(!context.$)
      {
        context = new Window(context);
        var doc = new Document(context.document);
      }

      // add the styles into the iframe
      Sandalphon.addStyle(ui.styles, context);
      
      // grab the interface, strip the outer level, we're putting the console into an iframe
      var fragment = Sandalphon.convertToFragment(ui['interface'], context).getFirst();
      
      // place it in the frame
      $(context.document.body).setProperty('id', 'SSConsoleFrameBody');
      $(context.document.body).grab(fragment);
      
      // activate the iframe context: create controllers hook up outlets
      Sandalphon.activate(context);
      
      // create the resizer
      this.initResizer();
      
      SSPostNotification(SSConsoleIsReadyNotification, this);
    }.bind(this));
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


  userSelectedRow: function(args)
  {
    var datasource = args.tableView.datasource();
    if(args.tableView == this.allShiftsTableView)
    {
      // show the shift
      if(typeof SSShowShift != 'undefined') 
      {
        var shiftId = datasource.data()[args.rowIndex].id;
        SSShowShift(shiftId);
        this.showShift(shiftId);
      }
    }
    else if(args.tableView == this.myShiftsTableView)
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
  
  
  userDeselectedRow: function(args)
  {
    var datasource = args.tableView.datasource();
    if(args.tableView == this.allShiftsTableView)
    {
      SSHideShift(datasource.data()[args.rowIndex].id);
    }
  },


  canSelectRow: function(data)
  {

  },


  canSelectColumn: function(data)
  {

  },


  canEditRow: function(args)
  {
    // in the all shifts table the user can edit only if she owns the shift
    if(args.tableView == this.allShiftsTableView)
    {
      return (ShiftSpaceUser.getUsername() == this.allShiftsDatasource.valueForRowColumn(args.rowIndex, 'username'));
    }

    return true;
  },
  
  
  getVisibleTableView: function()
  {
    if(this.allShiftsTableView.isVisible()) return this.allShiftsTableView;
    if(this.myShiftsTableView.isVisible()) return this.myShiftsTableView;
  },
  
  
  refreshTableViews: function(shiftId)
  {
    var visibleTableView = this.getVisibleTableView();

    if(visibleTableView)
    {
      // reload the table
      visibleTableView.reload();
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
  }

});
