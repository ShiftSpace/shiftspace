// ==Builder==
// @uiclass
// @required
// @package           ShiftSpaceCoreUI
// @dependencies      SSView
// ==/Builder==

var SSFramedView = new Class({
  
  name: 'SSFramedView',
  
  Extends: SSView,
  
  initialize: function(el, options)
  {
    this.parent(el, options);
    this.uiclass = el.getProperty('uiclass');
    Sandalphon.load('client/customViews/'+uiclass, this.buildInterface.bind(this));
  },
  
  buildInterface: function(ui)
  {
    SSLog('building interface', SSLogForce);
  }
  
});