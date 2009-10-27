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
    
    this.refreshShiftCount();
    
    SSAddObserver(this, 'onUserLogin', this.handleLogin.bind(this));
    SSAddObserver(this, 'onUserJoin', this.handleLogin.bind(this));
    SSAddObserver(this, 'onUserLogout', this.handleLogout.bind(this));

    SSAddObserver(this, 'onSync', this.handleSync.bind(this));

    SSAddObserver(this, 'onConsoleShow', this.onConsoleShow.bind(this));
    SSAddObserver(this, 'onConsoleHide', this.onConsoleHide.bind(this));
    
    SSAddObserver(this, 'onSpaceMenuShow', this.onSpaceMenuShow.bind(this));
    SSAddObserver(this, 'onSpaceMenuHide', this.onSpaceMenuHide.bind(this));
  },
  
  
  onSpaceMenuShow: function()
  {
    this.__menuVisible = true;
    this.fireEvent('showmenu');
  },
  
  
  onSpaceMenuHide: function()
  {
    this.__menuVisible = false
    this.fireEvent('hidemenu');
  },
  
  
  initGraph: function() {
    this.graph = new Fx.Graph(this.element, {
      controller: this,
      duration: 300,
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
          hold: {duration: 500},
          events: [
            {type: 'mouseover', state: 'SSNotifierOpen', flag: 'mouse'},
            {type: 'mouseout', state: 'SSNotifierHasShifts', direction:'previous', unflag: 'mouse', condition: {not: ['shift']}},
            {type: 'shiftdown', direction: 'next', flag: 'shift', condition: {not: ['mouse']}},
            {type: 'shiftup', state: 'SSNotifierHasShifts', direction: 'previous', unflag: 'shift', condition: {not: ['mouse']}}
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
          styles: function() { return { width: window.getSize().x }; },
          onComplete: function(el, fxgraph) { 
            el.addClass('SSNotifierOpen'); 
            this.showControls(); 
          }.bind(this),
          onExit: function(el, fxgraph) {
            el.removeClass('SSNotifierOpen'); 
            this.hideControls(); 
            el.setStyle('width', window.getSize().x);
          }.bind(this),
          events: [
            {type: 'showmenu', flag:'menu'},
            {type: 'hidemenu', unflag:'menu'},
            {type: 'showconsole', flag:'console'},
            {type: 'hideconsole', unflag:'console'},
            {type: 'mouseover', flag:'mouse'},
            {type: 'mouseout', state: 'SSNotifierHasShifts', direction: 'previous', unflag:'mouse', condition: {not: ['shift', 'menu', 'console']}},
            {type: 'shiftdown', flag:'shift'},
            {type: 'shiftup', state: 'SSNotifierHasShifts', direction: 'previous', unflag:'shift', condition: {not: ['mouse', 'menu', 'console']}}
          ]
        }
      }
    });
  },
  
  /*
    Function: refreshShiftCount
      *private*
      Refreshes the shift count from the server.
  */
  refreshShiftCount:function()
  {
    // TODO: make async - David 10/26/09
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
  
  /*
    Function: getShiftCount
      *private*
      Return the shift count.
      
    Returns:
      An integer.
  */
  getShiftCount: function()
  {
    if (this.__count == undefined) this.refreshShiftCount();
    return this.__count;
  },
  
  
  onConsoleShow: function()
  {
    this.graph.cancel(true);
    this.graph.setState('SSNotifierOpen', false);
    
    this.fireEvent('showconsole');
    this.SSToggleConsole.set('text', "Close Console");
  },
  
  
  onConsoleHide: function()
  {
    this.fireEvent('hideconsole');
    this.SSToggleConsole.set('text', "Open Console");
  },
  
  /*
    Function: show
      Show the notifier. Simply shows the ShiftSpace logo notifying
      the user that there are shifts.
      
    Parameters:
      animate - boolean, whether to animate to the 
  */
  show: function(animate)
  {
    if(animate === false)
    {
      this.graph.setState("SSNotifierOpen", false);
    }
    else
    {
      if(this.isLoaded())
      {
        if(!this.isVisible()) this.setState('SSNotifierShowDetails');
      }
      else
      {
        SSAddObserver(this, 'onNotifierLoad', this.show.bind(this));
      }
    }
  },
  
  /*
    Function: hide
      Hide the notifier.
  */
  hide: function()
  {
    if(ShiftSpace.Console.isVisible()) return;
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
  
  /*
    Function: updateControls
      *private*
      Update the controls in the notifier view.
  */
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
  
  
  attachEvents: function()
  {
    var context = this.contentWindow();
    var doc = this.contentDocument();
    
    context.$(doc.body).addEvent('mouseenter', this.fireEvent.bind(this, ['mouseover']));
    context.$(doc.body).addEvent('mouseleave', this.fireEvent.bind(this, ['mouseout']));
    
    this.attachConsoleEvents();
    this.attachKeyEvents();
    
    this.SSSelectSpace.addEvent('click', function(evt) {
      evt = new Event(evt);
      if(!this.__menuVisible)
      {
        SSPostNotification('showSpaceMenu', this);
      }
      else
      {
        SSPostNotification('hideSpaceMenu', this);
      }
    }.bind(this));
  },
  
  
  attachConsoleEvents: function()
  {
    this.SSToggleConsole.addEvent('click', function(evt) {
      evt = new Event(evt);
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
    SSAddEvent('keyup', function(evt) {
      evt = new Event(evt);
      if(evt.key == 'shift') this.fireEvent('shiftup');
    }.bind(this));

    SSAddEvent('keydown', function(evt) {
      evt = new Event(evt);
      if(evt.key == 'shift') this.fireEvent('shiftdown');
    }.bind(this));
  },
  
  
  showControls: function()
  {
    this.contentWindow().$$('.SSNotifierSubView').removeClass('SSActive');
    this.contentWindow().$('SSNotifierControlsView').addClass('Open');
    this.SSNotifierControlsView.addClass('SSActive');
  },
  
  
  hideControls: function()
  {
    this.contentWindow().$$('.SSNotifierSubView').removeClass('SSActive');
    this.contentWindow().$('SSNotifierControlsView').removeClass('Open');
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
  
  
  buildInterface: function()
  {
    this.parent();
    this.contentWindow().$$(".SSNotifierSubView").setStyles({
      "background-image": "url("+SSInfo().server+"images/shiftspace_icon.png)"
    });
    this.attachEvents();
    this.initGraph();
    SSPostNotification('onNotifierLoad', this);
    this.setIsLoaded(true);
  },
  
  
  localizationChanged: function()
  {
    
  }
});