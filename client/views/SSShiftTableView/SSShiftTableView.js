// ==Builder==
// @uiclass
// @customView
// @optional
// @package           ShiftSpaceUI
// @dependencies      SSTableView
// ==/Builder==

var SShiftTableView = new Class({

  Extends: SSTableView,
  name: "SShiftTableView",

  initialize: function(el, options)
  {
    this.parent(el, options);
  },
  
  checkedRows: function()
  {
    return this.contentView.getElements('.SSRow input:checked');
  }

});