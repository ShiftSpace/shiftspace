// ==Builder==
// @uiclass
// @package           ShiftSpaceCoreUI
// @dependencies      SSFramedView
// ==/Builder==

var SSSpaceMenu = new Class({
  
  Extends: SSFramedView,
  name: 'SSSpaceMenu',


  initialize: function(el, options)
  {
    this.parent(el, options);
    
    SSLog('>>>>>> options', SSLogForce);
    SSLog(options, SSLogForce);

    SSAddObserver(this, 'onUserLogin', this.handleLogin.bind(this));
    SSAddObserver(this, 'onUserLogout', this.handleLogout.bind(this));
    SSAddObserver(this, 'onSync', this.handleSync.bind(this));
  },
  
  
  handleLogin: function()
  {
    var spaces = SSSpacesByPosition();
    SSLog('SpaceMenu spaces', SSLogForce);
    SSLog(spaces, SSLogForce);
  },
  
  
  handleLogout: function()
  {
    
  },
  
  
  handleSync: function()
  {
    
  },
  
  
  onInterfaceLoad: function(ui)
  {
    this.parent(ui);
    this.element.setProperty('id', 'SpaceMenu');
    this.element.addClass('SSDisplayNone');
  },
  
  
  onContextActivate: function(context)
  {
    if(context == this.element.contentWindow)
    {
      this.mapOutletsToThis();
    }
  },
  
  
  buildInterface: function()
  {
    this.parent();
    this.fireEvent('load');
  }
});