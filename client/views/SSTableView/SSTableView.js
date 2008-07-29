var SSTableView = new Class({
  
  Implements: Events,
  Extends: SSView,
  
  protocol: ['userClickedRow, userSelectedRow, itemForRowColumn, rowCount'],
  
  initialize: function(el, options)
  {
    this.parent(el);
    
    // set the model row
    this.setModelRow(this.element._getElement('> .SSContentView > .SSRow').clone(true));
    // set the column names
    this.setColumnNames(this.element._getElements('> .SSDefinition col').map(function(x) {return x.getProperty('name')}));
    
    this.element.addEvent('click', this.eventDispatch.bind(this));
  },
  
  
  eventDispatch: function(theEvent)
  {
    var evt = new Event(theEvent);
    var target = evt.target;
    
    switch(true)
    {
      case (this.hitTest(target, '> .SSControlView .SSColumnOrder') != null):
        this.handleColumnOrderHit(this.cachedHit());
      break;
      
      case (this.hitTest(target, '> .SSContentView .SSRow') != null):
        this.handleRowClick(this.cachedHit(), target);
      break;
      
      default:
      break;
    }
  },
  

  handleColumnOrderHit: function(orderButton)
  {
    console.log('column order ');
  },
  

  handleRowClick: function(row, target)
  {
    console.log('Row click ' + row);
    
    if(this.delegate())
    {
      this.delegate().userClickedRow({table:this, rowIndex:this.indexOf(row), target:target});
    }
  },
  
  
  indexOfRow: function(row)
  {
    this.element._getElements('> .SSContentView .SSRow').indexOf(row);
  },
  

  setDatasource: function(datasource)
  {
    console.log('SSTableView datasource set.');
    // remove the previous onload from the last datasource
    if(this.__datasource__)
    {
      this.__datasource__.removeEvent('onload');
    }
    this.__datasource__ = datasource;
    // listen for onload events on the new datasource
    datasource.addEvent('onload', this.refresh.bind(this));
  },
  

  datasource: function()
  {
    return this.__datasource__;
  },
  
  
  reload: function()
  {
    // reload from the server
    this.datasource().fetch();
  },

  
  setColumnNames: function(columnNames)
  {
    console.log('setColumnNames');
    console.log(columnNames);
    this.__columnNames__ = columnNames;
  },
  
  
  columnNames: function()
  {
    return this.__columnNames__;
  },
  
  
  addRow: function(data)
  {
    var columnNames = this.columnNames();
  },
  
  
  setModelRow: function(modelRow)
  {
    console.log('setModelRow');
    console.log(modelRow);
    this.__modelRow__ = modelRow;
  },
  
  
  modelRow: function()
  {
    this.__modelRow__;
  },
  
  
  refresh: function()
  {
    // empty the content view
    this.element._getElement('> .SSContentView').empty();

    // update the presentation
    var datasource = this.datasource();
    
    datasource.rowCount().times(function(n) {
      this.addRow(datasource.rowItemForIndex(n));
    }.bind(this));
  }

});

// add it to the UI object if possible
if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.SSTableView = SSTableView;
}