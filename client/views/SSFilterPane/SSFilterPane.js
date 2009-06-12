// ==Builder==
// @uiclass
// @customView
// @optional
// @package           ShiftSpaceUI
// @dependencies      SSView
// ==/Builder==

var SSFilterPane = new Class({

  Extends: SSView,
  name: "SSFilterPane",

  initialize: function(el, options)
  {
    this.parent(el, options);
    SSLog('new SSFilterPane', SSLogForce);
  }

});