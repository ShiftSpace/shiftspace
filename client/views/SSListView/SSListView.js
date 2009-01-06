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
  },
  
  
  awake: function(context)
  {
    this.setCell(SSControllerForNode(this.element.getElement('> .SSCell')));
  },
  
  
  setCell: function(cell)
  {
    this.__cell = cell;
    cell.setDelegate(this);
    cell.element.dispose();
  },
  
  
  cell: function()
  {
    return this.__cell;
  },
  
  
  setData: function(newData)
  {
    this.__data = newData;
    
    if(newData.addView)
    {
      newData.addView(this);
    }
    
    this.refresh();
  },
  
  
  length: function()
  {
    if($type(this.data().length) == 'function') return this.data().length();
    return this.data().length;
  },
  
  
  data: function()
  {
    return this.__data;
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
  

  add: function(cellData)
  {
  },
  
  
  edit: function()
  {
    
  },
  

  insert: function(cellData, index)
  {
    
  },
  
  
  move: function()
  {
    
  },
  
  
  swap: function()
  {
    
  },
  
  
  remove: function(idx)
  {
    
  },
  
  
  canSelect: function(cell)
  {
    return true;
  },
  
  
  selectByNode: function(node)
  {
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
    
    this.element.empty();
    
    if(this.data().length > 0)
    {
      this.data().each(function(x) {
        this.element.grab(this.cell().cloneWithData(x));
      }.bind(this));
    }
  }
  
});