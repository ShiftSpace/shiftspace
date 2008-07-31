if(Sandalphon)
{
  Sandalphon.runTest = function()
  {
    var controller = $$('.SSTableView')[0].retrieve('__ssviewcontroller__');
    console.log(controller);
    // set the datasource for the tableview
    var datasource = new SSTableViewDatasource();
    controller.setDatasource(datasource);
    
    // test adding new data
    datasource.setData([
      {space:'SourceShift', username:'mushon', summary:'A cool shift. A cool shift. A cool shift. A cool shift. A cool shift.', created:'2 hours ago.'},
      {space:'Highlights', username:'avital', summary:'A cooler shift.', created:'10 hours ago.'},
      {space:'SourceShift', username:'mushon', summary:'A cool shift. A cool shift. A cool shift. A cool shift. A cool shift.', created:'2 hours ago.'},
      {space:'Highlights', username:'avital', summary:'A cooler shift.', created:'10 hours ago.'},
      {space:'SourceShift', username:'mushon', summary:'A cool shift. A cool shift. A cool shift. A cool shift. A cool shift.', created:'2 hours ago.'},
      {space:'Highlights', username:'avital', summary:'A cooler shift.', created:'10 hours ago.'},
      {space:'SourceShift', username:'mushon', summary:'A cool shift. A cool shift. A cool shift. A cool shift. A cool shift.', created:'2 hours ago.'},
      {space:'Highlights', username:'avital', summary:'A cooler shift.', created:'10 hours ago.'},
      {space:'SourceShift', username:'mushon', summary:'A cool shift. A cool shift. A cool shift. A cool shift. A cool shift.', created:'2 hours ago.'},
      {space:'SourceShift', username:'mushon', summary:'A cool shift. A cool shift. A cool shift. A cool shift. A cool shift.', created:'2 hours ago.'},
      {space:'Highlights', username:'avital', summary:'A cooler shift.', created:'10 hours ago.'},
      {space:'SourceShift', username:'mushon', summary:'A cool shift. A cool shift. A cool shift. A cool shift. A cool shift.', created:'2 hours ago.'},
      {space:'Highlights', username:'avital', summary:'A cooler shift.', created:'10 hours ago.'},
      {space:'SourceShift', username:'mushon', summary:'A cool shift. A cool shift. A cool shift. A cool shift. A cool shift.', created:'2 hours ago.'},
      {space:'Highlights', username:'avital', summary:'A cooler shift.', created:'10 hours ago.'},
      {space:'SourceShift', username:'mushon', summary:'A cool shift. A cool shift. A cool shift. A cool shift. A cool shift.', created:'2 hours ago.'},
      {space:'Highlights', username:'avital', summary:'A cooler shift.', created:'10 hours ago.'},
      {space:'SourceShift', username:'mushon', summary:'A cool shift. A cool shift. A cool shift. A cool shift. A cool shift.', created:'2 hours ago.'},
      {space:'SourceShift', username:'mushon', summary:'A cool shift. A cool shift. A cool shift. A cool shift. A cool shift.', created:'2 hours ago.'},
      {space:'Highlights', username:'avital', summary:'A cooler shift.', created:'10 hours ago.'},
      {space:'SourceShift', username:'mushon', summary:'A cool shift. A cool shift. A cool shift. A cool shift. A cool shift.', created:'2 hours ago.'},
      {space:'Highlights', username:'avital', summary:'A cooler shift.', created:'10 hours ago.'},
      {space:'SourceShift', username:'mushon', summary:'A cool shift. A cool shift. A cool shift. A cool shift. A cool shift.', created:'2 hours ago.'},
      {space:'Highlights', username:'avital', summary:'A cooler shift.', created:'10 hours ago.'},
      {space:'SourceShift', username:'mushon', summary:'A cool shift. A cool shift. A cool shift. A cool shift. A cool shift.', created:'2 hours ago.'},
      {space:'Highlights', username:'avital', summary:'A cooler shift.', created:'10 hours ago.'},
      {space:'SourceShift', username:'mushon', summary:'A cool shift. A cool shift. A cool shift. A cool shift. A cool shift.', created:'2 hours ago.'},
      {space:'SourceShift', username:'mushon', summary:'A cool shift. A cool shift. A cool shift. A cool shift. A cool shift.', created:'2 hours ago.'},
      {space:'Highlights', username:'avital', summary:'A cooler shift.', created:'10 hours ago.'},
      {space:'SourceShift', username:'mushon', summary:'A cool shift. A cool shift. A cool shift. A cool shift. A cool shift.', created:'2 hours ago.'},
      {space:'Highlights', username:'avital', summary:'A cooler shift.', created:'10 hours ago.'},
      {space:'SourceShift', username:'mushon', summary:'A cool shift. A cool shift. A cool shift. A cool shift. A cool shift.', created:'2 hours ago.'},
      {space:'Highlights', username:'avital', summary:'A cooler shift.', created:'10 hours ago.'},
      {space:'SourceShift', username:'mushon', summary:'A cool shift. A cool shift. A cool shift. A cool shift. A cool shift.', created:'2 hours ago.'},
      {space:'Highlights', username:'avital', summary:'A cooler shift.', created:'10 hours ago.'},
      {space:'SourceShift', username:'mushon', summary:'A cool shift. A cool shift. A cool shift. A cool shift. A cool shift.', created:'2 hours ago.'}
    ]);

    //datasource.fetch();
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