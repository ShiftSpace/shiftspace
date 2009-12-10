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

    SSAddObserver(this, "onUserLogin", this.onUserLogin.bind(this));
    SSAddObserver(this, "onUserJoin", this.onUserLogin.bind(this));
  },


  hide: function()
  {
    this.parent();
    SSPostNotification("onGroupsPaneHide", this);
  },


  awake: function()
  {
    this.mapOutletsToThis();
    this.attachEvents();
    [this.GroupsListView].each(function(lv) {
      lv.addEvent("onRowClick", this.handleRowClick.bind(this));
    }, this);
  },


  handleRowClick: function(evt)
  {
    SSPostNotification("onShowGroup", evt.data);
  },


  attachEvents: function()
  {
    this.GroupsTabView.addEvent("tabSelected", this.onTabSelect.bind(this));
  },


  onTabSelect: function(evt)
  {
    if(evt.tabIndex == 2)
    {
      SSPostNotification("onCreateGroup");
    }
  },


  onUserLogin: function()
  {
    SSTableForName("Groups").addView(this.GroupsListView);
  }

});