var SSView = var new Class({
  Implements: Events,
  
  initialize: function(el)
  {
    this.element = $(el);
  },
  
  show: function()
  {
    this.element.removeClass('SSDisplayNone');
  },
  
  hide: function()
  {
    this.element.addClass('SSDisplayNone');
  }
});