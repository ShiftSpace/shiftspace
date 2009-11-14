// ==Builder==
// @uiclass
// @package           ShiftSpaceUI
// @dependencies      SSView
// ==/Builder==

var MyShiftSpacePane = new Class({
  Extends: SSView,
  name: "MyShiftSpacePane",

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
    SSTableForName("MyShifts").addView(this.MyShiftsListView);
    SSTableForName("Favorites").addView(this.MyFavoritesListView);
    SSTableForName("MyComments").addView(this.MyCommentsListView);
  },


  onUserLogout: function(json)
  {
  }
});