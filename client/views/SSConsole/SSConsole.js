// ==Builder==
// @uiclass
// @optional
// @package           ShiftSpaceUI
// ==/Builder==

var SSConsole = new Class({

  name: 'SSConsole',

  Extends: SSView,

  initialize: function(el, options)
  {
    SSLog("INSTANTIATING SSConsole", SSLogMessage);
    SSLog("Calling parent", SSLogMessage);
    
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
    SSLog("Loading interface", SSLogMessage);
    if(typeof SandalphonToolMode == 'undefined')
    {
      Sandalphon.load('/client/compiledViews/SSConsole', this.buildInterface.bind(this));
    }

    // listen for login/logout events, pass in reference to self
    // so that ShiftSpace notifies after this object's awake method has been called
    // this is because outlets won't be set until that point
    SSLog('Adding SSConsole events', SSLogMessage);
    SSAddEvent('onUserLogin', this.handleLogin.bind(this), this);
    SSAddEvent('onUserLogout', this.handleLogout.bind(this), this);
    
    // listen for shift events
    SSAddEvent('onShiftSave', this.refreshTableViews.bind(this));
    SSAddEvent('onShiftHide', this.deselectShift.bind(this));

    // listen for global events as well

    // allocate datasource for page shifts
    SSLog('Adding datasources', SSLogMessage);
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
    
    SSLog('>>>>>>>>>>>>>>>>>>>>>>> Done with initialization', SSLogForce);
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
      if(this.outlets().get('SSConsoleLoginOutButton')) this.initConsoleControls();
      if(this.outlets().get('SSSelectLanguage')) this.initSelectLanguage();
      if(this.outlets().get('SSSetServers')) this.initSetServersForm();
      if(this.outlets().get('SSUserLoginStatus')) this.initUserLoginStatus();
      if(this.outlets().get('clearInstalledButton'))
      {
        this.outlets().get('clearInstalledButton').addEvent('click', function(_evt) {
          var evt = new Event(_evt);
          SSUninstallAllSpaces();
        });
      }
      if(this.outlets().get('SSInstalledSpaces'))
      {
        SSLog('Initialize installed spaces!', SSLogForce);
        
      }
      
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
    SSLog('Handle login', SSLogForce);
    this.setLoginHandled(true);
    
    // empty the login form
    this.emptyLoginForm();
    // hide the login tab
    this.outlets().get('MainTabView').hideTabByName('LoginTabView');
    // update the datasource
    if(this.myShiftsDatasource) this.myShiftsDatasource.setProperty('username', ShiftSpaceUser.getUsername());
    // switch to the tab view
    this.outlets().get('MainTabView').selectTabByName('ShiftsTabView');
    
    // update login status
    var loginStatus = this.outlets().get('SSUserLoginStatus');
    if(loginStatus)
    {
      loginStatus.getElementById('SSUserIsNotLoggedIn').removeClass('SSActive');
      var isLoggedIn = loginStatus.getElementById('SSUserIsLoggedIn');
      isLoggedIn.addClass('SSActive');
      isLoggedIn.getElement('span').set('text', ShiftSpaceUser.getUsername());
    }
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
    
    // update login status
    var loginStatus = this.outlets().get('SSUserLoginStatus');
    if(loginStatus)
    {
      loginStatus.getElementById('SSUserIsNotLoggedIn').addClass('SSActive');
      loginStatus.getElementById('SSUserIsLoggedIn').removeClass('SSActive');
    }
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
  
  
  initUserLoginStatus: function()
  {
    
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


  initConsoleControls: function()
  {
    // init login/logout button
    this.outlets().get('SSConsoleLoginOutButton').addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      if(ShiftSpaceUser.isLoggedIn())
      {
        // logout the user
        ShiftSpaceUser.logout();
      }
      else
      {
        // select the login tab view
        this.outlets().get('MainTabView').selectTabByName('LoginTabView');
      }
    }.bind(this));

    // init bug report button

    // init close button
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
    SSLog("BUILD SSConsole interface");
    
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
    SSLog("Iframe injected");
    this.element.injectInside(document.body);

    // finish initialization after iframe load
    this.element.addEvent('load', function() {
      SSLog("SSConsole iframe loaded");
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
    
  }


});
