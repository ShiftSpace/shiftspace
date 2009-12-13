// ==Builder==
// @uiclass
// @package           ShiftSpaceUI
// @dependencies      SSView
// ==/Builder==

var InboxPane = new Class({
  Extends: SSView,
  name: "InboxPane",

  initialize: function(el, options)
  {
    this.parent(el, options);
    SSAddObserver(this, "onUserLogin", this.onUserLogin.bind(this));
    SSAddObserver(this, "onUserJoin", this.onUserLogin.bind(this));
    SSAddObserver(this, "onUserLogout", this.onUserLogout.bind(this));
  },


  awake: function(args)
  {
    this.mapOutletsToThis();
    this.attachEvents();
  },


  attachEvents: function()
  {
    this.MessagesListView.addEvent("onRowClick", this.handleRowClick.bind(this));
  },


  handleRowClick: function(evt)
  {
    if(!evt.handled) SSPostNotification("onShowMessage", evt.data);
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