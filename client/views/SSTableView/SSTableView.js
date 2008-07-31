var SSTableView = new Class({
  
  name: 'SSTableView',
  
  Implements: Events,
  Extends: SSView,
  
  protocol: ['userClickedRow, userSelectedRow, itemForRowColumn, rowCount'],
  
  initialize: function(el, options)
  {
    this.parent(el);
    
    // for speed
    this.contentView = this.element._getElement('> .SSScrollView .SSContentView');
    // set the model row
    this.setModelRow(this.contentView._getElement('.SSModel'));
    // set the column names
    this.setColumnNames(this.element._getElements('> .SSScrollView .SSDefinition col').map(function(x) {return x.getProperty('name')}));
    // initialize the table header
    this.initTableHead();
    // create resize masks
    this.initColumnResizers();
    
    this.element.addEvent('click', this.eventDispatch.bind(this));
  },
  
  
  validateTable: function()
  {
    if(!this.contentView._getElement('> .SSDefinition'))
    {
      throw new SSException(new Error("SSTableView missing table definition, refer to documentation."), this);
    }
  },
  
  
  initTableHead: function()
  {
    var tableHead = this.element._getElement('> .SSControlView');
    if(!tableHead)
    {
      tableHead = new Element('div', {
        "class": "SSControlView"
      });
      tableHead.injectTop(this.element);
    }
    this.initColumnHeadings();
  },
  

  initColumnHeadings: function()
  {
    var model = this.element._getElement('> .SSControlView .SSModel');
    this.__columnHeadingModel__ = model.dispose();
    
    if(model)
    {
      var tableHead = this.element._getElement('> .SSControlView');
    
      // get the column names
      this.columnNames().length.times(function(idx) {
        // grab the column name
        var columnName = this.columnNames()[idx];
        // clone the heading
        var columnHeading = model.clone(true);
        // grab the column definition and set the heading width to it's dimensions
        var columnDefinition = this.columnDefinitionForIndex(idx);
        columnHeading.setStyle('width', columnDefinition.getProperty('width'));
        // put the proper column heading title in there
        columnHeading.getElement('span.SSColumnHeadingTitle').set('text', columnName.capitalize());
        // add it
        tableHead.grab(columnHeading);
      }.bind(this));
    }
    else
    {
      // hmm we really need a table head cell controller
    }
  },
  
  
  initColumnResizers: function()
  {
    var resizers = this.element._getElements('> .SSControlView .SSResize');
    var table = this.contentView;
    
    // setup the column resizers
    resizers.each(function(resizer) {
      resizer.getParent().makeResizable({
        handle:resizer, 
        modifiers:{x:'width', y:''},
        onStart: function()
        {
          resizer.addClass('SSActive');
          resizer.getParent().setStyle('cursor', 'col-resize');
          if(resizer.getParent().getNext()) resizer.getParent().getNext().setStyle('cursor', 'col-resize');
        },
        onComplete: function()
        {
          resizer.removeClass('SSActive');
          resizer.getParent().setStyle('cursor', '');
          if(resizer.getParent().getNext()) resizer.getParent().getNext().setStyle('cursor', '');
        }
      });
    });
    
    // make the columns resizer adjust the table as well
    resizers.length.times(function(idx) {
      resizer = resizers[idx];
      this.columnDefinitionForIndex(idx).makeResizable({
        handle: resizer,
        modifiers:{x:'width', y:''}
      });
      table.makeResizable({
        handle: resizer,
        modifiers:{x:'width', y:''}
      });
    }.bind(this));
  },
  
  
  eventDispatch: function(theEvent)
  {
    var evt = new Event(theEvent);
    var target = evt.target;
    
    switch(true)
    {
      case (this.hitTest(target, '> .SSControlView .SSResize') != null):
        // don't do anything for columing resizing
      break;
      
      case (this.hitTest(target, '> .SSControlView .SSColumnOrder') != null):
        // check first for column reordering
        this.handleColumnOrderHit(this.cachedHit());
      break;
      
      case (this.hitTest(target, '> .SSControlView .SSColumnHeading') != null):
        console.log('column hit test');
        // check next for column select
        this.handleColumnSelect(this.cachedHit());
      break;
      
      case (this.hitTest(target, '> .SSScrollView .SSContentView .SSRow .SSActionCell') != null):
        // if the click is an row action let them handle it
      break;
      
      case (this.hitTest(target, '> .SSScrollView .SSContentView .SSRow') != null):
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
    return this.contentView._getElement('> .SSDefinition col.SSActive');
  },
  
  
  selectedColumnIndex: function()
  {
    return this.contentView._getElements('> .SSDefinition col').indexOf(this.selectedColumn());
  },
  
  
  selectedRow: function()
  {
    return this.contentView._getElement('.SSRow.SSActive')
  },
  
  
  selectedRowIndex: function()
  {
    return this.contentView._getElements('.SSRow').indexOf(this.selectedRow());
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
    this.contentView._getElements(".SSRow")[idx].addClass('SSActive');
  },
  
  
  selectColumn: function(idx)
  {
    this.deselectAll();
    this.contentView._getElements("> .SSDefinition col")[idx].addClass('SSActive');
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
  
  
  columnDefinitionForIndex: function(idx)
  {
    return this.contentView._getElements('> .SSDefinition col')[idx];
  },
  
  
  columnIndexForNode: function(_node)
  {
    var node = (_node.hasClass('SSColumnHeading')) ? _node : _node.getParent('.SSColumnHeading');
    return this.element._getElements('> .SSControlView .SSColumnHeading').indexOf(node);
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
    return this.contentView._getElements('.SSRow').indexOf(row);
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
    if(this.modelRow().getParent())
    {
      this.modelRow().dispose();
    }

    var columnNames = this.columnNames();
    var newRow = this.modelRowClone();
    var controller = this.modelRowController();
    
    // Weird the node needs to be in the DOM for this shit to work
    // if after the following, it fails completely
    //this.contentView.getElement('tbody').grab(newRow);
    newRow.injectTop(this.contentView.getElement('tbody'));

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
    this.contentView.getElement('tbody').empty();

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