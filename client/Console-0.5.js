var SSConsoleClass = new Class({
  
  Extends: SSView,
  

  initialize: function()
  {
    this.parent();
    Sandalphon.load('/client/compiledViews/SSConsole', this.buildInterface.bind(this));
    
    // login logout eventss
    ShiftSpace.User.addEvent('onUserLogin', this.handleLogin.bind(this));
    ShiftSpace.User.addEvent('onUserLogout', this.handleLogout.bind(this));
    
    // if we're on metatron load real data
    this.allShiftsDatasource = new SSTableViewDatasource({
      dataKey: 'shifts',
      dataUpdateKey: 'id',
      dataUpdateURL: 'shift.update',
      dataProviderURL: 'shift.query',
      dataNormalizer: this.legacyNormalizer
    });

    // if we're on metatron load real data
    this.myShiftsDatasource = new SSTableViewDatasource({
      dataKey: 'shifts',
      dataUpdateKey: 'id',
      dataUpdateURL: 'shift.update',
      dataProviderURL: 'shift.query',
      dataNormalizer: this.legacyNormalizer,
      requiredProperties: ['username']
    });

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
    console.log('Fetch all shifts');
    this.allShiftsTableView = tableView;
    tableView.setDelegate(this);
    tableView.setDatasource(this.allShiftsDatasource);
    this.allShiftsDatasource.setProperties({href:window.location});
    this.allShiftsDatasource.fetch();
  },
  
  
  setMyShiftsTableView: function(tableView)
  {
    console.log('Fetch my shifts');
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
    
    // listen for tabShow events
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
    this.outlets().get('SSSignUpFormSubmit').addEvent('click', this.handleSignUpFormSubmit.bind(this));
  },
  
  
  handleSignUpFormSubmit: function()
  {
    var joinInput = {
      username: this.outlets().get('SSSignUpFormUsername').getProperty('value'),
      email: this.outlets().get('SSSignUpFormEmail').getProperty('value'),
      password: this.outlets().get('SSSignUpFormPassword').getProperty('value'),
      password_again: this.outlets().get('SSSignUpFormPassword').getProperty('value')
    };
    
    ShiftSpace.User.join(joinInput, this.signUpFormSubmitCallback.bind(this))
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
  
  
  awake: function(context)
  {
    this.parent();
    
    // test setting outlets to controllers
    if(this.outlets().get('AllShiftsTableView')) this.setAllShiftsTableView(this.outlets().get('AllShiftsTableView'));
    if(this.outlets().get('MyShiftsTableView')) this.setMyShiftsTableView(this.outlets().get('MyShiftsTableView'));
    if(this.outlets().get('SSLoginFormSubmit')) this.initLoginForm();
    if(this.outlets().get('SSSignUpFormSubmit')) this.initSignUpForm();
    if(this.outlets().get('SSConsoleLoginOutButton')) this.initConsoleControls();
  },
  
  
  awakeDelayed: function(context)
  {
    // test outlets in iframes
    if(this.outlets().get('cool')) 
    {
      this.outlets().get('cool').addEvent('click', function(_evt) {
        var evt = new Event(_evt);
        console.log('cool button clicked!');
      });
    }
  },
  

  buildInterface: function(ui)
  {
    this.element = new IFrame({
      id: 'SSConsole'
    });
    this.element.store('__ssviewcontroller__', this);
    this.element.injectInside(document.body);
        
    this.element.addEvent('load', function() {
      var context = this.element.contentWindow;

      // add the style
      Sandalphon.addStyle(ui.styles, context);
      // grab the interface, strip the outer level
      var fragment = Sandalphon.convertToFragment(ui.interface, context).getFirst();
      // place it in the frame
      $(context.document.body).grab(fragment);
      $(context.document.body).setProperty('id', 'SSConsoleFrameBody');
      // activate the iframe context
      Sandalphon.activate(context);
    }.bind(this));
  },
  
  
  userClickedRow: function(args)
  {
    console.log('MyTableViewDelegate, userClickedRow: ' + args.rowIndex);
    var datasource = args.tableView.datasource();
    if(args.tableView == this.allShiftsTableView)
    {
      console.log('all shifts table view, id of shift ' + datasource.data()[args.rowIndex].id);
    }
    else if(args.tableView == this.myShiftsTableView)
    {
      console.log('my shifts table view, id of shift ' + datasource.data()[args.rowIndex].id);
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
  }
  
  
});

new SSConsoleClass();