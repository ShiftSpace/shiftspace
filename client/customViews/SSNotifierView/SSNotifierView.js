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
    this.setIsVisible(false);
    
    this.setIsAnimating(false);
    this.setShiftIsDown(false);
    
    SSAddObserver(this, 'onUserLogin', this.handleLogin.bind(this));
    SSAddObserver(this, 'onUserLogout', this.handleLogout.bind(this));
    SSAddObserver(this, 'onSync', this.handleSync.bind(this));
    SSAddObserver(this, 'onConsoleShow', this.onConsoleShow.bind(this));
    SSAddObserver(this, 'onConsoleHide', this.onConsoleHide.bind(this));
  },
  
  
  onConsoleShow: function()
  {
    this.clearTimers();
    this.show(false);
    this.open(false);
  },
  
  
  onConsoleHide: function()
  {
    this.clearTimers();
    this.close();
  },
  
  
  show: function(animate)
  {
    if(animate == false)
    {
      this.showComplete();
    }
    else
    {
      if(this.showFx)
      {
        if(!this.isVisible()) this.showFx.start('.SSNotifierVisible');
      }
      else
      {
        SSAddObserver(this, 'onNotifierLoad', this.show.bind(this));
      }
    }
  },
  
  
  showComplete: function()
  {
    this.element.setStyles({
      marginLeft: null
    });
    this.element.removeClass('SSNotifierHidden');
    this.element.addClass('SSNotifierVisible');
    this.setIsVisible(true);
  },
  
  
  hide: function(animate)
  {
    if(ShiftSpace.Console.isVisible()) return;
    this.hideFx.start('.SSNotifierHidden');
  },
  
  
  hideComplete: function()
  {
    this.element.setStyles({
      marginLeft: ""
    });
    this.element.removeClass('SSNotifierVisible');
    this.element.addClass('SSNotifierHidden');
    this.setIsVisible(false);
  },
  
  
  handleSync: function()
  {
    ShiftSpace.User.getShifts(function(shifts) {
      if(shifts && shifts.length > 0)
      {
        this.SSShiftCount.set('text', shifts.length + ((shifts.length == 1) ? ' shift' : ' shifts'));
        this.show();
      }
    }.bind(this));
  },
  
  
  handleLogin: function()
  {
    this.updateControls();
  },
  
  
  handleLogout: function()
  {
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
  
  
  setIsVisible: function(val)
  {
    this.__visible = val;
  },
  
  
  isVisible: function()
  {
    return this.__visible;
  },
  
  
  setIsOpen: function(val)
  {
    this.__isOpen = val;
  },
  
  
  isOpen: function()
  {
    return this.__isOpen;
  },
  
  
  setIsOpening: function(val)
  {
    this.__isOpening = val;
  },
  
  
  isOpening: function()
  {
    return this.__isOpening;
  },
  
  
  setIsClosing: function(val)
  {
    this.__isClosing = val;
  },
  
  
  isClosing: function()
  {
    return this.__isClosing;
  },
  
  
  setIsShowing: function(val)
  {
    this.__isShowing = val;
  },
  
  
  isShowing: function()
  {
    return this.__isShowing;
  },
  

  setIsHiding: function(val)
  {
    this.__isHiding = val;
  },
  
  
  isHiding: function()
  {
    return this.__isHiding;
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
    this.document().body.addEvent('mouseleave', function() {
      if(!this.shiftIsDown())
      {
        this['close']();
      }
    }.bind(this));
    
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
    
    SSAddEvent('keyup', function(_evt) {
      var evt = new Event(_evt);
      if(evt.key == 'shift') this.handleKeyUp(evt);
    }.bind(this));

    SSAddEvent('keydown', function(_evt) {
      var evt = new Event(_evt);
      if(evt.key == 'shift') this.handleKeyDown(evt);
    }.bind(this));
    
    this.SSNotifierControlsView.addEvent('click', function() {
      ShiftSpace.Console.show();
    }.bind(this));
  },
  
  
  clearTimers: function(evt)
  {
    $clear(this.closeTimer);
    $clear(this.hideTimer);
    $clear(this.showTimer);
    $clear(this.openTimer);
  },
  
  
  handleKeyDown: function(evt)
  {
    this.setShiftIsDown(true);
    this.clearTimers();
    
    if(!this.isAnimating())
    {
      if(!this.isVisible())
      {
        this.showTimer = function() {
          this.show();
          this.openTimer = function() {
            this.open();
          }.delay(2000, this);
        }.delay(500, this);
      }
      else if(this.isVisible() && !this.isOpen())
      {
        this.openTimer = function() {
          this.open();
        }.delay(500, this)
      }
    }
  },
  
  
  handleKeyUp: function(evt)
  {
    this.setShiftIsDown(false);
    this.clearTimers();

    if(!this.isAnimating())
    {
      if(this.isOpen())
      {
        this.close();
      }
      else if(this.isVisible())
      {
        this.hide();
      }
    }
  },
  
  
  'open': function(animate)
  {
    this.openTime = new Date();
    this.clearTimers();

    if(animate == false)
    {
      this.openComplete();
    }
    else if(!this.isOpen() && !this.isAnimating())
    {
      this.openFx.start('width', window.getSize().x);
    }
  },
  
  
  openComplete: function()
  {
    this.element.addClass('SSNotifierOpen');
    this.element.setStyle('width', null);
    this.showControls();
    this.setIsOpen(true);
  },
  
  
  closeComplete: function()
  {
    this.setIsOpen(false);
  },
  
  
  'close': function(animate)
  {
    var now = new Date();
    this.clearTimers();
    
    if(ShiftSpace.Console.isVisible()) return;
    
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
    else
    {
      SSLog("isOpen: " + this.isOpen() + ", isAnimating: " + this.isAnimating(), SSLogForce);
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
    this.element.addClass('SSNotifierHidden');
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
  
  
  setShiftIsDown: function(val)
  {
    this.__shiftIsDown = val;
  },
  
  
  shiftIsDown: function()
  {
    return this.__shiftIsDown;
  },
  
  
  initAnimations: function()
  {
    this.showFx = new Fx.Morph(this.element, {
      duration: 300,
      transition: Fx.Transitions.Cubic.easeOut,
      onStart: function()
      {
        this.setIsAnimating(true);
      }.bind(this),
      onComplete: function()
      {
        this.setIsAnimating(false);
        this.showComplete();
        if(!this.shiftIsDown())
        {
          this.hideTimer = this.hide.delay(3000, this);
        }
      }.bind(this)
    });
    
    this.hideFx = new Fx.Morph(this.element, {
      duration: 300,
      transition: Fx.Transitions.Cubic.easeOut,
      onStart: function()
      {
        this.setIsAnimating(true);
      }.bind(this),
      onComplete: function()
      {
        this.setIsAnimating(false);
        this.hideComplete();
      }.bind(this)
    });
    
    this.openFx = new Fx.Tween(this.element, {
      duration: 300,
      transition: Fx.Transitions.Cubic.easeOut,
      onStart: function()
      {
        this.setIsAnimating(true);
      }.bind(this),
      onComplete: function()
      {
        this.setIsAnimating(false);
        this.openComplete();
      }.bind(this)
    });
    
    this.closeFx = new Fx.Tween(this.element, {
      duration: 300, 
      transition: Fx.Transitions.Cubic.easeOut,
      onStart: function()
      {
        this.setIsAnimating(true);
        this.hideControls();
        this.element.setStyles({
          width: window.getSize().x
        });
        this.element.removeClass('SSNotifierOpen');
      }.bind(this),
      onComplete: function()
      {
        this.setIsAnimating(false);
        this.closeComplete();
        if(!this.shiftIsDown())
        {
          this.hideTimer = this.hide.delay(3000, this);
        }
      }.bind(this)
    });
  },
  
  
  buildInterface: function()
  {
    this.parent();
    
    this.initAnimations();
    this.attachEvents();
    
    SSPostNotification('onNotifierLoad', this);
    this.fireEvent('load', this);
  }
});