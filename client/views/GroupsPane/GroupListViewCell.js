// ==Builder==
// @uiclass
// @package           ShiftSpaceUI
// @dependencies      SSListViewCell
// ==/Builder==

var GroupListViewCell = new Class({

  Extends: SSListViewCell,
  name: "GroupListViewCell",


  initialize: function(el, options)
  {
    this.parent(el, options);
  },


  setShortName: function(shortName)
  {
    var el = this.lockedElement();
    el.getElement('.shortName').setProperty("src", shortName);
  },


  setLongName: function(longName)
  {
    var el = this.lockedElement();
    el.getElement(".longName").set("text", longName);
  }

});
