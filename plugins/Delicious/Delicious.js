var DeliciousPlugin = ShiftSpace.Plugin.extend({
  
  Extends: ShiftSpace.Plugin,

  pluginType: ShiftSpace.Plugin.types.get('kInterfaceTypePlugin'),

  attributes:
  {
    name: 'Delicious',
    title: null,
    icon: null,
    css: 'Delicious.css',
    version: 0.1
  },
  
  setup: function() {
    
  },
  
  showDeliciousWindow: function(shiftId) {
    this.showInterface(this);
  },
  
  showInterface: function(animate)
  {
    SSLog('Showing Delicious interface', SSLogPlugin);
    if(!this.isShowing())
    {
      this.setIsShowing(true);
      
      if(!this.interfaceIsBuilt())
      {
        this.buildInterface();
      }
    
      this.element.removeClass('SSDisplayNone');
    
      if(!this.isVisible())
      {
        ShiftSpace.Console.halfMode(function() {
          var resizeFx = this.element.effects({
            duration: 300,
            transition: Fx.Transitions.Cubic.easeIn,
            onComplete: function()
            {
              this.setIsVisible(true);
              this.setIsShowing(false);
            }.bind(this)
          });
    
          resizeFx.start({
            height: [0, 370]
          });
        }.bind(this));
      }
    }
  },
  

  hideInterface: function(animate)
  { 
    SSLog('hideInterface');
    if(this.interfaceIsBuilt() && !this.isHiding())
    {
      this.setIsHiding(true);
      
      // put the Console back to normal width
      var resizeFx = this.element.effects({
        duration: 300,
        transition: Fx.Transitions.Cubic.easeIn,
        onComplete: function() {
          this.setIsShowing(false);
          this.setIsHiding(false);
          // hide ourselves
          this.element.addClass('SSDisplayNone');
          this.setIsVisible(false);
          ShiftSpace.Console.fullMode();
        }.bind(this)
      });
    
      resizeFx.start({
        height: [this.element.getStyle('height'), 0]
      });
    }
  },
  

  setIsHiding: function(newValue)
  {
    this.__isHiding__ = newValue;
  },
  
  
  isHiding: function()
  {
    return this.__isHiding__;
  },
  
  
  setIsShowing: function(newValue)
  {
    this.__isShowing__ = newValue;
  },


  isShowing: function()
  {
    return this.__isShowing__;
  },
  
  
  setIsVisible: function(newValue)
  {
    this.__isVisible__ = newValue;
  },
  
  
  isVisible: function()
  {
    return this.__isVisible__;
  },
  
  buildInterface: function()
  {
    SSLog('Building Delicious interface', SSLogPlugin);
    this.setInterfaceIsBuilt(true);
    
    this.element = new ShiftSpace.Element('div', {
      id: 'SSDelicious',
      'class': 'InShiftSpace SSDisplayNone',
      'height': 0
    });
    
    this.header = new ShiftSpace.Element('div', {
      id: "del-header",
      'class': "InShiftSpace"
    });
    
    this.body = new ShiftSpace.Element('div', {
      id: "del-body",
      'class': "InShiftSpace"
    });
    
    this.header.setHTML('<div class="del-minimize" title="Hide Delicious"/></div>');
		                       
    this.header.injectInside(this.element);
    this.body.injectInside(this.element);
    
    this.element.injectInside(document.body);
    
    this.frameWrapper = new ShiftSpace.Element('div', {
      id: "SSDeliciousFrameWrapper"
    });
    
    this.frameWrapper.injectInside(this.body);
    
    // add the iframe after the main part is in the DOM
    this.frame = new ShiftSpace.Iframe({
      id: "SSDeliciousFrame", 
      onload: this.frameLoaded.bind(this)
    });
    
    this.frame.injectInside(this.frameWrapper);
    
    this.minimizer = $$('.del-minimize')[0];
		this.attachEvents();
  },
  
  attachEvents: function()
  {
    SSLog('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
    SSLog('attachEvents ' + this.minimizer);

    this.minimizer.addEvent('click', this.hideInterface.bind(this));

    var overflow = $(document.body).getStyle('overflow');

    this.element.makeResizable({
      modifiers: {x:'', y:'height'},
      invert: true,
      handle: this.comCount,
      onStart: function()
      {
        var windowSize = window.getSize().size;
        var windowScrollSize = window.getSize().scrollSize;
        var setOverflow = (windowSize.y == windowScrollSize.y);
        
        if(setOverflow) $(document.body).setStyle('overflow', 'hidden');
      },
      onComplete: function()
      {
        var windowSize = window.getSize().size;
        var windowScrollSize = window.getSize().scrollSize;
        var setOverflow = (windowSize.y == windowScrollSize.y);

        if(setOverflow) $(document.body).setStyle('overflow', overflow);
      }
    });
    
  },
  
  
  frameLoaded: function()
  {
    SSLog('frame loaded');
    this.loadStyle('Comments.css', this.frameCSSLoaded.bind(this), this.frame);
  },
  
  
  frameCSSLoaded: function()
  {
    // now we can add the html stuff
    SSLog('frame CSS loaded');
    
    if(this.delayedContent)
    {
      this.update(this.delayedContent);
      delete this.delayedContent;
    }
  },
  
  
  update: function(json)
  {
    SSLog('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> update');
    
    this.frame.contentWindow.document.body.innerHTML = json.html;
    
    // attach events
    // can listen to window events?
    var self = this;
    
    /*var replyButton =  $(ShiftSpace._$(this.frame.contentWindow.document.body).getElementByClassName('com-reply'));
    if(replyButton) replyButton.addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      SSLog('scroll!');
      self.frame.contentWindow.scrollTo(0, $(self.frame.contentWindow.document.body).getSize().size.y);
    });
    
    var submitButton = $(this.frame.contentWindow.document.getElementById('submit'));
    if(submitButton) submitButton.addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      self.addComment();
    });*/
  },
  
});

var Delicious = new DeliciousPlugin();
ShiftSpace.__externals__.Delicious = Delicious; // For Safari
