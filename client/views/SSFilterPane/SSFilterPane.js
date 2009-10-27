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
  },

  
  optionsForTable: function(resource)
  {
    return {byHref:window.location.href.split("#")[0]};
  },

});