// ==Builder==
// @uiclass
// @optional
// @name              SSListView
// @package           ShiftSpaceCoreUI
// @dependencies      SSView, SSCell
// ==/Builder==

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
    this.setCells([]);
  },
  

  setCells: function(newCells)
  {
    this.__cells = newCells;
  },
  

  cells: function()
  {
    return this.__cells;
  },
  

  addCell: function(cellData)
  {
  },
  

  insertCell: function()
  {
    
  },
  

  removeCell: function(idx)
  {
    
  }
})