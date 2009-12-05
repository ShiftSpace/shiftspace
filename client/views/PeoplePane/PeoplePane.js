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
  },


  afterAwake: function()
  {
    if(ShiftSpaceUser.isLoggedIn()) this.onUserLogin();
  },


  onUserLogin: function(user)
  {
    SSTableForName("Following").addView(this.FollowingListView);
    SSTableForName("Followers").addView(this.FollowersListView);
  },


  onUserLogout: function(json)
  {
  }
});