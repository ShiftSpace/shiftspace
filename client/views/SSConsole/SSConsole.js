var SSConsole = new Class({
  
  name: "SSConsole",
  
  Extends: SSView,
  
  legacyNormalizer : {
    normalize: function(data)
    {
      data.length.times(function(idx) {
        var row = data[idx];
        var space = row.space;
        switch(space)
        {
          case 'notes':
            row.space = "Notes";
          break;
          case 'highlight':
            row.space = 'Highlights';
          break;
          case 'sourceshift':
            row.space = 'SourceShift';
          break;
          case 'imageswap':
            row.space = "ImageSwap"
          break;
          default:
          break;
        }
      });
      return data;  
    }
  },
  
  
  initialize: function(el, options)
  {
    this.parent(el, options);
    
    ShiftSpace.User.addEvent('login', this.handleLogin.bind(this));
    ShiftSpace.User.addEvent('logout', this.handleLogout.bind(this));
    
    // set the datasource for the tableview
    if(window.location.hostname == "www.shiftspace.org" ||
       window.location.hostname == "metatron.shiftspace.org")
    {
      // if we're on metatron load real data
      this.allShiftsDatasource = new SSTableViewDatasource({
        dataKey: 'shifts',
        dataUpdateKey: 'id',
        dataUpdateURL: 'http://metatron.shiftspace.org/dev/shiftspace.php?method=shift.update',
        dataProviderURL: 'http://metatron.shiftspace.org/dev/shiftspace.php?method=shift.query',
        dataNormalizer: this.legacyNormalizer
      });

      // if we're on metatron load real data
      this.myShiftsDatasource = new SSTableViewDatasource({
        dataKey: 'shifts',
        dataUpdateKey: 'id',
        dataUpdateURL: 'http://metatron.shiftspace.org/dev/shiftspace.php?method=shift.update',
        dataProviderURL: 'http://metatron.shiftspace.org/dev/shiftspace.php?method=shift.query',
        dataNormalizer: this.legacyNormalizer,
        requiredProperties: ['username']
      });
    }
    else
    {
      // otherwise just use dummy data
      this.allShiftsDatasource = new SSTableViewDatasource({
        data: [
          {id: 'abch', space: 'Notes', summary: 'Junk', username: 'tester', created: 'Yesterday'},
          {id: 'abci', space: 'Highlights', summary: 'Space age', username: 'dnolen', created: 'Yesterday'},
          {id: 'abcj', space: 'Notes', summary: 'Wowzer', username: 'dpuppy', created: 'Yesterday'}
        ]
      });
      // otherwise just use dummy data
      this.myShiftsDatasource = new SSTableViewDatasource({
        data: [
          {id: 'cbch', space: 'Fisheye', summary: 'test', username: 'dnolen', href: 'www.tah.com', created: 'Yesterday'},
          {id: 'cbci', space: 'Fisheye', summary: 'oh man', username: 'dnolen', href: 'www.fah.com', created: 'Yesterday'},
          {id: 'cbcj', space: 'SourceShift', summary: 'test', username: 'dnolen', href: 'www.yah.com', created: 'Yesterday'}
        ]
      });
    }
  },
  
  
  handleLogin: function()
  {
    // update the datasource
    this.myShiftsDatasource.setProperty('username', ShiftSpace.User.getUsername());
    // switch to the tab view
    this.outlets().get('MainTabView').selectTabByName('ShiftsTabView');
  },
  
  
  handleLogout: function()
  {
    console.log('Handle logout!');
    //this.myShiftsDatasource.setProperty('username', null);
  },
  
  
  setAllShiftsTableView: function(tableView)
  {
    console.log('Fetch all shifts');
    this.allShiftsTableView = tableView;
    tableView.setDelegate(this);
    tableView.setDatasource(this.allShiftsDatasource);
    this.allShiftsDatasource.setProperties({href:"http://www.google.com/"});
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
    this.outlets().get('SSLoginFormSubmit').addEvent('click', function(_evt) {
      
      var evt = new Event(_evt);

      ShiftSpace.User.login({
        username: this.outlets().get('SSLoginFormUsername').getProperty('value'),
        password: this.outlets().get('SSLoginFormPassword').getProperty('value')
      });

    }.bind(this));
  },
  
  
  initSignUpForm: function()
  {
    this.outlets().get('SSSignUpFormSubmit').addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      var username = this.outlets().get('SSSignUpFormUsername').getProperty('value');
      var email = this.outlets().get('SSSignUpFormEmail').getProperty('value');
      var password = this.outlets().get('SSSignUpFormPassword').getProperty('value');
      var confirmPassword = this.outlets().get('SSSignUpFormPassword').getProperty('value');
      console.log('Sing up the user ' + username + ', ' + email + ', ' + password + ', ' + confirmPassword);
    }.bind(this));
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
  

  awake: function()
  {
    this.parent();
    
    // test setting outlets to controllers
    if(this.outlets().get('AllShiftsTableView')) this.setAllShiftsTableView(this.outlets().get('AllShiftsTableView'));
    if(this.outlets().get('MyShiftsTableView')) this.setMyShiftsTableView(this.outlets().get('MyShiftsTableView'));
    if(this.outlets().get('SSLoginFormSubmit')) this.initLoginForm();
    if(this.outlets().get('SSSignUpFormSubmit')) this.initSignUpForm();
    if(this.outlets().get('SSConsoleLoginOutButton')) this.initConsoleControls();
  },
  
  
  awakeDelayed: function()
  {
    // test outlets in iframes
    this.outlets().get('cool').addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      console.log('cool button clicked!');
    });
  },
  
  
  userSelectedRow: function(args)
  {
    
  },
  
  
  userDeselectedRow: function(args)
  {
    
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

// Add it the global UI class lookup
if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.SSConsole = SSConsole;
}