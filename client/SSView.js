var SSView = new Class({
  
  name: 'SSView',

  Implements: Events,
  
  /*
    Function: _genId
      Generate an object id.  Used for debugging.  The instance is indentified by this in the global
      ShiftSpace.Objects hash.
  */
  _genId: function()
  {
    return (this.name+(Math.round(Math.random()*1000000+(new Date()).getMilliseconds())));
  },
  
  /*
    Function: initialize
      Takes an element and controls it.
      
    Parameters:
      el - a HTML Element.
  */
  initialize: function(el)
  {
    // generate an id
    this.__id__ = this._genId();
    
    // add to global hash
    if(ShiftSpace.Objects) ShiftSpace.Objects.set(this.__id__, this);
    
    // check if we are prebuilt
    this.__prebuilt__ = (el && true) || false;
    this.__ssviewcontrollers__ = [];
    this.__delegate__ = null;
    this.__outlets__ = new Hash();
    
    this.element = (el && $(el)) || (new Element('div'));
    // NOTE: the following breaks tables, so we should avoid it for now - David
    //this.element.setProperty('class', 'ShiftSpaceElement '+this.element.getProperty('class'));
    
    // store a back reference to this class
    this.element.store('__ssviewcontroller__', this);
    
    // We need to build this class via code
    if(!this.__prebuilt__)
    {
      this.build();
    }
    
    this.__subviews__ = [];
  },
  
  /*
    Function: awake 
      Called after the outlets have been attached.
  */
  awake: function()
  {
    console.log(this.getId() + " awake, outlets " + JSON.encode(this.outlets().getKeys()));
  },
  
  /*
    Function: getId
      Returns the id for this instance.
      
    Returns:
      The instance id as a string.
  */
  getId: function()
  {
    return this.__id__;
  },
  
  
  setOutlets: function(newOutlets)
  {
    this.__outlets__ = newOutlets;
  },
  
  
  outlets: function()
  {
    return this.__outlets__;
  },
  
  
  addOutlet: function(element)
  {
    var outletKey = element.getProperty('outlet');
    this.outlets().set(element.getProperty('id'), element);
  },
  
  
  /*
    Function: setDelegate
      Set the delegate of this instance.
      
    Parameters:
      delegate - an Object.
  */
  setDelegate: function(delegate)
  {
    this.__delegate__ = delegate
  },
  
  /*
    Function: delegate
      Returns the delegate for this instance.
  */
  delegate: function()
  {
    return this.__delegate__;
  },
  
  
  eventDispatch: function(evt)
  {
    
  },
  
  /*
    Function: hitTest
      Matches a target to see if it occured in an element pointed to by the selector test.
      
    Parameters:
      target - the HTML node where the event originated.
      selectorOfTest - the CSS selector to match against.
  */
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
  
  /*
    Function: setCachedHit
      Used in conjunction with hitTest.  This is because hitTest may be slow, so you shouldn't have to call it twice.
      If there was a successful hit you should get it from cachedHit instead of calling hitTest again.
      
    See Also:
      hitTest, cachedHit
  */
  setCachedHit: function(node)
  {
    this.__cachedHit__ = node;
  },
  
  /*
    Function: cachedHit
      Returns the hit match that was acquired in hitTest.
      
    Returns:
      An HTML Element.
  */
  cachedHit: function()
  {
    return this.__cachedHit__;
  },
  
  /*
    Function: controllerForNode
      Returns the view controller JS instance for an HTML Element.
  */
  controllerForNode: function(node)
  {
    // return the storage property
    if(node)
    {
      var hasController = node.getProperty('uiclass');
      var controller = node.retrieve('__ssviewcontroller__');
      
      if(hasController && !controller)
      {
        return new SSViewProxy(node);
      }

      if(hasController && controller)
      {
        return controller;
      }
      
      return null
    }
    else
    {
      return null;
    }
  },
  
  // will probably be refactored
  addControllerForNode: function(node, controllerClass)
  {
    // instantiate and store
    this.__ssviewcontrollers__.push(new controllerClass(node));
  },
  
  // will probably be refactored
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
  
  /*
    Function: show
      Used to show the interface associated with this instance.
  */
  show: function()
  {
    this.element.addClass('SSActive');
    this.element.removeClass('SSDisplayNone');
  },
  
  /*
    Function: hide
      Used to hide the interface assocaited with this instance.
  */
  hide: function()
  {
    this.element.removeClass('SSActive');
    this.element.addClass('SSDisplayNone');
  },
  
  /*
    Function: destroy
      Used to destroy this instance as well as the interface associated with it.
  */
  destroy: function()
  {
    this.removeControllerForNode(this.element);
    this.element.destroy();
    delete this;
  },
  
  /*
    Function: refresh (abstract)
      To be implemented by subclasses.
  */
  refresh: function()
  {
    
  },
  
  /*
    Function: build (abstract)
      To be implemented by subclasses.
  */
  build: function()
  {
    
  },
  
  
  localizationChanged: function(newLocalization)
  {
    console.log('localizationChanged');
  }
  
});


SSInstantiationListeners = {};
function SSAddInstantiationListener(element, listener)
{
  var id = element._ssgenId();
  if(!SSInstantiationListeners[id])
  {
    SSInstantiationListeners[id] = [];
  }
  SSInstantiationListeners[id].push(listener);
}

function SSNotifyInstantiationListeners(element)
{
  var listeners = SSInstantiationListeners[element.getProperty('id')];
  if(listeners)
  {
    listeners.each(function(listener) {
      if(listener.onInstantiate) 
      {
        listener.onInstantiate();
      }
    });
  }
}

// Add it the global UI class lookup
if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.SSView = SSView;
}