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
    this.parent(el, options);
  },
  
  
  attachEvents: function()
  {
    this.document().body.addEvent('mouseenter', function(_evt) {
      var evt = new Event(_evt);
      SSLog('mouseenter', SSLogForce);
    }.bind(this));
    
    this.document().body.addEvent('mouseleave', function(_evt) {
      var evt = new Event(_evt);
      SSLog('mouseleave', SSLogForce);
    }.bind(this));
  },
  
  
  initAnimations: function()
  {
    
  },
  
  
  buildInterface: function()
  {
    this.parent();
    
    var size = this.document().body.getSize();
    
    SSLog('body size', SSLogForce);
    SSLog(size, SSLogForce);
    
    this.initAnimations();
    this.attachEvents();
  }
});