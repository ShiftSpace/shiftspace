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
    SSLog('onConsoleShow', SSLogForce);
    this.clearTimers();
    this.show(false);
    this.open(false);
  },
  
  
  onConsoleHide: function()
  {
    
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
  },
  
  
  hide: function()
  {
    if(ShiftSpace.Console.isVisible()) return;
    this.showFx.start('.SSNotifierHidden');
  },
  
  
  hideComplete: function()
  {
    this.element.setStyles({
      marginLeft: null
    });
    this.element.removeClass('SSNotifierVisible');
    this.element.addClass('SSNotifierHidden');
  },
  
  
  handleSync: function()
  {
    ShiftSpace.User.getShifts(function(shifts) {
      if(shifts && shifts.length > 0)
      {
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
      else
      {
        //SSLog('shift is down', SSLogForce);
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
    $clear(this.closeTimer);
    $clear(this.hideTimer);

    if(animate == false)
    {
      this.openComplete();
    }
    else if(!this.isOpen() && !this.isAnimating())
    {
      this.openFx.start('width', window.getSize().x);
      this.setIsOpen(true);
    }
  },
  
  
  openComplete: function()
  {
    this.element.addClass('SSNotifierOpen');
    this.element.setStyle('width', null);
    this.showControls();
  },
  
  
  'close': function(animate)
  {
    var now = new Date();
    
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
        this.setIsVisible(!this.isVisible());
      }.bind(this),
      onComplete: function()
      {
        this.setIsAnimating(false);
        if(this.isVisible())
        {
          this.showComplete();
        }
        else
        {
          this.hideComplete();
        }
        if(!this.shiftIsDown())
        {
          this.hideTimer = this.hide.delay(3000, this);
        }
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
        this.openComplete();
        this.setIsAnimating(false);
      }.bind(this)
    });
    
    this.closeFx = new Fx.Tween(this.element, {
      duration: 300, 
      transition: Fx.Transitions.Cubic.easeOut,
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
  }
});