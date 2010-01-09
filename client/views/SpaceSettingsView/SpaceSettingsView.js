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
    SSAddObserver(this, "onShowSpaceSettings", this.showSpaceSettings.bind(this));
  },


  setCurrentSpace: function(space)
  {
    this.__space = space;
  },


  currentSpace: function()
  {
    return this.__space;
  },


  showSpaceSettings: function(space)
  {
    this.setCurrentSpace(space.data);
    this.open();
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
    this.SSDebugSpace.addEvent("click", function(evt) {
      evt = new Event(evt);
      var target = $(evt.target);
      if(target.get("checked"))
      {
        ShiftSpace.User.setPreference(this.currentSpace().name+".debug", true);
      }
      else
      {
        ShiftSpace.User.removePreference(this.currentSpace().name+".debug");
      }
    }.bind(this));
  },


  awake: function()
  {
    this.mapOutletsToThis();
    this.attachEvents();
  }
  
});

