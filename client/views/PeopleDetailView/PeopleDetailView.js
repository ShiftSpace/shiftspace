// ==Builder==
// @uiclass
// @package           ShiftSpaceUI
// @dependencies      SSView
// ==/Builder==

var PeopleDetailView = new Class({
  Extends: SSView,
  name: "PeopleDetailView",

  initialize: function(el, options)
  {
    this.parent(el, options);
  },


  awake: function()
  {
    
  },


  show: function()
  {
    SSLog("Fetch user details", SSLogForce);
  }
});

