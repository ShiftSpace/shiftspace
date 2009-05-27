// ==Builder==
// @uiclass
// @optional
// @package           ShiftSpaceUI
// @dependencies      SSCell
// ==/Builder==

var SSInstalledSpaceCell = new Class({

  Extends: SSCell,

  name: "SSInstalledSpaceCell",
  
  awake: function(context)
  {
    this.mapOutletsToThis();
  },
  
  setIcon: function(imageSrc)
  {
    var el = this.lockedElement();
    if(imageSrc)
    {
      var attrs = SSGetSpaceAttributes(el.retrieve('spaceName'));
      el.getElement('img').setProperty('src', attrs.icon);
    }
  },
  
  setName: function(name)
  {
    var el = this.lockedElement();
    if(name)
    {
      el.store('spaceName', name);
      el.getElement('.name').setProperty('text', name);
    }
  },

  setAutolaunch: function(autolaunch)
  {
  }
});