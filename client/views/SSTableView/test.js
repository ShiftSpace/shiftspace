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
      this.datasource = new SSTableViewDatasource({
        dataKey: 'shifts',
        dataProviderURL: 'http://metatron.shiftspace.org/dev/shiftspace.php?method=shift.query',
        dataNormalizer: legacyNormalizer
      });
    }
    else
    {
      // otherwise just use dummy data
      this.datasource = new SSTableViewDatasource({
        data: [
          {space: 'Notes', summary: 'Hello', username: 'dnolen', created: 'Yesterday'},
          {space: 'Highlights', summary: 'Cool', username: 'mushon', created: 'Yesterday'},
          {space: 'SourceShift', summary: 'ARGH', username: 'dnolen', created: 'Yesterday'},
          {space: 'Notes', summary: 'Yup', username: 'dphiffer', created: 'Yesterday'},
          {space: 'ImageSwap', summary: 'Wow', username: 'dphiffer', created: 'Yesterday'},
          {space: 'Notes', summary: 'Amazing', username: 'doron', created: 'Yesterday'},
          {space: 'Notes', summary: 'Monkeys and a bunch of other apes', username: 'doron', created: 'Yesterday'},
          {space: 'Notes', summary: 'Junk', username: 'tester', created: 'Yesterday'},
          {space: 'Highlights', summary: 'Space age', username: 'dnolen', created: 'Yesterday'},
          {space: 'Notes', summary: 'Wowzer', username: 'dpuppy', created: 'Yesterday'}
        ]
      });
    }
  },
  
  
  setTableView: function(tableView)
  {
    this.tableView = tableView;
    tableView.setDelegate(this);
    tableView.setDatasource(this.datasource);
    this.datasource.fetch();
  },
  
  
  userClickedRow: function(args)
  {
    console.log('MyTableViewDelegate, userClickedRow: ' + args.rowIndex);
    if(args.tableView == this.tableView)
    {
      console.log('id of shift ' + this.datasource.data()[args.rowIndex].id);
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
    var controller = $$('.SSTableView')[0].retrieve('__ssviewcontroller__');
    // create table view delegate
    var delegate = new MyTableViewDelegate();
    // set up the delegate
    delegate.setTableView(controller);
  }
}