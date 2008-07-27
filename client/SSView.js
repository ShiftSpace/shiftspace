var SSView = new Class({
  
  Implements: Events,
  
  initialize: function(el)
  {
    this.__prebuilt__ = (el && true) || false;
    
    this.element = (el && $(el)) || (new Element('div'));
    this.element.addClass('ShiftSpaceElement');
    
    if(!this.__prebuilt__)
    {
      this.build();
    }
    
    this.__subviews__ = [];
  },
  
  
  eventDispatch: function(evt)
  {
    
  },
  
  
  hitTest: function(target, selectorOfTest)
  {
    var node = target;
    var matches = this.element.getElements(selectorOfTest);
    
    while(node && node != this.element)
    {
      if($A(matches).contains(node))
      {
        return node;
      }
      node = node.getParent();
    }
    
    return null;
  },
  
  
  controllerForSubView: function(node)
  {
    var nodesForSubViews = this.__subviews__.map(function(x) { return x.element; });
    return this.__subviews__[nodesForSubViews.indexOf(node)];
  },
  
  
  show: function()
  {
    this.element.removeClass('SSDisplayNone');
  },
  
  
  hide: function()
  {
    this.element.addClass('SSDisplayNone');
  },
  
  
  refresh: function()
  {
    
  },
  
  
  build: function()
  {
    
  }
  
});

if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.SSView = SSView;
}