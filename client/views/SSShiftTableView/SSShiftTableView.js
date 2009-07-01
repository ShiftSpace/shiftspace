// ==Builder==
// @uiclass
// @customView
// @optional
// @package           ShiftSpaceUI
// @dependencies      SSTableView
// ==/Builder==

var SSShiftTableView = new Class({

  Extends: SSTableView,
  name: "SSShiftTableView",


  initialize: function(el, options)
  {
    this.parent(el, options);
  },
  

  checkedRows: function()
  {
    return this.contentView.getElements('.SSRow input:checked');
  },
  

  checkedShifts: function()
  {
    return this.element.getElements('.SSRow input.SSSelectShift[checked]').getParent('.SSRow').map(this.indexOfRow.bind(this));
  }

});