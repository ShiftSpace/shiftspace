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

    SSAddObserver(this, "onUserLogin", this.initListViews.bind(this));
    SSAddObserver(this, "onUserJoin", this.initListViews.bind(this));
  },


  show: function()
  {
    if(!this.__listViewsInitialized) this.initListViews();
    this.parent();
  },


  hide: function()
  {
    this.parent();
    this.__addUserMode = false;
    SSPostNotification("onGroupsPaneHide", this);
  },


  awake: function()
  {
    this.mapOutletsToThis();
    this.attachEvents();
  },


  onRowSelect: function(evt)
  {
    SSPostNotification("onShowGroup", evt.data);
  },


  editGroup: function(sender, evt)
  {
    SSPostNotification("onEditGroup", evt.data);
  },
  

  attachEvents: function()
  {
    [this.GroupsListView, this.MyGroupsListView].each(function(lv) {
      lv.addEvent("onRowSelect", this.onRowSelect.bind(this));
    }, this);
    this.CreateGroup.addEvent("click", function(e) {
      e = new Event(e);
      SSPostNotification("onCreateGroup", this);
    }.bind(this));
  },


  initListViews: function()
  {
    SSTableForName("Groups").addView(this.GroupsListView);
    SSTableForName("MyGroups").addView(this.MyGroupsListView);
  }
});