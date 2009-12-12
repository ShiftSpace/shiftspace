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
    el.getElement('.shortName').setProperty("text", shortName);
  },


  setLongName: function(longName)
  {
    var el = this.lockedElement();
    el.getElement(".longName").set("text", longName);
  },


  setLevel: function(level)
  {
    var el = this.lockedElement();
    if(level > 2)
    {
      el.getElement(".settings").removeClass("SSDisplayNone");
    }
    else
    {
      el.getElement(".settings").addClass("SSDisplayNone");
    }
  }

});
