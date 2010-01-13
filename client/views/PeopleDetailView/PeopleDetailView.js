// ==Builder==
// @uiclass
// @package           ShiftSpaceUI
// @dependencies      SSView
// ==/Builder==

var PeopleDetailView = new Class({

  Extends: SSView,
  name: "PeopleDetailView",

  initialize: function(el, options)
  {
    this.parent(el, options);

    SSAddObserver(this, 'onShowUser', this.showUser.bind(this));
    SSAddObserver(this, 'onHideUser', this['close'].bind(this));
  },


  awake: function()
  {
    this.attachEvents();
  },


  'open': function()
  {
    this.delegate().tall();
    this.delegate().show();
    this.multiView().showViewByName(this.name);
  },


  'close': function()
  {
    this.delegate().hide();
  },


  attachEvents: function()
  {
    this.element.getElement(".follow").addEvent("click", function() {
      this.update(
        true,
        true,
        SSFollowUser(this.currentUser.userName)
      );
    }.bind(this));

    this.element.getElement(".unfollow").addEvent("click", function() {
      this.update(
        false,
        true,
        SSUnfollowUser(this.currentUser.userName)
      );
    }.bind(this));
  },


  showUser: function(userData)
  {
    this.open();
    this.currentUser = userData;
    this.element.getElement(".gravatarLarge").setProperty("src", userData.gravatarLarge);
    SSTemplate(this.element, $H(userData).erase("gravatarLarge"));
    this.update(userData.following, false);
    this.showUserInfo(SSUserInfo(userData.userName));
  },


  showUserInfo: function(info)
  {
    SSTemplate(this.element, info);
  }.asPromise(),


  update: function(isFollowing, postNotification)
  {
    if(isFollowing)
    {
      this.element.getElement(".follow").addClass("SSDisplayNone");
      this.element.getElement(".unfollow").removeClass("SSDisplayNone");
      if(postNotification) SSPostNotification("onFollow");
    }
    else
    {
      this.element.getElement(".follow").removeClass("SSDisplayNone");
      this.element.getElement(".unfollow").addClass("SSDisplayNone");
      if(postNotification) SSPostNotification("onUnfollow");
    }
  }.asPromise()
});

