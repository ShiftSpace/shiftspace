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
    this.GroupsTabView.addEvent("tabSelected", this.onTabSelect.bind(this));
  },


  onTabSelect: function(evt)
  {
    if(evt.tabIndex == 2)
    {
      SSLog("create group!", SSLogForce);
      SSPostNotification("onCreateGroup");
    }
  }

});