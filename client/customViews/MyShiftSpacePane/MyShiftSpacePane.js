// ==Builder==
// @uiclass
// @customView
// @optional
// @package           ShiftSpaceUI
// @dependencies      SSView
// ==/Builder==

var MyShiftSpacePane = new Class({
  Extends: SSView,
  name: "MyShiftSpacePane",

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


  favoriteTransform: function(data)
  {
    var content = data.content;
    data.summary = content.text;
    return data;
  },


  commentTransform: function(data)
  {
    var content = data.content;
    data.userName = content.user.userName;
    data.space = content.shift.space;
    data.href = content.href;
    data.domain = content.domain;
    data.text = content.text;
    return data;
  },


  onUserLogin: function(user)
  {
    if(this.__resourcesInitialized) return;
    this.__resourcesInitialized = true;

    this.favorites = new SSResource("Favorites", {
      resource: {read:'user/'+ShiftSpaceUser.getUserName()+'/favorites'},
      transforms: [this.favoriteTransform],
      watches: [{
                  events: [{resource:"shift", action:"favorite"},
                           {resource:"shift", action:"unfavorite"}],
                  handlers: [SSResource.dirtyTheViews]
                }],
      views: [this.MyFavoritesListView]
    });

    this.comments = new SSResource("MyComments", {
      resource: {read:'user/'+ShiftSpaceUser.getUserName()+'/comments'},
      transforms: [this.commentTransform],
      watches: [{
                  events: [{resource:"shift", action:"comment"}],
                  handlers: [SSResource.dirtyTheViews]
                }],
      views: [this.MyCommentsListView]
    });
  },


  onUserLogout: function(json)
  {
    this.__resourcesInitialized = false;
    this.favorites.dispose();
  }
});