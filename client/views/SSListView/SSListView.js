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
    this.setDataProvider([]);
    this.setCells([]);
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
  }
});