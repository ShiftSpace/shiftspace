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
    this.document().body.addEvent('mouseenter', this.open.bind(this));
    this.document().body.addEvent('mouseleave', this.close.bind(this));
  },
  
  
  open: function()
  {
    var evt = new Event(_evt);
    if(!this.isOpen() && !this.isAnimating())
    {
      this.openFx.start('width', window.getSize().x);
      this.setIsOpen(true);
    }
  },
  
  
  close: function()
  {
    var evt = new Event(_evt);
    if(this.isOpen() && !this.isAnimating())
    {
      this.setIsOpen(false);
      this.closeFx.start('width', 200);
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
      }.bind(this)
    });
    
    this.closeFx = new Fx.Tween(this.element, {
      duration: 300, 
      transition: Fx.Transitions.Cubic.easeIn,
      onStart: function()
      {
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
    
    var size = this.document().body.getSize();
    
    this.initAnimations();
    this.attachEvents();
  }
});