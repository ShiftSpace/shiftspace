// ==Builder==
// @uiclass
// @customView
// @optional
// @package           ShiftSpaceUI
// @dependencies      SSView
// ==/Builder==

var SSPublishPane = new Class({

  Extends: SSView,
  name: "SSPublishPane",

  initialize: function(el, options)
  {
    this.parent(el, options);
    SSLog('new SSPublishPane', SSLogForce);
  }

});