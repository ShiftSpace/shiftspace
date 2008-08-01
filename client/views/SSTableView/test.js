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
  
  intialize: function()
  {
    // set the datasource for the tableview
    this.datasource = new SSTableViewDatasource({
      dataNormalizer: legacyNormalizer
    });
  },
  
  
  setTableView: function(tableView)
  {
    tableView.setDelegate(this);
    tableView.setDatasource(this.datasource);
    this.datasource.fetch();
  },
  
  
  userClickedRow: function(rowIndex)
  {
    console.log('MyTableViewDelegate, userClickedRow: ' + rowIndex);
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
    // get the table view controller
    var controller = $$('.SSTableView')[0].retrieve('__ssviewcontroller__');
    // create table view delegate
    var delegate = new MyTableViewDelegate();
    // set up the delegate
    delegate.setTableView(controller);
  }
}