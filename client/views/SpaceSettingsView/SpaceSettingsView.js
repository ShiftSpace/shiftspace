// ==Builder==
// @uiclass
// @package           ShiftSpaceUI
// @dependencies      SSView
// ==/Builder==

var SpaceSettingsView = new Class({

  Extends: SSView,
  name: "SpaceSettingsView",

  initialize: function(el, options)
  {
    this.parent(el, options);
    SSLog("init SpaceSettingsView", SSLogForce);
    SSAddObserver(this, "onShowSpaceSettings", this.showSpaceSettings.bind(this));
  },


  showSpaceSettings: function(space)
  {
    this.open();
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
    
  },


  awake: function()
  {
    this.mapOutletsToThis();
    this.attachEvents();
  }
  
});

