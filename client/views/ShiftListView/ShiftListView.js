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
  
  
  onRowClick: function(idx)
  {
    SSLog('onRowClick ' + idx, SSLogForce);
    SSLog(this.data()[idx], SSLogForce);
    SSShowShift(this.data()[idx]._id);
  }
  
});