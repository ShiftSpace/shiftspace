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
    SSTemplate(this.element.getElement(".SpaceDetails"), this.currentSpace());
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

    var content = this.element.getElement(".settings-content");
    content.set("morph", {
      duration: 300,
      transition: Fx.Transitions.Cubic.easeIn,
      onStart: function() {
        if(parseInt(content.getStyle('height')) != 0)
        {
          content.removeClass("settings-open");
          content.addClass("settings-hidden");
        }
      },
      onComplete: function() {
        if(parseInt(content.getStyle('height')) == 0)
        {
          content.removeClass("settings-open");
          content.addClass("settings-hidden");
        }
        else
        {
          content.removeClass("settings-hidden");
          content.addClass("settings-open");
        }
      }.bind(this)
    });

    this.element.getElement(".settings-title").addEvent("click", function(evt) {
      if(content.hasClass("settings-hidden"))
      {
        content.setStyles({
          height: 0,
          display: "block"
        });
        content.morph(".settings-open");
      }
      else
      {
        content.morph(".settings-hidden");
      }
    }.bind(this));
  },


  awake: function()
  {
    this.mapOutletsToThis();
    this.attachEvents();
  }
});

