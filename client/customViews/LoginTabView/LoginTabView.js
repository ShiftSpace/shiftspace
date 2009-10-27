// ==Builder==
// @uiclass
// @customView
// @optional
// @package           ShiftSpaceUI
// @dependencies      SSView
// ==/Builder==

var LoginTabView = new Class({
  Extends: SSView,
  name: "LoginTabView",

  initialize: function(el, options)
  {
    this.parent(el, options);
    if(!ShiftSpaceUser.isLoggedIn())
    {
      SSAddObserver(this, "onSync", this.onSync.bind(this));
      SSAddObserver(this, "onUserLogin", this.onLogin.bind(this));
    }
  },
  

  awake: function(args)
  {
    this.mapOutletsToThis();
  },


  afterAwake: function()
  {
  },
  

  onSync: function()
  {
  },
  
  
  onLogin: function()
  {
  }
});