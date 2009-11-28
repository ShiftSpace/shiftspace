// ==Builder==
// @uiclass
// @package           ShiftSpaceUI
// @dependencies      SSView
// ==/Builder==

var AllShiftsView = new Class({
  Extends: SSView,
  name: "AllShiftsView",

  initialize: function(el, options)
  {
    this.parent(el, options);
    SSAddObserver(this, "onSync", this.onSync.bind(this));
    SSAddObserver(this, "onUserLogin", this.onLogin.bind(this));
  },


  awake: function(args)
  {
    this.mapOutletsToThis();
  },
  
  
  optionsForTable: function(table)
  {
    if(table == SSTableForName("AllShifts"))
    {
      return {byHref:window.location.href.split("#")[0]};
    }
    if(table == SSTableForName("FollowShifts"))
    {
      return {byFollow:true};
    }
    if(table == SSTableForName("GroupShifts"))
    {
      return {byFollow:true};
    }
  },


  afterAwake: function()
  {
    SSTableForName("AllShifts").setDelegate(this);
  },
  

  onSync: function()
  {
    SSTableForName("AllShifts").addView(this.AllShiftsListView);
  },
  
  
  onLogin: function()
  {
    SSTableForName("AllShifts").addView(this.AllShiftsListView);
  }
});