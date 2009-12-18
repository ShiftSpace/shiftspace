// ==Builder==
// @uiclass
// @package           ShiftSpaceUI
// @dependencies      SSView
// ==/Builder==

var SSFilter = new Class({

  Extends: SSView,
  name: "SSFilter",

  initialize: function(el, options)
  {
    this.parent(el, options);
    SSAddObserver(this, "onShiftListViewShow", this.onShiftListViewShow.bind(this));
    SSAddObserver(this, "onShiftListViewHide", this.onShiftListViewHide.bind(this));
  },
  
  
  onShiftListViewShow: function(evt)
  {
  },


  onShiftListViewHide: function(evt)
  {
  }

});