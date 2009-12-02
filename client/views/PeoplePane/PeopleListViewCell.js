// ==Builder==
// @uiclass
// @package           ShiftSpaceUI
// @dependencies      SSListViewCell
// ==/Builder==

var PeopleListViewCell = new Class({

  Extends: SSListViewCell,
  name: "PeopleListViewCell",


  initialize: function(el, options)
  {
    this.parent(el, options);
  },


  setGravatar: function(gravatar)
  {
    var el = this.lockedElement();
    el.getElement('.gravatar img').setProperty("src", gravatar);
  },


  setUserName: function(userName)
  {
    var el = this.lockedElement();
    el.getElement(".userName").set("text", userName);
  },


  setFullName: function(fullName)
  {
    el.getElement(".fullName").set("text", fullName);
  }

});
