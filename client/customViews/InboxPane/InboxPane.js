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


  transform: function(data)
  {
    var content = data.content;
    data.summary = content.text;
    return data;
  },


  onUserLogin: function(user)
  {
    if(this.__resourcesInitialized) return;
    this.__resourcesInitialized = true;

    this.messages = new SSTable("Messages", {
      resource: {read:'user/'+ShiftSpaceUser.getUserName()+'/messages', 'delete':'event'},
      transforms: [this.transform],
      watches: [{
                  events: [{resource:"event", action:"read"},
                           {resource:"event", action:"unread"}],
                  handlers: [SSTable.dirtyTheViews]
                }],
      views: [this.MessagesListView]
    });
  },


  onUserLogout: function(json)
  {
    this.__resourcesInitialized = false;
    this.messages.dispose();
  }
});