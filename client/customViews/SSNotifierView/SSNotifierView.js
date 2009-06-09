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
    this.setIsOpen(false);
    this.setIsAnimating(false);
    
    SSAddObserver(this, 'onUserLogin', this.handleLogin.bind(this));
    SSAddObserver(this, 'onUserLogout', this.handleLogout.bind(this));
  },
  
  
  handleLogin: function()
  {
    SSLog('handleLogin!', SSLogForce);
    this.updateControls();
  },
  
  
  handleLogout: function()
  {
    SSLog('handleLogout', SSLogForce);
    this.updateControls();
  },
  
  
  updateControls: function()
  {
    if(this.SSUsername)
    {
      this.SSUsername.set('text', ShiftSpace.User.getUsername());
    }
    
    if(this.SSLogInOut)
    {
      if(ShiftSpace.User.isLoggedIn())
      {
        this.SSLogInOut.set('text', 'Logout')
      }
      else
      {
        this.SSLogInOut.set('text', 'Login');
      }
    }
  },
  
  
  setIsOpen: function(val)
  {
    this.__isOpen = val;
  },
  
  
  isOpen: function()
  {
    return this.__isOpen;
  },
  
  
  setIsAnimating: function(val)
  {
    this.__isAnimating = val;
  },
  
  
  isAnimating: function()
  {
    return this.__isAnimating;
  },
  
  
  attachEvents: function()
  {
    this.document().body.addEvent('mouseenter', this['open'].bind(this));
    this.document().body.addEvent('mouseleave', this['close'].bind(this));
    
    this.SSLogInOut.addEvent('click', function() {
      if(ShiftSpace.User.isLoggedIn())
      {
        ShiftSpace.User.logout()
      }
      else
      {
        ShiftSpace.Console.showLogin();
      }
    }.bind(this));
  },
  
  
  'open': function()
  {
    this.openTime = new Date();
    $clear(this.closeTimer);

    if(!this.isOpen() && !this.isAnimating())
    {
      this.openFx.start('width', window.getSize().x);
      this.setIsOpen(true);
    }
  },
  
  
  'close': function()
  {
    var now = new Date();
    
    if(this.isOpen() && !this.isAnimating())
    {
      var delta = now.getTime() - this.openTime.getTime();
    
      if(delta >= 3000)
      {
        this.setIsOpen(false);
        this.closeFx.start('width', 200);
      }
      else
      {
        $clear(this.closeTimer);
        this.closeTimer = this.close.delay(3000-delta, this);
      }
    }    
  },
  
  
  showControls: function()
  {
    this.window().$$('.SSNotifierSubView').removeClass('SSActive');
    this.SSNotifierControlsView.addClass('SSActive');
  },
  
  
  hideControls: function()
  {
    this.window().$$('.SSNotifierSubView').removeClass('SSActive');
    this.SSNotifierDefaultView.addClass('SSActive');
  },
  
  
  onInterfaceLoad: function(ui)
  {
    this.parent(ui);
    this.element.setProperty('id', 'SSNotifier');
  },
  
  
  awake: function(context)
  {
  },
  
  
  onContextActivate: function(context)
  {
    if(context == this.element.contentWindow)
    {
      this.mapOutletsToThis();
      this.updateControls();
    }
  },
  
  
  initAnimations: function()
  {
    this.openFx = new Fx.Tween(this.element, {
      duration: 300,
      transition: Fx.Transitions.Cubic.easeIn,
      onStart: function()
      {
        this.setIsAnimating(true);
      }.bind(this),
      onComplete: function()
      {
        this.element.addClass('SSNotifierOpen');
        this.element.setStyle('width', null);
        this.setIsAnimating(false);
        this.showControls();
      }.bind(this)
    });
    
    this.closeFx = new Fx.Tween(this.element, {
      duration: 300, 
      transition: Fx.Transitions.Cubic.easeIn,
      onStart: function()
      {
        this.hideControls();
        this.setIsAnimating(true);
        this.element.setStyles({
          width: window.getSize().x
        });
        this.element.removeClass('SSNotifierOpen');
      }.bind(this),
      onComplete: function()
      {
        this.setIsAnimating(false);
      }.bind(this)
    });
  },
  
  
  buildInterface: function()
  {
    this.parent();
    
    this.initAnimations();
    this.attachEvents();
    
    SSPostNotification('onNotifierLoad', this);
  }
});