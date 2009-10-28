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
    SSAddObserver(this, "onSync", this.onSync.bind(this));
    SSAddObserver(this, "onUserLogin", this.onLogin.bind(this));
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