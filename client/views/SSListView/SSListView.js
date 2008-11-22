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
  

  initiialize: function(el, options)
  {
    this.parent(el, options);
  },
  

  setCells: function()
  {
    
  },
  

  cells: function()
  {
    
  },
  

  addCell: function()
  {
    
  },
  

  insertCell: function()
  {
    
  },
  

  removeCell: function(idx)
  {
    
  }
})