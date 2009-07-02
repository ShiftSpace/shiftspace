// ==Builder==
// @uiclass
// @customView
// @optional
// @package           ShiftSpaceUI
// @dependencies      SSView
// ==/Builder==

var GroupsPane = new Class({

  Extends: SSView,
  name: "GroupsPane",


  initialize: function(el, options)
  {
    this.parent(el, options);
  },


  awake: function()
  {
    this.mapOutletsToThis();
  }

});