// ==Builder==
// @uiclass
// @package           ShiftSpaceCoreUI
// @dependencies      SSFramedView
// ==/Builder==

var SSCommentPane = new Class({
  
  Extends: SSFramedView,
  name: 'SSCommentPane',

  initialize: function(el, options)
  {
    this.parent(el, options);
    this.setIsOpen(false);
    this.setIsVisible(false);
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
    var context = this.contentWindow();
    var doc = this.contentDocument();
  },
  
  
  onInterfaceLoad: function(ui)
  {
    this.parent(ui);
    this.element.setProperty('id', 'SSCommentPane');
    this.element.addClass("SSCommentPaneClosed");
  }.asPromise(),
  
  
  awake: function(context)
  {
  },
  
  
  onContextActivate: function(context)
  {
    if(context == this.element.contentWindow)
    {
      this.mapOutletsToThis();
    }
  },
  
  
  initAnimations: function()
  {
  },
  
  
  buildInterface: function()
  {
    this.parent();

    this.initAnimations();
    this.attachEvents();
    
    SSPostNotification('onCommentsLoad', this);
    this.setIsLoaded(true);
  },
  
  
  localizationChanged: function()
  {
  }
});