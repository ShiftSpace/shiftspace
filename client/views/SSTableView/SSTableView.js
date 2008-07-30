var SSTableView = new Class({
  
  Implements: Events,
  Extends: SSView,
  
  protocol: ['userClickedRow, userSelectedRow, itemForRowColumn, rowCount'],
  
  initialize: function(el, options)
  {
    this.parent(el);
    
    // for speed
    this.contentView = this.element._getElement('> .SSContentView');
    // set the model row
    this.setModelRow(this.element._getElement('> .SSContentView > .SSModel').dispose());
    // set the column names
    this.setColumnNames(this.element._getElements('> .SSDefinition col').map(function(x) {return x.getProperty('name')}));
    // create resize masks
    this.createColumnResizers();
    
    this.element.addEvent('click', this.eventDispatch.bind(this));
  },
  
  
  createColumnResizers: function()
  {
    var resizers = this.element._getElements('> .SSControlView .SSResize');
    resizers.each(function(resizer) {
      resizer.getParent().makeResizable({
        handle:resizer, 
        modifiers:{x:'width', y:''},
        onStart: function()
        {
          resizer.addClass('SSActive');
        },
        onComplete: function()
        {
          resizer.removeClass('SSActive');
        }
      });
    });
  },
  
  
  eventDispatch: function(theEvent)
  {
    var evt = new Event(theEvent);
    var target = evt.target;
    
    switch(true)
    {
      case (this.hitTest(target, '> .SSControlView .SSResize') != null):
      break;
      
      case (this.hitTest(target, '> .SSControlView .SSColumnOrder') != null):
        // check first for column reordering
        this.handleColumnOrderHit(this.cachedHit());
      break;
      
      case (this.hitTest(target, '> .SSControlView .SSColumnHeading') != null):
        // check next for column select
        this.handleColumnSelect(this.cachedHit());
      break;
      
      case (this.hitTest(target, '> .SSContentView .SSRow .SSActionCell') != null):
        // if the click is an row action let them handle it
      break;
      
      case (this.hitTest(target, '> .SSContentView .SSRow') != null):
        // finally check for general row click
        this.handleRowClick(this.cachedHit(), target);
      break;
      
      default:
      break;
    }
  },
  

  handleColumnOrderHit: function(orderButton)
  {
    var index = this.columnIndexForNode(orderButton);
    console.log('column order change for ' + this.columnNames()[index]);
  },
  
  
  handleColumnSelect: function(column)
  {
    var index = this.columnIndexForNode(column);
    console.log('column select ' + this.columnNames()[index]);
    if(index == this.selectedColumnIndex())
    {
      this.deselectAll();
    }
    else
    {
      this.selectColumn(index);      
    }
  },
  
  
  selectedColumn: function()
  {
    return this.element._getElement('> .SSDefinition col.SSActive');
  },
  
  
  selectedColumnIndex: function()
  {
    return this.element._getElements('> .SSDefinition col').indexOf(this.selectedColumn());
  },
  
  
  selectedRow: function()
  {
    return this.element._getElement('> .SSContentView .SSRow.SSActive')
  },
  
  
  selectedRowIndex: function()
  {
    return this.element._getElements('> SSContentView .SSRow').indexOf(this.selectedRow());
  },
  
  
  deselectRow: function(row)
  {
    row.removeClass('SSActive');
  },
  
  
  deselectColumn: function(col)
  {
    var idx = this.selectedColumnIndex();
    col.removeClass('SSActive');
    this.columnHeadingForIndex(idx).removeClass('SSActive');
  },
  
  
  selectRow: function(idx)
  {
    this.deselectAll();
    this.element._getElements("> .SSContentView .SSRow")[idx].addClass('SSActive');
  },
  
  
  selectColumn: function(idx)
  {
    this.deselectAll();
    this.element._getElements("> .SSDefinition col")[idx].addClass('SSActive');
    this.columnHeadingForIndex(idx).addClass('SSActive');
  },
  
  
  deselectAll: function()
  {
    if(this.selectedRow()) this.deselectRow(this.selectedRow());
    if(this.selectedColumn()) this.deselectColumn(this.selectedColumn());
  },
  
  
  columnHeadingForIndex: function(idx)
  {
    return this.element._getElements('> .SSControlView .SSColumnHeading')[idx];
  },
  
  
  columnIndexForNode: function(_node)
  {
    var node = (_node.hasClass('SSColumnHeading')) ? _node : _node.getParent('.SSColumnHeading');
    return this.element._getElements('> .SSControlView > tr > th').indexOf(node);
  },
  
  
  handleRowClick: function(row, target)
  {
    var rowIndex = this.indexOfRow(row);
    console.log('Row click ' + rowIndex);

    if(row == this.selectedRow())
    {
      this.deselectAll();
    }
    else
    {
      this.selectRow(rowIndex);      
    }

    if(this.delegate())
    {
      this.delegate().userClickedRow({tableView:this, rowIndex:rowIndex, target:target});
    }
  },
  
  
  indexOfRow: function(row)
  {
    return this.element._getElements('> .SSContentView .SSRow').indexOf(row);
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
    var newRow = this.modelRowClone();
    var controller = this.modelRowController();
    
    // Weird the node needs to be in the DOM for this shit to work
    // if after the following, it fails completely
    this.contentView.grab(newRow);

    for(var i=0; i < columnNames.length; i++)
    {
      var columnName = columnNames[i];
      
      if(!controller)
      {
        newRow._getElement('> td[name='+columnName+']').set('text', data[columnName]);
      }
      else
      {
        controller.setProperty(newRow, columnName, data[columnName]);
      }
    }
  },
  
  
  setModelRow: function(modelRow)
  {
    this.__modelRow__ = modelRow;
  },
  
  
  modelRow: function()
  {
    return this.__modelRow__;
  },


  modelRowController: function()
  {
    return this.controllerForNode(this.modelRow());
  },
  
  
  modelRowClone: function()
  {
    return $(this.modelRow().clone(true));
  },
  
  
  refresh: function()
  {
    // empty the content view
    this.element._getElement('> .SSContentView').empty();

    // update the presentation
    var datasource = this.datasource();
    
    datasource.rowCount().times(function(n) {
      this.addRow(datasource.rowForIndex(n));
    }.bind(this));
  }

});

// add it to the UI object if possible
if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.SSTableView = SSTableView;
}