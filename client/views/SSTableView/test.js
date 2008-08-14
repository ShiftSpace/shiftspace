var legacyNormalizer = {
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
};

var MyTableViewDelegate = new Class({
  
  initialize: function()
  {
    // set the datasource for the tableview
    if(window.location.hostname == "www.shiftspace.org" ||
       window.location.hostname == "metatron.shiftspace.org")
    {
      // if we're on metatron load real data
      this.allShiftsDatasource = new SSTableViewDatasource({
        dataKey: 'shifts',
        dataProviderURL: 'http://metatron.shiftspace.org/dev/shiftspace.php?method=shift.query',
        dataNormalizer: legacyNormalizer
      });
      // if we're on metatron load real data
      this.myShiftsDatasource = new SSTableViewDatasource({
        dataKey: 'shifts',
        dataProviderURL: 'http://metatron.shiftspace.org/dev/shiftspace.php?method=shift.query&username=dnolen',
        dataNormalizer: legacyNormalizer
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
    this.allShiftsTableView = tableView;
    tableView.setDelegate(this);
    tableView.setDatasource(this.allShiftsDatasource);
    htis.allShiftsDatasource.setProperties({href:"http://www.google.com/"});
    this.allShiftsDatasource.fetch();
  },
  
  
  setMyShiftsTableView: function(tableView)
  {
    this.myShiftsTableView = tableView;
    tableView.setDelegate(this);
    tableView.setDatasource(this.myShiftsDatasource);
    this.myShiftsDatasource.fetch();
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
  
  
  canSelectRow: function(rowIndex)
  {
    
  },
  
  
  canSelectColumn: function(columnIndex)
  {
    
  }
  
});

if(Sandalphon)
{
  Sandalphon.runTest = function()
  {
    console.log('running test!');
    
    // get the table view controller
    var allShiftsTableViewController = $$('.SSTableView')[0].retrieve('__ssviewcontroller__');
    var myShiftsTableViewController = $$('.SSTableView')[1].retrieve('__ssviewcontroller__');

    // create table view delegate
    var delegate = new MyTableViewDelegate();
    // set up the delegate
    delegate.setAllShiftsTableView(allShiftsTableViewController);
    delegate.setMyShiftsTableView(myShiftsTableViewController);
  }
}