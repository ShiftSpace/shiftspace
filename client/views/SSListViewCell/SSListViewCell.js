// ==Builder==
// @uiclass
// @optional
// @package           ShiftSpaceCoreUI
// @dependencies      SSView
// ==/Builder==

var SSListViewCell = new Class({

  Extends: SSCell,

  name: "SSListViewCell",

  initialize: function(el, options)
  {
    this.parent(el, options);
  }

});

if(typeof ShiftSpaceUI != "undefined")
{
  ShiftSpaceUI.SSListViewCell = SSListViewCell;
}