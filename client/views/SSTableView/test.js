if(Sandalphon)
{
  Sandalphon.runTest = function()
  {
    var controller = $$('.SSTableView').retrieve('__ssviewcontroller__');
    
    // set the datasource for the tableview
    var datasource = new SSTableViewDatasource();
    controller.setDatasource(datasource);
  }
}

