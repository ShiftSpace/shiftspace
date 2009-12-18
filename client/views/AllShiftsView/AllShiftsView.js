// ==Builder==
// @uiclass
// @package           ShiftSpaceUI
// @dependencies      SSView
// ==/Builder==

var AllShiftsView = new Class({
  Extends: SSView,
  name: "AllShiftsView",

  initialize: function(el, options)
  {
    this.parent(el, options);
    SSAddObserver(this, "onSync", this.onSync.bind(this));
    SSAddObserver(this, "onUserLogin", this.onLogin.bind(this));
  },


  awake: function(args)
  {
    this.mapOutletsToThis();
  },
  
  
  optionsForTable: function(table)
  {
    if(table == SSTableForName("AllShifts"))
    {
      return {byHref:window.location.href.split("#")[0]};
    }
    if(table == SSTableForName("FollowShifts"))
    {
      return {byFollowing:true};
    }
    if(table == SSTableForName("GroupShifts"))
    {
      return {byGroups:true};
    }
  },


  onSync: function()
  {
    this.initListViews();
  },
  
  
  onLogin: function()
  {
    this.initListViews();
  },


  showUser: function(sender, evt)
  {
    SSPostNotification("onShowUser", evt.data);
  },


  initListViews: function()
  {
    SSTableForName("AllShifts").addView(this.AllShiftsListView);
    SSTableForName("AllShifts").setDelegate(this);
    if(SSTableForName("FollowShifts"))
    {
      SSTableForName("FollowShifts").addView(this.FollowShiftsListView);
      SSTableForName("FollowShifts").setDelegate(this);
    }
  }
});