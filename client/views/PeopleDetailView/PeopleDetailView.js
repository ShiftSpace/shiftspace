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
      this.toggleFollowButtons(
        true,
        SSFollowUser(this.currentUser.userName)
      );
    }.bind(this));

    this.element.getElement(".unfollow").addEvent("click", function() {
      this.toggleFollowButtons(
        false,
        SSUnfollowUser(this.currentUser.userName)
      );
    }.bind(this));
  },


  showUser: function(userData)
  {
    this.open();
    this.currentUser = userData;
    ['userName',
     'bio',
     'url',
     'followerCount',
     'followingCount',
     'shiftCount'].each(function(prop) {
       this.element.getElement("."+prop).set("text", userData[prop]);
    }, this);
    this.element.getElement(".gravatarLarge").setProperty("src", userData.gravatarLarge);
    this.toggleFollowButtons(userData.following);
  },


  toggleFollowButtons: function(isFollowing)
  {
    if(isFollowing)
    {
      this.element.getElement(".follow").addClass("SSDisplayNone");
      this.element.getElement(".unfollow").removeClass("SSDisplayNone");
    }
    else
    {
      this.element.getElement(".follow").removeClass("SSDisplayNone");
      this.element.getElement(".unfollow").addClass("SSDisplayNone");
    }
  }.asPromise()
});

