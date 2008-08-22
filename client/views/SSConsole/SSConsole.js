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
          {id: 'abca', space: 'Notes', summary: 'Hello', username: 'dnolen', created: 'Yesterday'},
          {id: 'abcb', space: 'Highlights', summary: 'Cool', username: 'mushon', created: 'Yesterday'},
          {id: 'abcc', space: 'SourceShift', summary: 'ARGH', username: 'dnolen', created: 'Yesterday'},
          {id: 'abcd', space: 'Notes', summary: 'Yup', username: 'dphiffer', created: 'Yesterday'},
          {id: 'abce', space: 'ImageSwap', summary: 'Wow', username: 'dphiffer', created: 'Yesterday'},
          {id: 'abcf', space: 'Notes', summary: 'Amazing', username: 'doron', created: 'Yesterday'},
          {id: 'abcg', space: 'Notes', summary: 'Monkeys and a bunch of other apes', username: 'doron', created: 'Yesterday'},
          {id: 'abch', space: 'Notes', summary: 'Junk', username: 'tester', created: 'Yesterday'},
          {id: 'abci', space: 'Highlights', summary: 'Space age', username: 'dnolen', created: 'Yesterday'},
          {id: 'abcj', space: 'Notes', summary: 'Wowzer', username: 'dpuppy', created: 'Yesterday'}
        ]
      });
      // otherwise just use dummy data
      this.myShiftsDatasource = new SSTableViewDatasource({
        data: [
          {id: 'cbca', space: 'Cutups', summary: 'Hello', username: 'dnolen', href: 'www.blah.com', created: 'Yesterday'},
          {id: 'cbcb', space: 'Cutups', summary: 'Hello world', username: 'dnolen', href: 'www.wah.com', created: 'Yesterday'},
          {id: 'cbcc', space: 'SourceShift', summary: 'test', username: 'dnolen', href: 'www.vah.com', created: 'Yesterday'},
          {id: 'cbcd', space: 'Notes', summary: 'No!', username: 'dnolen', href: 'www.nah.com', created: 'Yesterday'},
          {id: 'cbce', space: 'ImageSwap', summary: 'test', username: 'dnolen', href: 'www.jah.com', created: 'Yesterday'},
          {id: 'cbcf', space: 'ImageSwap', summary: 'argh', username: 'dnolen', href: 'www.gah.com', created: 'Yesterday'},
          {id: 'cbcg', space: 'Highlights', summary: 'bugz', username: 'doron', href: 'www.lah.com', created: 'Yesterday'},
          {id: 'cbch', space: 'Fisheye', summary: 'test', username: 'dnolen', href: 'www.tah.com', created: 'Yesterday'},
          {id: 'cbci', space: 'Fisheye', summary: 'oh man', username: 'dnolen', href: 'www.fah.com', created: 'Yesterday'},
          {id: 'cbcj', space: 'SourceShift', summary: 'test', username: 'dnolen', href: 'www.yah.com', created: 'Yesterday'}
        ]
      });
    }
  },
  
  
  setAllShiftsTableView: function(tableView)
  {
    console.log('Fetch all shifts');
    this.allShiftsTableView = tableView;
    //tableView.setDelegate(this);
    tableView.setDatasource(this.allShiftsDatasource);
    this.allShiftsDatasource.setProperties({href:"http://www.google.com/"});
    console.log(this.allShiftsDatasource);
    this.allShiftsDatasource.fetch();
  },
  
  
  setMyShiftsTableView: function(tableView)
  {
    console.log('Fetch my shifts');
    this.myShiftsTableView = tableView;
    //tableView.setDelegate(this);
    tableView.setDatasource(this.myShiftsDatasource);
    console.log(this.myShiftsDatasource);
    this.myShiftsDatasource.fetch();
  },
  

  awake: function()
  {
    this.parent();
    
    // test setting outlets to controllers
    if(this.outlets().get('AllShiftsTableView'))
    {
      this.setAllShiftsTableView(this.outlets().get('AllShiftsTableView'));
    }
    
    if(this.outlets().get('MyShiftsTableView'))
    {
      this.setMyShiftsTableView(this.outlets().get('MyShiftsTableView'));
    }
    
    // test login form outlet
    if(this.outlets().get('SSLoginFormSubmit'))
    {
      this.outlets().get('SSLoginFormSubmit').addEvent('click', function(_evt) {
        
        var evt = new Event(_evt);
        var username = this.outlets().get('SSLoginFormUsername').getProperty('value');
        var password = this.outlets().get('SSLoginFormPassword').getProperty('value');

        console.log('Login the user ' + username + ', ' + password);

        var credentials = {
          username: username,
          password: password
        };

        new Request({
          type: 'post',
          url: __ssserver__ + '/dev/shiftspace.php?method=user.login',
          data: credentials,
          onComplete: function(responseText, reponseXml)
          {
            console.log('Logged in!');
            this.myShiftsDatasource.setProperty('username', username);
          }.bind(this),
          onFailure: function()
          {
            console.error('Oops login failed!');
          }.bind(this)
        }).send();
        
      }.bind(this));
    }
    
    // test login form outlet
    if(this.outlets().get('SSSignUpFormSubmit'))
    {
      this.outlets().get('SSSignUpFormSubmit').addEvent('click', function(_evt) {
        var evt = new Event(_evt);
        var username = this.outlets().get('SSSignUpFormUsername').getProperty('value');
        var email = this.outlets().get('SSSignUpFormEmail').getProperty('value');
        var password = this.outlets().get('SSSignUpFormPassword').getProperty('value');
        var confirmPassword = this.outlets().get('SSSignUpFormPassword').getProperty('value');
        console.log('Sing up the user ' + username + ', ' + email + ', ' + password + ', ' + confirmPassword);
      }.bind(this));
    }
  },
  
  
  awakeDelayed: function()
  {
    // test outlets in iframes
    this.outlets().get('cool').addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      console.log('cool button clicked!');
    });
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
    
  }
  
});

// Add it the global UI class lookup
if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.SSConsole = SSConsole;
}