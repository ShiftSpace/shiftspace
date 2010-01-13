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

    SSAddObserver(this, "onFollow", function() {
      this.showCounts(SSUserInfo(ShiftSpaceUser.getUserName()));
    }.bind(this));
    SSAddObserver(this, "onUnfollow", function() {
      this.showCounts(SSUserInfo(ShiftSpaceUser.getUserName()));
    }.bind(this));
  },


  awake: function()
  {
    this.mapOutletsToThis();
    [this.FollowingListView,
     this.FollowersListView,
     this.SearchUsersListView].each(function(lv) {
       lv.addEvent("onRowClick", this.handleRowClick.bind(this));
     }, this);
  },


  show: function()
  {
    this.parent();
    this.showCounts(SSUserInfo(ShiftSpaceUser.getUserName()));
  },


  showCounts: function(userData)
  {
    var followingCount = userData.followingCount,
        followerCount = userData.followerCount,
        controlView = this.PeopleTabView.controlView(),
        followingEl = controlView.getElement(".followingCount"),
        followerEl = controlView.getElement(".followerCount");
    if(followingCount)
    {
      followingEl.set("text", "("+followingCount+")");
    }
    else
    {
      followingEl.set("text", "");
    }
    if(followerCount)
    {
      followerEl.set("text", "("+followerCount+")");
    }
    else
    {
      followerEl.set("text", "");
    }
  }.asPromise(),


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
    SSPostNotification('onShowUser', evt.data);
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