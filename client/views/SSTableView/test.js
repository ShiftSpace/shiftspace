if(Sandalphon)
{
  Sandalphon.runTest = function()
  {
    var controller = $$('.SSTableView')[0].retrieve('__ssviewcontroller__');
    console.log(controller);
    // set the datasource for the tableview
    var datasource = new SSTableViewDatasource();
    controller.setDatasource(datasource);
    
    // load real data
    datasource.fetch();
    datasource.fireEvent('onload');
  }
}

var MyTableViewDelegate = new Class({
  canSelectColumn: function(column)
  {
    return true;
  },
  
  canSelectRow: function(column)
  {
    return true;
  }
});