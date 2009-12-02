// ==Builder==
// @uiclass
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
    this.attachEvents();
  },


  attachEvents: function()
  {
    this.CreateGroupButton.addEvent("click", this.createGroup.bind(this));
  },

  
  createGroup: function()
  {
    var p = SSApp.create("group", formToHash(this.GroupForm));
    p.realize();
  }
});