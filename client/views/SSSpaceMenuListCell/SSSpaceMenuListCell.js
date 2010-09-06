// ==Builder==
// @uiclass
// @package           ShiftSpaceUI
// @dependencies      SSCell
// ==/Builder==

var SSSpaceMenuListCell = new Class({

  Extends: SSCell,

  name: "SSSpaceMenuListCell",
  
  awake: function(context)
  {
    this.mapOutletsToThis();
  },
  
  setIcon: function(imageSrc, data)
  {
    var el = this.lockedElement();
    if(imageSrc)
    {
      var attrs = SSGetSpaceAttributes(data.name);
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
  }
});