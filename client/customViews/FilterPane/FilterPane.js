// ==Builder==
// @uiclass
// @customView
// @optional
// @package           ShiftSpaceUI
// @dependencies      SSView
// ==/Builder==

var FilterPane = new Class({

  Extends: SSView,
  name: "FilterPane",

  initialize: function(el, options)
  {
    this.parent(el, options);
    SSLog('new FilterPane', SSLogForce);
  }

});