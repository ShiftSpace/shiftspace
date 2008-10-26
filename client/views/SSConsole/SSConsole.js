// ==Builder==
// @optional
// @name              SSConsole
// @package           ShiftSpaceCoreUI
// @dependencies      SSView, SSTableView, SSTabView, ShiftSpaceElement
// ==/Builder==

var SSConsole = new Class({

  name: 'SSConsole',

  Extends: SSView,

  initialize: function(el, options)
  {
    // only really relevant under Sandalphon
    this.parent(el, options);

    // if not tool mode, we load the interface ourselves
    if(typeof SandalphonToolMode == 'undefined')
    {
      Sandalphon.load('/client/compiledViews/SSConsole', this.buildInterface.bind(this));
    }

    // listen for login/logout eventss
    ShiftSpace.User.addEvent('onUserLogin', this.handleLogin.bind(this));
    ShiftSpace.User.addEvent('onUserLogout', this.handleLogout.bind(this));
    
    // listen for shift events
    SSAddEvent('onShiftSave', this.refreshTableViews.bind(this));
    SSAddEvent('onShiftHide', this.deselectShift.bind(this))

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
    }
  },


  handleLogin: function()
  {
    // empty the login form
    this.emptyLoginForm();
    // hide the login tab
    this.outlets().get('MainTabView').hideTabByName('LoginTabView');
    // update the datasource
    if(this.myShiftsDatasource) this.myShiftsDatasource.setProperty('username', ShiftSpace.User.getUsername());
    // switch to the tab view
    this.outlets().get('MainTabView').selectTabByName('ShiftsTabView');
  },


  handleLogout: function()
  {
    // empty the login form
    this.emptyLoginForm();
    // reveal the login tab
    this.outlets().get('MainTabView').revealTabByName('LoginTabView');
    // update data source
    if(this.myShiftsDatasource) this.myShiftsDatasource.setProperty('username', null);
    // refresh the main tab view
    this.outlets().get('MainTabView').refresh();
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
    ShiftSpace.User.login({
      username: this.outlets().get('SSLoginFormUsername').getProperty('value'),
      password: this.outlets().get('SSLoginFormPassword').getProperty('value')
    }, this.loginFormSubmitCallback.bind(this));
  },


  loginFormSubmitCallback: function(response)
  {
    console.log('Login call back!');
    console.log(response);
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

    ShiftSpace.User.join(joinInput, this.signUpFormSubmitCallback.bind(this));
  },


  signUpFormSubmitCallback: function(response)
  {
    console.log('Joined!');
    console.log(response);
  },


  initConsoleControls: function()
  {
    // init login/logout button
    this.outlets().get('SSConsoleLoginOutButton').addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      if(ShiftSpace.User.isLoggedIn())
      {
        // logout the user
        ShiftSpace.User.logout();
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
      $(context.document.body).grab(fragment);
      $(context.document.body).setProperty('id', 'SSConsoleFrameBody');
      
      // activate the iframe context: create controllers hook up outlets
      Sandalphon.activate(context);
    }.bind(this));
  },


  userClickedRow: function(args)
  {
  },


  userSelectedRow: function(args)
  {
    console.log('MyTableViewDelegate, userClickedRow: ' + args.rowIndex);
    var datasource = args.tableView.datasource();
    if(args.tableView == this.allShiftsTableView)
    {
      console.log('all shifts table view, id of shift ' + datasource.data()[args.rowIndex].id);
      // show the shift
      if(typeof SSShowShift != 'undefined') 
      {
        console.log('show shift!');
        SSShowShift(datasource.data()[args.rowIndex].id);
      }
    }
    else if(args.tableView == this.myShiftsTableView)
    {
      console.log('my shifts table view, id of shift ' + datasource.data()[args.rowIndex].id);
      // set a variable for opening this shift on the next page if the url is different
    }
  },


  userDeselectedRow: function(args)
  {
    console.log('userDeselectedRow');
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
    console.log('canEditRow');
    // in the all shifts table the user can edit only if she owns the shift
    if(args.tableView == this.allShiftsTableView)
    {
      return (ShiftSpace.User.getUsername() == this.allShiftsDatasource.valueForRowColumn(args.rowIndex, 'username'));
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

// Create the object right away if we're not running under the Sandalphon tool
if(typeof SandalphonToolMode == 'undefined')
{
  new SSConsole();
}
else
{
  // Add it the global UI class lookup
  if($type(ShiftSpace.UI) != 'undefined')
  {
    ShiftSpace.UI.SSConsole = SSConsole;
  }
}

