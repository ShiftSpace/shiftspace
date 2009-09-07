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
  }
  
});