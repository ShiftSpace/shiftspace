if(Sandalphon)
{
  Sandalphon.runTest = function()
  {
    var controller = $$('.SSTableView')[0].retrieve('__ssviewcontroller__');
    console.log(controller);
    // set the datasource for the tableview
    var datasource = new SSTableViewDatasource();
    controller.setDatasource(datasource);
  }
}