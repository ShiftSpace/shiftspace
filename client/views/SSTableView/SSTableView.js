var SSTableView = new Class({
  
  Extends: SSView,
  
  protocol: ['userClickedRow, userSelectedRow, itemForRowColumn, rowCount'],
  
  initialize: function(el, options)
  {
    this.parent(el);
    
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
    this.__datasource__ = datasource;
  },
  

  datasource: function()
  {
    return this.__datasource__;
  },
  
  
  refresh: function()
  {
    // update from the datasource
  }

});

// add it to the UI object if possible
if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.SSTableView = SSTableView;
}