// ==Builder==
// @uiclass
// @optional
// @package           ShiftSpaceUI
// @dependencies      SSListView
// ==/Builder==

var ShiftListView = new Class({

  Extends: SSListView, 
  name: "ShiftListView",
  
  
  defaults: function()
  {
    return $merge(this.parent(), {
      byHref: true,
      byDomain: false,
      byFollowing: false,
      byGroups: false
    });
  },

  
  initialize: function(el, options)
  {
    this.parent(el, options);
  },
  
  
  willShow: function()
  {
    SSPostNotification("onShiftListViewShow", {listView:this});
  },


  willHide: function()
  {
    SSPostNotification("onShiftListViewHide", {listView:this});
  },
  
  
  onRowSelect: function(idx)
  {
    this.parent(idx);
    var shift = this.data()[idx];
    SSShowShift(SSSpaceForName(shift.space.name), shift);
  },
  

  onRowDeselect: function(idx)
  {
    var shift = this.data()[idx];
    SSHideShift(SSSpaceForName(shift.space.name), shift);
  },
  
  
  onCreate: function(id)
  {
    this.refresh();
  },
  

  onDelete: function(ack)
  {
    this.refresh();
  },


  
  checkedItemIndices: function()
  {
    var indices = [];
    this.cellNodes().each(function(el, i) {
      if(el.getElement('input[type=checkbox]').getProperty("checked")) indices.push(i);
    });
    return indices
  },


  checkedItems: function()
  {
    return this.checkedItemIndices().map(this.data().asFn());
  },


  checkedItemIds: function()
  {
    return this.checkedItemIndices().map(Function.comp(this.data().asFn(), $acc("_id")));
  }
});