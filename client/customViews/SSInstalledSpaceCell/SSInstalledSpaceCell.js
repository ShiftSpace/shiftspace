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
      el.getElement('img').setProperty('src', ShiftSpace.info().spacesDir+imageSrc);
    }
  },
  
  setName: function(name)
  {
    var el = this.lockedElement();
    if(name)
    {
      el.getElement('.name').setProperty('text', name);
    }
  },

  setAutolaunch: function(autolaunch)
  {
    SSLog('setAutolaunch', SSLogForce);
  }
});