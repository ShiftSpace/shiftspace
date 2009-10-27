// ==Builder==
// @uiclass
// @customView
// @optional
// @package           ShiftSpaceUI
// @dependencies      SSView
// ==/Builder==

var AllShiftsView = new Class({
  Extends: SSView,
  name: "AllShiftsView",

  initialize: function(el, options)
  {
    this.parent(el, options);
    if(!ShiftSpaceUser.isLoggedIn())
    {
      SSAddObserver(this, "onSync", this.onSync.bind(this));
      SSAddObserver(this, "onUserLogin", this.onLogin.bind(this));
    }
  },
  

  initAllShiftsView: function()
  {
  },


  awake: function(args)
  {
    this.mapOutletsToThis();
  },


  afterAwake: function()
  {
    SSTableForName("AllShifts").setDelegate(ShiftSpaceNameTable.FilterPane);
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