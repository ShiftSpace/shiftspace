if(Sandalphon)
{
  Sandalphon.runTest = function()
  {
    var controller = $$('.SSTableView')[0].retrieve('__ssviewcontroller__');
    console.log(controller);
    
    // set the datasource for the tableview
    var datasource = new SSTableViewDatasource({
      dataNormalizer: 
      {
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
        }
      }
    });
    
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