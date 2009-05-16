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
  
  setImage: function(imageSrc)
  {
    SSLog('setImage', SSLogForce);
    var el = this.lockedElement();
    if(imageSrc)
    {
      el.getElement('img').setProperty('src', ShiftSpace.info().spacesDir+image);      
    }
  },
  
  setName: function(name)
  {
    SSLog('setName', SSLogForce);
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