// ==Builder==
// @uiclass
// @package           ShiftSpaceUI
// @dependencies      SSListViewCell
// ==/Builder==

var SSCommentsListViewCell = new Class({

  Extends: SSListViewCell,
  name: "SSCommentsListViewCell",
  
  
  initialize: function(el, options)
  {
    this.parent(el, options);
  },
  
  
  clone: function()
  {
    var clone = this.parent();
    return clone;
  },


  setText: function(text)
  {
    var el = this.lockedElement();
    el.getElement(".text").set("text", text);
  },

  
  setModified: function(modified)
  {
    var el = this.lockedElement();
    el.getElement('.date').set('text', modified);
  },
  
  
  setUserName: function(userName)
  {
    var el = this.lockedElement();
    el.getElement('.userName').set('text', userName);
    if(ShiftSpace.User.isLoggedIn() && ShiftSpace.User.getUserName() == userName)
    {
      el.getElement('.userName').addClass('loggedin');
    }
    else
    {
      el.getElement('.userName').removeClass('loggedin');
    }
  },
  
  
  setGravatar: function(gravatar)
  {
    var el = this.lockedElement();
    el.getElement('.gravatar').setProperty('src', gravatar);
  }
});

