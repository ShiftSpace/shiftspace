// ==Builder==
// @uiclass
// @customView
// @optional
// @package           ShiftSpaceUI
// @dependencies      SSView
// ==/Builder==

var InboxPane = new Class({
  Extends: SSView,
  name: "InboxPane",

  initialize: function(el, options)
  {
    this.parent(el, options);
    if(!ShiftSpaceUser.isLoggedIn())
    {
      SSAddObserver(this, "onUserLogin", this.onUserLogin.bind(this));
      SSAddObserver(this, "onUserJoin", this.onUserLogin.bind(this));
    }
    SSAddObserver(this, "onUserLogout", this.onUserLogout.bind(this));
  },


  awake: function(args)
  {
    this.mapOutletsToThis();
  },


  afterAwake: function()
  {
    if(ShiftSpaceUser.isLoggedIn()) this.onUserLogin();
  },


  onUserLogin: function(user)
  {
    SSTableForName("Messages").addView(this.MessagesListView);
  },


  onUserLogout: function(json)
  {
  }
});