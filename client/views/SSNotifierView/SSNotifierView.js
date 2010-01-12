// ==Builder==
// @uiclass
// @framedView
// @package           ShiftSpaceCoreUI
// @dependencies      SSFramedView
// ==/Builder==

var SSNotifierView = new Class({
  
  Extends: SSFramedView,
  name: 'SSNotifierView',

  initialize: function(el, options)
  {
    this.parent(el, options);
    
    SSAddObserver(this, 'onUserLogin', this.update.bind(this));
    SSAddObserver(this, 'onUserJoin', this.update.bind(this));
    SSAddObserver(this, 'onUserLogout', this.update.bind(this));
    SSAddObserver(this, 'onConsoleShow', this.onConsoleShow.bind(this));
    SSAddObserver(this, 'onConsoleHide', this.onConsoleHide.bind(this));
    SSAddObserver(this, 'onSpaceMenuShow', this.onSpaceMenuShow.bind(this));
    SSAddObserver(this, 'onSpaceMenuHide', this.onSpaceMenuHide.bind(this));
    SSAddObserver(this, 'onNewShiftSave', this.onNewShiftSave.bind(this));
    SSAddObserver(this, 'onMessageRead', function() {
      this.updateMessageCount(SSUserUnreadCount(ShiftSpace.User.getUserName()));
    }.bind(this));

    this.attachFinishKeyEvents();
  },
  
  
  onSpaceMenuShow: function()
  {
    this.__menuVisible = true;
    this.fireEvent('showmenu');
  }.decorate(ssfv_ensure),
  
  
  onSpaceMenuHide: function()
  {
    this.__menuVisible = false;
    this.fireEvent('hidemenu');
  },
  
  
  onNewShiftSave: function()
  {
    if (this.__count !== null || this.__count !== undefined)
    {
      this.__count++;
      this.updateCounter();
    }
  },
  
  updateCounter: function()
  {
    //TODO: pluralization should be handled more smartly - 10/28/09 by ljxia
    var text = this.__count + " shift";
    if (this.__count > 1) text += 's';
    if (this.SSShiftCount) this.SSShiftCount.set('text', text);
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
            {type: 'mouseout', state: 'SSNotifierHidden', unflag: 'mouse', condition: {not: ['shift']}},
            {type: 'shiftdown', direction: 'next', flag: 'shift', condition: {not: ['mouse']}},
            {type: 'shiftup', state: 'SSNotifierHidden', unflag: 'shift', condition: {not: ['mouse']}}
          ]
        },
        SSNotifierHasShifts: {
          previous: 'SSNotifierHidden',
          next: 'SSNotifierShowDetails',
          selector: '.SSNotifierHasShifts',
          hold: {duration: 500},
          events: [
            {type: 'mouseover', state: 'SSNotifierOpen', flag: 'mouse'},
            {type: 'mouseout', state: 'SSNotifierHasShifts', unflag: 'mouse', condition: {not: ['shift']}},
            {type: 'shiftdown', direction: 'next', flag: 'shift', condition: {not: ['mouse']}},
            {type: 'shiftup', state: 'SSNotifierHasShifts', unflag: 'shift', condition: {not: ['mouse']}}
          ]
        },
        SSNotifierShowDetails: {
          previous: 'SSNotifierHasShifts',
          next: 'SSNotifierOpen',
          selector: '.SSNotifierShowDetails',
          hold: {duration: 1000},
          events: [
            {type: 'mouseover', direction: 'next', flag: 'mouse'},
            {type: 'mouseout', state: 'SSNotifierHasShifts', unflag: 'mouse', condition: {not: ['shift']}},
            {type: 'shiftdown', direction: 'next', flag: 'shift', condition: {not: ['mouse']}},
            {type: 'shiftup', direction: 'previous', unflag: 'shift', condition: {not: ['mouse']}}
          ]
        },
        SSNotifierOpen: {
          last: true,
          previous: 'SSNotifierShowDetails',
          styles: function() { return { width: window.getSize().x }; },
          onComplete: function(el, fxgraph) {
            // this is called when we enter the final state
            el.addClass('SSNotifierOpen');
            this.showControls(); 
          }.bind(this),
          onExit: function(el, fxgraph) {
            // this is called when we leave the final state
            el.removeClass('SSNotifierOpen');
            this.hideControls(); 
            el.setStyles({
              width: window.getSize().x,
              left: 0
            });
          }.bind(this),
          events: [
            {type: 'showmenu', flag:'menu'},
            {type: 'hidemenu', unflag:'menu'},
            {type: 'showconsole', flag:'console'},
            {type: 'hideconsole', unflag:'console'},
            {type: 'mouseover', flag:'mouse'},
            {type: 'mouseout', state: 'SSNotifierHasShifts', unflag:'mouse', condition: {not: ['shift', 'menu', 'console']}},
            {type: 'shiftdown', flag:'shift'},
            {type: 'shiftup', state: 'SSNotifierHasShifts', unflag:'shift', condition: {not: ['mouse', 'menu', 'console']}}
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
  refreshShiftCount: function()
  {
    var p = SSApp.get({
      resource:'shifts',
      action:"count",
      data:{
        byHref: window.location.href.split("#")[0]
      }
    });
    
    this.updateShiftCount(p);
  },
  
  refreshMessageCount: function()
  {
    if(this.isLoaded())
    {
      if(ShiftSpace.User.isLoggedIn())
      {
        this.updateMessageCount(SSUserUnreadCount(ShiftSpace.User.getUserName()));
      }
      else
      {
        this.SSMessage.hide();
      }
    }
  },
  

  onConsoleShow: function()
  {
    this.graph.cancel(true);
    this.graph.setState('SSNotifierOpen', {animate:false});
    
    this.fireEvent('showconsole');
    this.SSToggleConsole.addClass('open');
    this.SSToggleConsole.set('text', "Close Console");
  },
  
  
  onConsoleHide: function()
  {
    this.fireEvent('hideconsole');
    this.SSToggleConsole.removeClass('open');
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
      this.graph.setState("SSNotifierOpen", {animate:false});
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
  
  /*
    Function: update
      *private*
      Update the controls in the notifier view.
  */
  update: function()
  {
    this.refreshShiftCount();
    this.refreshMessageCount();
    if (this.SSUsername) this.SSUsername.set('text', ShiftSpace.User.getUserName());
    
    if(this.SSLogInOut)
    {
      if(ShiftSpace.User.isLoggedIn())
      {
        this.SSLogInOut.set('text', 'Logout');
      }
      else
      {
        this.SSLogInOut.set('text', 'Login');
      }
    }
  },

  /*
    Function: updateShiftCount
      *private*
      Update the shift counter in the notifier view.
  */
  updateShiftCount: function(countp)
  {
    if(countp > 0 && this.delayed()) this.finish();
    
    this.__count = countp;
    this.updateCounter();
    
    if (this.__count > 0 && this.graph && this.graph.state() != "SSNotifierOpen")
    {
      this.graph.setState('SSNotifierHasShifts', {animate:true, direction:'previous', hold:{duration:3000}});
    }
  }.asPromise(),
  

  updateMessageCount: function(count)
  {
    if(this.SSMessage)
    {
      if (count > 0)
      {
        this.SSMessage.show();
        this.SSShowMessage.set('text', count);
      }
      else
      {
        this.SSMessage.hide();
      }
    }
  }.asPromise(),
  

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
        this.SSToggleConsole.removeClass('open');
        this.SSToggleConsole.set('text', "Open Console");
        ShiftSpace.Console.hide();
      }
      else
      {
        this.SSToggleConsole.addClass('open');
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
    
    this.SSMessage.addEvent('click',function() {
      ShiftSpace.Console.showInbox();
    }.bind(this));
  },


  attachFinishKeyEvents: function()
  {
    SSAddEvent('keydown', function(evt) {
      evt = new Event(evt);
      if(evt.key == 'shift' && this.delayed())
      {
        this.addEvent("load", function() {
          this.fireEvent("shiftdown");
        }.bind(this));
        this.finish();
      }
    }.bind(this));

    SSAddEvent('keydown', this.handleKeyDown.bind(this));
    SSAddEvent('keyup', this.handleKeyUp.bind(this));
  },


  handleKeyDown: function(evt)
  {
    evt = new Event(evt);
    if(evt.key == 'shift')
    {
      this.shiftDownTime = $time();
      this.shiftDown = true;
    }
  },
  
  
  handleKeyUp: function(evt)
  {
    evt = new Event(evt);
    if(this.shiftDown)
    {
      var delta = $time() - this.shiftDownTime;
    }
    if(evt.key == 'shift') this.shiftDown = false;
    if(this.shiftDown && 
       evt.key == 'space' &&
       delta >= 300)
    {
      SSPostNotification("toggleConsole");
      evt.preventDefault();
      evt.stop();
    }
  },
  
  
  attachKeyEvents: function()
  {
    SSAddEvent('keyup', function(evt) {
      evt = new Event(evt);
      if(evt.key == 'shift')
      {
        if(this.delayed())
        {
          SSLog("finish", SSLogForce);
          this.finish();
        }
        this.fireEvent('shiftup');
      }
    }.bind(this));

    SSAddEvent('keydown', function(evt) {
      evt = new Event(evt);
      if(evt.key == 'shift')
      {
        if(this.delayed())
        {
          SSLog("finish", SSLogForce);
          this.finish();
        }
        this.fireEvent('shiftdown');
      }
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
  
  
  localizationChanged: function()
  {
    
  },
  
  /* SSFramedView Stuff ---------------------------------------- */

  onInterfaceLoad: function(ui)
  {
    this.parent(ui);
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
      this.update();
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
  }

});