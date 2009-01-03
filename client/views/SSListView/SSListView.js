// ==Builder==
// @uiclass
// @optional
// @name              SSListView
// @package           ShiftSpaceCoreUI
// @dependencies      SSView, SSCell
// ==/Builder==

// ==============
// = Exceptions =
// ==============

var SSListViewError = SSException;

SSListViewError.OutOfBounds = new Class({
  name:"SSListViewError.OutOfBounds",
  Extends: SSListViewError,
  Implements: SSExceptionPrinter
});

// ====================
// = Class Definition =
// ====================

var SSListView = new Class({
  name: "SSListView",
  
  Extends: SSView,
  
  defaults: function()
  {
    return $merge(this.parent(), {
      cell: null,
      reorderable: false
    });
  },
  

  initialize: function(el, options)
  {
    this.parent(el, options);
    this.initActions();
    this.setDataProvider([]);
    this.setCells([]);
    this.attachEvents();
  },
  
  
  attachEvents: function()
  {
    this.element.addEvent('click', this.eventDispatch.bindWithEvent(this, 'click'));
  },
  
  
  initActions: function()
  {
    if(this.options.actions && this.delegate())
    {
      console.log(this.options.actions);
      var actions = this.options.actions.map(function(x) {
        x.method = this.delegate()[x.method];
        return x;
      }.bind(this));
      this.setActions(actions);
    }
  },
  
  
  setDelegate: function(delegate)
  {
    this.parent(delegate);
    this.initActions();
  },
  
  
  eventDispatch: function(event, eventType)
  {
    console.log('eventDispatch');
  },
  
  
  setActions: function(actions)
  {
    this.__actions = actions;
    console.log(this.__actions);
  },
  
  
  getActions: function()
  {
    return this.__actions;
  },
  
  
  setDataProvider: function(dp)
  {
    this.__dataProvider = dp;
  },
  
  
  dataProvider: function()
  {
    return this.__dataProvider;
  },
  

  setCells: function(newCells)
  {
    this.__cells = newCells;
  },
  

  cells: function()
  {
    return this.__cells;
  },
  
  
  count: function()
  {
    return this.__cells.length;
  },
  
  
  cellForId: function(id)
  {
  },
  
  
  indexOfCell: function()
  {
    
  },
  
  
  indexOfCellById: function(id)
  {
    
  },
  

  addCell: function(cellData)
  {
  },
  

  insertCell: function(cellData, index)
  {
    
  },
  
  
  moveCell: function()
  {
    
  },
  

  removeCell: function(idx)
  {
    
  },
  
  
  canSelect: function(cell)
  {
    return true;
  },
  
  
  selectByNode: function(node)
  {
    console.log('selectByNode');
  },
  
  
  cellNodes: function()
  {
    return this.element.getElements("> .SSCell");
  },
  
  
  scrollLeft: function()
  {
    
  },
  
  
  scrollRight: function()
  {
    
  },
  
  
  refresh: function()
  {
    this.parent();
    // reload data
  }
  
});