// ==Builder==
// @uiclass
// @optional
// @package           ShiftSpaceUI
// @dependencies      SSListViewCell
// ==/Builder==

var ShiftListViewCell = new Class({

  Extends: SSListViewCell,
  name: "ShiftListViewCell",
  
  
  initialize: function(el, options)
  {
    this.parent(el, options);
  },

  
  setSummary: function(summary)
  {
    var el = this.lockedElement();
    el.getElement('.summary').set('text', title);
  },
  
  
  setDate: function(date)
  {
    var el = this.lockedElement();
    el.getElement('.date').set('text', date);
  },
  
  
  setSpaceIcon: function(icon)
  {
    var el = this.lockedElement();
    el.getElement('.spaceIcon').setProperty('src', icon);
  },
  
  
  setUserName: function(userName)
  {
    var el = this.lockedElement();
    el.getElement('.userName').set('text', userName);
  },
  
  
  setUserIcon: function(userIcon)
  {
    var el = this.lockedElement();
    el.getElement('.userIcon').set('src', userIcon);
  }

});

