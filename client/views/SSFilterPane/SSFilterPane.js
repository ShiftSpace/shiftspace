// ==Builder==
// @uiclass
// @customView
// @optional
// @package           ShiftSpaceUI
// @dependencies      SSView
// ==/Builder==

var SSFilterPane = new Class({

  Extends: SSView,
  name: "SSFilterPane",

  initialize: function(el, options)
  {
    this.parent(el, options);
    SSAddObserver(this, "onShiftListViewShow", this.onShiftListViewShow.bind(this));
    SSAddObserver(this, "onShiftListViewHide", this.onShiftListViewHide.bind(this));
  },
  
  
  onShiftListViewShow: function(evt)
  {
    if(evt.listView.getName() == "AllShiftsListView")
    {
      this.show();
    }
    else
    {
      this.hide();
    }
  },


  onShiftListViewHide: function(evt)
  {
    if(evt.listView.getName() == "AllShiftsListView")
    {
      this.hide();
    }
  },

  
  optionsForTable: function(resource)
  {
    return {byHref:window.location.href.split("#")[0]};
  }
});