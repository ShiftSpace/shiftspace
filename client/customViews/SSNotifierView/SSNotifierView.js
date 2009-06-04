// ==Builder==
// @uiclass
// @customView
// @package           ShiftSpaceCoreUI
// @dependencies      SSFramedView
// ==/Builder==

var SSNotifierView = new Class({
  
  Extends: SSFramedView,
  
  name: 'SSNotifierView',

  initialize: function(el, options)
  {
    SSLog('>>>>>>>>>>>>>>>>>>>> this.name ' + this.name, SSLogForce);
    this.parent(el, options);
  },
  
  
  buildInterface: function()
  {
    this.parent();
  }
});