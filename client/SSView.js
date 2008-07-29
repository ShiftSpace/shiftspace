var SSView = new Class({
  
  Implements: Events,
  
  initialize: function(el)
  {
    // check if we are prebuilt
    this.__prebuilt__ = (el && true) || false;
    this.__ssviewcontrollers__ = [];
    this.__delegate__ = null;
    
    this.element = (el && $(el)) || (new Element('div'));
    this.element.addClass('ShiftSpaceElement');
    
    // store a back reference to this class
    console.log('Adding __ssviewcontroller__ to ' + this.element);
    this.element.store('__ssviewcontroller__', this);
    
    // We need to build this class via code
    if(!this.__prebuilt__)
    {
      this.build();
    }
    
    this.__subviews__ = [];
  },
  
  
  setDelegate: function(delegate)
  {
    this.__delegate__ = delegate
  },
  
  
  delegate: function()
  {
    return this.__delegate__;
  },
  
  
  eventDispatch: function(evt)
  {
    
  },
  
  
  hitTest: function(target, selectorOfTest)
  {
    var node = target;
    var matches = this.element._getElements(selectorOfTest);
    
    while(node && node != this.element)
    {
      if(matches.contains(node))
      {
        this.setCachedHit(node);
        return node;
      }
      node = node.getParent();
    }
    
    return null;
  },
  
  
  setCachedHit: function(node)
  {
    this.__cachedHit__ = node;
  },
  
  
  cachedHit: function()
  {
    return this.__cachedHit__;
  },
  
  
  controllerForNode: function(node)
  {
    // return the storage property
    if(node)
    {
      return node.retrieve('__ssviewcontroller__');
    }
    else
    {
      return null;
    }
  },
  

  addControllerForNode: function(node, controllerClass)
  {
    // instantiate and store
    this.__ssviewcontrollers__.push(new controllerClass(node));
  },
  
  
  removeControllerForNode: function(node)
  {
    // get the controller
    var controller = node.retrieve('__ssviewcontroller__');
    if(controller)
    {
      // clear out the storage
      node.store('__ssviewcontroller__', null);

      if(this.__ssviewcontroller__.contains(controller))
      {
        // remove from internal array
        this.__ssviewcontrollers__.remove(controller);
      }
    }
  },
  
  
  show: function()
  {
    this.element.addClass('SSActive');
    this.element.removeClass('SSDisplayNone');
  },
  
  
  hide: function()
  {
    this.element.removeClass('SSActive');
    this.element.addClass('SSDisplayNone');
  },
  
  
  destroy: function()
  {
    this.removeControllerForNode(this.element);
    this.element.destroy();
    delete this;
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