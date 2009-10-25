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
    this.spaceMenuIsVisible(false);
    
    this.refreshShiftCount();
    this.initGraph();
    
    SSAddObserver(this, 'onUserLogin', this.handleLogin.bind(this));
    SSAddObserver(this, 'onUserLogout', this.handleLogout.bind(this));
    
    SSAddObserver(this, 'onSync', this.handleSync.bind(this));
    
    SSAddObserver(this, 'onConsoleShow', this.onConsoleShow.bind(this));
    SSAddObserver(this, 'onConsoleHide', this.onConsoleHide.bind(this));
    
    SSAddObserver(this, 'onSpaceMenuShow', this.onSpaceMenuShow.bind(this));
    SSAddObserver(this, 'onSpaceMenuHide', this.onSpaceMenuHide.bind(this));
  },
  
  
  initGraph: function() {
    this.graph = new Fx.Graph(this.element, {
      controller: this,
      duration: 400,
      transition: Fx.Transitions.Cubic.easeIn,
      graph: {
        SSNotifierHidden: {
          first: true,
          next: 'SSNotifierHasShifts',
          selector: '.SSNotifierHidden',
          events: [
            {type: 'mouseover', state: 'SSNotifierOpen', flag: 'mouse'},
            {type: 'mouseout', state: 'SSNotifierHidden', direction:'previous', unflag: 'mouse', condition: {not: ['shift']}},
            {type: 'shiftdown', direction: 'next', flag: 'shift', condition: {not: ['mouse']}},
            {type: 'shiftup', state: 'SSNotifierHidden', direction: 'previous', unflag: 'shift', condition: {not: ['mouse']}}
          ]
        },
        SSNotifierHasShifts: {
          previous: 'SSNotifierHidden',
          next: 'SSNotifierShowDetails',
          selector: '.SSNotifierHasShifts',
          hold: {duration: 1000},
          events: [
            {type: 'mouseover', state: 'SSNotifierOpen', flag: 'mouse'},
            {type: 'mouseout', state: 'SSNotiferHasShifts', direction:'previous', unflag: 'mouse', condition: {not: ['shift']}},
            {type: 'shiftdown', direction: 'next', flag: 'shift', condition: {not: ['mouse']}},
            {type: 'shiftup', state: 'SSNotiferHasShifts', direction: 'previous', unflag: 'shift', condition: {not: ['mouse']}}
          ]
        },
        SSNotifierShowDetails: {
          previous: 'SSNotifierHasShifts',
          next: 'SSNotifierOpen',
          selector: '.SSNotifierShowDetails',
          hold: {duration: 1000},
          events: [
            {type: 'mouseover', direction: 'next', flag: 'mouse'},
            {type: 'mouseout', state: 'SSNotifierHasShifts', direction:'previous', unflag: 'mouse', condition: {not: ['shift']}},
            {type: 'shiftdown', direction: 'next', flag: 'shift', condition: {not: ['mouse']}},
            {type: 'shiftup', direction: 'previous', unflag: 'shift', condition: {not: ['mouse']}}
          ]
        },
        SSNotifierOpen: {
          last: true,
          previous: 'SSNotifierShowDetails',
          selector: '.SSNotifierOpen',
          events: [
            {type: 'showmenu', flag:'menu'},
            {type: 'hidemenu', unflag:'menu'},
            {type: 'showconsole', flag:'console'},
            {type: 'hideconsole', unflag:'console'},
            {type: 'mouseover', flag:'mouse'},
            {type: 'mouseout', state: 'SSNotifierHasShifts', direction: 'previous', unflag:'mouse', condition: {not: ['shift', 'menu', 'console']}},
            {type: 'shiftdown', flag:'shift'},
            {type: 'shiftup', state: 'SSNotifierHasShifts', direction: 'previous', unflag:'shift', condition: {not: ['mouse']}},
            {type: 'reset', state: 'SSNotifierHasShifts', direction: 'previous'}
          ]
        }
      }
    });
  },
  
  
  refreshShiftCount:function()
  {
    this.__count = SSApp.confirm(
      SSApp.get({
        resource:'shifts',
        action:"count",
        data:{
          byHref: window.location.href.split("#")[0]
        }
      })
    );
    
    var count = $get(this, '__count', 'data');
    if (!count)
    {
      this.__count = 0;
    }
    else
    {
      this.__count = count;
    }
  },
  
  
  getShiftCount: function()
  {
    if (this.__count == undefined) this.refreshShiftCount();
    return this.__count;
  },
  
  
  onConsoleShow: function()
  {
    this.show(false);
    this['open'](false);
    this.SSToggleConsole.set('text', "Close Console");
  },
  
  
  onConsoleHide: function()
  {
    this['close']();
    this.SSToggleConsole.set('text', "Open Console");
  },
  
  
  onSpaceMenuShow: function(spaceMenu)
  {
    this.setSpaceMenuIsVisible(true);
  },
  
  
  onSpaceMenuHide: function(spaceMenu)
  {
    this.setSpaceMenuIsVisible(false);
    if(!ShiftSpace.Console.isVisible())
    {
      this['close']();
    }
  },
  
  
  show: function(animate)
  {
    if(animate === false)
    {
      this.showComplete();
    }
    else
    {
      if(this.showFx)
      {
        if(!this.isVisible()) this.showFx.start(".SSNotifierVisible");
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
      left: ""
    });
    this.element.removeClass("SSNotifierHidden");
    this.element.addClass("SSNotifierVisible");
    this.setIsVisible(true);
  },
  
  
  hide: function()
  {
    if(ShiftSpace.Console.isVisible()) return;
    this.hideFx.start(".SSNotifierHidden");
  },
  
  
  handleSync: function()
  {
  },
  
  
  handleLogin: function()
  {
    this.refreshShiftCount();
    this.updateControls();
  },
  
  
  handleLogout: function()
  {
    this.refreshShiftCount();
    this.updateControls();
  },
  
  
  updateControls: function()
  {
    if (this.SSShiftCount) this.SSShiftCount.set('text', this.getShiftCount() + " shifts");
    if (this.SSUsername) this.SSUsername.set('text', ShiftSpace.User.getUserName());
    
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
  
  
  setSpaceMenuIsVisible: function(val)
  {
    this.__spaceMenuIsVisible = val;
  },
  
  
  spaceMenuIsVisible: function()
  {
    return this.__spaceMenuIsVisible;
  },
  
  
  attachEvents: function()
  {
    var context = this.contentWindow();
    var doc = this.contentDocument();
    
    context.$(doc.body).addEvent('mouseenter', function(evt) {
      this['open']();
    }.bind(this));
    
    context.$(doc.body).addEvent('mouseleave', function() {
      if(!this.shiftIsDown())
      {
        this['close']();
      }
    }.bind(this));
    
    this.attachConsoleEvents();
    this.attachKeyEvents();
    
    this.SSSelectSpace.addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      if(!this.spaceMenuIsVisible())
      {
        SSPostNotification('showSpaceMenu', this);
      }
      else
      {
        SSPostNotification('hideSpaceMenu', this);
        this['close']();
      }
    }.bind(this));
  },
  
  
  attachConsoleEvents: function()
  {
    this.SSToggleConsole.addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      if(ShiftSpace.Console.isVisible())
      {
        this.SSToggleConsole.set('text', "Open Console");
        ShiftSpace.Console.hide();
      }
      else
      {
        this.SSToggleConsole.set('text', "Close Console");
        ShiftSpace.Console.show();
      }
    }.bind(this));
    
    this.SSLogInOut.addEvent('click', function() {
      if(ShiftSpace.User.isLoggedIn())
      {
        ShiftSpace.User.logout();
      }
      else
      {
        ShiftSpace.Console.showLogin();
      }
    }.bind(this));
  },
  
  
  attachKeyEvents: function()
  {
    SSAddEvent('keyup', function(_evt) {
      var evt = new Event(_evt);
      if(evt.key == 'shift') this.handleKeyUp(evt);
    }.bind(this));

    SSAddEvent('keydown', function(_evt) {
      var evt = new Event(_evt);
      if(evt.key == 'shift') this.handleKeyDown(evt);
    }.bind(this));    
  },
  
  
  handleKeyDown: function(evt)
  {
  },
  
  
  handleKeyUp: function(evt)
  { 
  },
  
  
  'open': function(animate)
  {
  },
  
  
  'close': function(animate)
  {
  },
  
  
  showControls: function()
  {
    this.contentWindow().$$('.SSNotifierSubView').removeClass('SSActive');
    this.SSNotifierControlsView.addClass('SSActive');
  },
  
  
  hideControls: function()
  {
    this.contentWindow().$$('.SSNotifierSubView').removeClass('SSActive');
    this.SSNotifierDefaultView.addClass('SSActive');
  },
  
  
  onInterfaceLoad: function(ui)
  {
    this.parent(ui);
    this.element.setProperty('id', 'SSNotifier');
    this.element.addClass("SSNotifierHidden");
  }.asPromise(),
  
  
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
  },
  
  
  buildInterface: function()
  {
    this.parent();

    this.contentWindow().$$(".SSNotifierSubView").setStyles({
      "background-image": "url("+SSInfo().server+"images/shiftspace_icon.png)"
    });
    
    this.initAnimations();
    this.attachEvents();
    
    SSPostNotification('onNotifierLoad', this);
    this.setIsLoaded(true);
  },
  
  
  localizationChanged: function()
  {
    
  }
});