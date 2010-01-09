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
    SSAddObserver(this, "onUserLogout", this.onLogin.bind(this));
  },


  awake: function(args)
  {
    this.mapOutletsToThis();
    this.attachEvents();
  },


  attachEvents: function()
  {
    this.AllShiftsTabView.addEvent("tabSelected", this.onTabSelect.bind(this));
  },


  hide: function()
  {
    SSPostNotification("onHideUser");
    this.parent();
  },
  

  onTabSelect: function(evt)
  {
    if(evt.tabIndex != 0)
    {
      SSPostNotification("onHideUser");
    }
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
    if(table == SSTableForName("DomainShifts"))
    {
      return {byDomain:window.location.host};
    }
    return null;
  },


  onSync: function()
  {
    this.initListViews();
    this.updateTabs();
  },
  
  
  onLogin: function()
  {
    this.initListViews();
    this.updateTabs();
  },


  onLogout: function()
  {
    this.updateTabs();
  },


  updateTabs: function()
  {
    if(ShiftSpaceUser.isLoggedIn())
    {
      this.AllShiftsTabView.revealTabByName("ByPeopleTab");
      this.AllShiftsTabView.revealTabByName("ByGroupsTab");
    }
    else
    {
      this.AllShiftsTabView.hideTabByName("ByPeopleTab");
      this.AllShiftsTabView.hideTabByName("ByGroupsTab");
    }
  },


  showUser: function(sender, evt)
  {
    SSPostNotification("onShowUser", SSGetUser(evt.data.userName));
  },


  openShift: function(sender, evt)
  {
    var id = evt.data._id,
        href = evt.data.href;
    SSSetValue("__currentShift", {id: evt.data._id, href: href});
    window.open(evt.data.href);
  },


  initListViews: function()
  {
    SSTableForName("AllShifts").addView(this.AllShiftsListView);
    SSTableForName("AllShifts").setDelegate(this);
    SSTableForName("DomainShifts").addView(this.DomainShiftsListView);
    SSTableForName("DomainShifts").setDelegate(this);    
    if(SSTableForName("FollowShifts"))
    {
      SSTableForName("FollowShifts").addView(this.FollowShiftsListView);
      SSTableForName("FollowShifts").setDelegate(this);
    }
    if(SSTableForName("GroupShifts"))
    {
      SSTableForName("GroupShifts").addView(this.GroupShiftsListView);
      SSTableForName("GroupShifts").setDelegate(this);
    }
  }
});