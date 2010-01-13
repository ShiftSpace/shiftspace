// ==Builder==
// @uiclass
// @package           ShiftSpaceUI
// @dependencies      SSListViewCell
// ==/Builder==

var MemberListViewCell = new Class({

  Extends: SSListViewCell,
  name: "MemberListViewCell",

  setGravatar: function(gravatar)
  {
    var el = this.lockedElement();
    el.getElement(".gravatar").set("src", gravatar);
  },

  setUserName: function(userName)
  {
    var el = this.lockedElement();
    el.getElement(".userName").set("text", userName);
  }
});
