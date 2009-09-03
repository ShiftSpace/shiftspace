// ==Builder==
// @uiclass
// @customView
// @optional
// @package           ShiftSpaceUI
// @dependencies      SSView
// ==/Builder==

var InboxPane = new Class({

  Extends: SSView,
  name: "InboxPane",

  initialize: function(el, options)
  {
    this.parent(el, options);
  },


  awake: function()
  {
    this.mapOutletsToThis();
  }
});