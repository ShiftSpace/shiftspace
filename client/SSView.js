var SSView = new Class({
  
  name: 'SSView',

  Implements: Events,
  
  _genId: function()
  {
    return (this.name+(Math.round(Math.random()*1000000+(new Date()).getMilliseconds())));
  },
  
  initialize: function(el)
  {
    // generate an id
    this.__id__ = this._genId();
    
    // add to global hash
    if(ShiftSpace.Objects) ShiftSpace.Objects[this.__id__] = this;
    
    // check if we are prebuilt
    this.__prebuilt__ = (el && true) || false;
    this.__ssviewcontrollers__ = [];
    this.__delegate__ = null;
    
    this.element = (el && $(el)) || (new Element('div'));
    this.element.setProperty('class', 'ShiftSpaceElement '+this.element.getProperty('class'));
    
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
  
  
  getId: function()
  {
    return this.__id__;
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