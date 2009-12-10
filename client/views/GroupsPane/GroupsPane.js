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
    this.GroupsTabView.addEvent("tabSelected", this.onTabSelect.bind(this));
  },


  onTabSelect: function(evt)
  {
    if(evt.tabIndex == 2)
    {
      SSPostNotification("onCreateGroup");
    }
  },

  
  createGroup: function()
  {
    var p = SSApp.create("group", formToHash(this.GroupForm));
    p.realize();
  }
});