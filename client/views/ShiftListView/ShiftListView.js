// ==Builder==
// @uiclass
// @optional
// @package           ShiftSpaceUI
// @dependencies      SSListView
// ==/Builder==

var ShiftListView = new Class({

  Extends: SSListView, 
  name: "ShiftListView",

  
  initialize: function(el, options)
  {
    this.parent(el, options);
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
    SSLog('onCreate ' + id, SSLogForce);
  }
  
});