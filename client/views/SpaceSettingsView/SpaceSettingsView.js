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
    this.update();
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


  update: function()
  {
    var spaceName = this.currentSpace().name;
    SSTemplate(this.getElement(".SpaceDetails"), this.currentSpace());
    if(SSSpaceIsInDebugMode(spaceName))
    {
      this.SSDebugSpace.set("checked", true);
    }
    else
    {
      this.SSDebugSpace.set("checked", false);
    }
    if(SSSpaceShouldAutolaunch(spaceName))
    {
      this.SSAutolaunch.set("checked", true);
    }
    else
    {
      this.SSAutolaunch.set("checked", false);
    }
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

    this.SSAutolaunch.addEvent("click", function(evt) {
      evt = new Event(evt);
      var target = $(evt.target);
      if(target.get("checked"))
      {
        ShiftSpace.User.setPreference(this.currentSpace().name+".autolaunch", true);
      }
      else
      {
        ShiftSpace.User.setPreference(this.currentSpace().name+".autolaunch", false);
      }
    }.bind(this));

    this.UninstallSpace.addEvent("click", function(evt) {
      evt = new Event(evt);
      SSUninstallSpace(this.currentSpace().name);
    }.bind(this));
  },


  awake: function()
  {
    this.mapOutletsToThis();
    this.attachEvents();
  }
});

