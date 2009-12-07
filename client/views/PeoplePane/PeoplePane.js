// ==Builder==
// @uiclass
// @package           ShiftSpaceUI
// @dependencies      SSView
// ==/Builder==

var PeoplePane = new Class({

  Extends: SSView,
  name: "PeoplePane",

  initialize: function(el, options)
  {
    this.parent(el, options);
    SSAddObserver(this, "onUserLogin", this.onUserLogin.bind(this));
    SSAddObserver(this, "onUserJoin", this.onUserLogin.bind(this));
    SSAddObserver(this, "onUserLogout", this.onUserLogout.bind(this));
  },


  awake: function()
  {
    this.mapOutletsToThis();
    this.FollowingListView.addEvent("onRowClick", this.handleRowClick.bind(this));
  },


  hide: function()
  {
    this.parent();
    var cw = ShiftSpace.SSConsoleWindow;
    if(cw.isVisible())
    {
      cw.hide();
    }
  },


  handleRowClick: function(evt)
  {
    if(evt.listView == this.FollowingListView)
    {
      var cw = ShiftSpace.SSConsoleWindow;
      cw.SSConsoleWindowMultiView.showViewByName("PeopleDetailView");
      cw.show();
      ShiftSpaceNameTable.PeopleDetailView.showUser(evt.data);
    }
  },


  afterAwake: function()
  {
    if(ShiftSpaceUser.isLoggedIn()) this.onUserLogin();
  },


  onUserLogin: function(user)
  {
    SSTableForName("Following").addView(this.FollowingListView);
    SSTableForName("Followers").addView(this.FollowersListView);
    SSTableForName("Users").addView(this.SearchUsersListView);
  },


  onUserLogout: function(json)
  {
  }
});