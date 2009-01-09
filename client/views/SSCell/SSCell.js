// ==Builder==
// @uiclass
// @optional
// @package           ShiftSpaceCoreUI
// @dependencies      SSView
// ==/Builder==

// ==============
// = Exceptions =
// ==============

var SSCellError = SSException;

SSCellError.NoSuchProperty = new Class({
  name:"SSCellError.NoSuchProperty",
  Extends: SSCellError,
  Implements: SSExceptionPrinter
});

SSCellError.NoLock = new Class({
  name:"SSCellError.NoLock",
  Extends: SSCellError,
  Implements: SSExceptionPrinter
});

SSCellError.MissingAccessor = new Class({
  name:"SSCellError.MissingAccessor",
  Extends: SSCellError,
  Implements: SSExceptionPrinter
});

SSCellError.NoSuchTarget = new Class({
  name:"SSCellError.NoSuchTarget",
  Extends: SSCellError,
  Implements: SSExceptionPrinter
});

// ====================
// = Class Definition =
// ====================

var SSCell = new Class({

  name: 'SSCell',
  Extends: SSView,

  initialize: function(el, options)
  {
    this.parent(el, options);
    
    this.initActions();
    this.attachEvents();
    this.prepareClone();
    
    if(this.options.properties)
    {
      this.setPropertyList(this.options.properties);
    }
  },
  
  
  attachEvents: function()
  {
    this.element.addEvent('click', this.eventDispatch.bindWithEvent(this, 'click'));
  },
  
  
  setProxy: function(newProxy)
  {
    this.__proxy = newProxy;
  },
  
  
  proxy: function()
  {
    return this.__proxy;
  },


  forwardToProxy: function(methodName)
  {
    var proxy = this.proxy();
    if(proxy && proxy[methodName])
    {
      proxy[methodName](this);
    }
  },
  
  
  initActions: function()
  {
    if(this.options.actions)
    {
      this.setActions(this.options.actions);
    }
  },
  
  
  eventDispatch: function(_event, eventType)
  {
    var event = new Event(_event);
    
    var action = this.actionForNode(event.target);
    
    if(action)
    {
      this.runAction(action);
    }
    
    if(this.delegate() && this.delegate().onCellClick)
    {
      this.delegate().onCellClick(event.target);
    }
  },
  
  
  runAction: function(action, event)
  {
    var target = ShiftSpaceNameTable[action.target];
    var method = ((target && target[action.method] && target[action.method].bind(target)) || 
                  (action.target == 'SSProxiedTarget' && this.forwardToProxy.bind(this, [action.method]))) ||
                  null;
                  
    if(!method)
    {
      throw (new SSCellError.NoSuchTarget(new Error(), "target " + target + " does not exist."));
    }
    
    method(this, event);
  },
  
  
  actionForNode: function(node)
  {
    if(!this.lockedElement()) throw new SSCellError.NoLock(new Error(), "actionForNode called with no locked element.");
    var ary = this.getActions().filter(function(x) {
      return this.lockedElement().getElements('> ' + x.selector).contains(node);
    }.bind(this));
    if(ary.length > 0) return ary[0];
    return null;
  },
  
  
  setActions: function(actions)
  {
    this.__actions = actions;
  },
  
  
  getActions: function()
  {
    return this.__actions;
  },
  
  
  setPropertyList: function(propertyList)
  {
    this.__properties = propertyList;
  },
  
  
  getPropertyList: function()
  {
    return this.__properties;
  },
  
  
  verifyPropertyAccess: function()
  {
    this.getPropertyList().each(function(property) {
      if(!this['get'+property.capitalize()] || !this['set'+property.capitalize()])
      {
        throw new SSCellError.MissingAccessor(new Error(), "missing accessor for " + property);
      }
    }.bind(this));
  },
  
  
  setData: function(data)
  {
    var propertyList = this.getPropertyList();
    $H(data).each(function(value, property) {
      if(propertyList.contains(property)) this.setProperty(property, value);
    }.bind(this));
  },
  
  
  getData: function()
  {
    var args = $A(arguments);
    if((args.length == 1) && (args[0] instanceof Array))
    {
      args = $A(args[0]);
    }
    return args.map(this.getProperty.bind(this)).associate(args);
  },
  
  
  setProperty: function(property, value)
  {
    console.log('setProperty');
    if(!this.isLocked()) throw new SSCellError.NoLock(new Error(), "attempt to set property " + property + " without element lock.");
    if(!this.getPropertyList().contains(property)) throw new SSCellError.NoSuchProperty(new Error(), "no such property " + property);
    console.log('setProperty ' + property + ' ' + value);
    var setter = 'set'+property.capitalize();
    if(this[setter])
    {
      this[setter](value);
    }
  },
  
  
  getProperty: function(property)
  {
    if(!this.isLocked()) throw new SSCellError.NoLock(new Error(), "attempt to get property " + property + " without element lock.");
    if(!this.getPropertyList().contains(property)) throw new SSCellError.NoSuchProperty(new Error(), "no such property " + property);
    var getter = 'get'+property.capitalize();
    if(this[getter])
    {
      return this[getter]();
    }
    return null;
  },
  
  
  prepareClone: function()
  {
    var clone = this.element.clone(true);
    
    clone.removeClass('SSCell');
    clone.removeProperty('options');
    clone.removeProperty('uiclass');
    clone.removeProperty('outlet');
    
    this.__modelClone = clone;
  },
  
  /*
    Function: clone
      Creates a clone of the DOM model and returns it.
      
    Returns:
      A DOM node.
  */
  clone: function()
  {
    var clone = this.__modelClone.clone(true);
    
    if(clone.getElement('*[uiclass]'))
    {
      Sandalphon.activate(clone);
    }
    
    return clone;
  },
  
  /*
    Function: cloneWithData
      Creates a clone, locks it, modifies it's content
      and returns it.
      
    Returns:
      A DOM node.
  */
  cloneWithData: function(data)
  {
    var clone = this.clone();
    this.lock(clone);
    this.setData(data);
    this.unlock(clone);
    return clone;
  },
  
  
  lockedElement: function()
  {
    return this.__lockedElement;
  },

  /*
    Function: lock
      Lock the cell on a particular node.  Any setting of
      data on this controller will affect only that node.
      
    Parameters:
      element - a DOM node.
  */
  lock: function(element)
  {
    this.__lockedElement = element;
  },

  /*
    Function: lock
      Unlock this cell.
  */
  unlock: function()
  {
    this.__lockedElement = null;
  },

  /*
    Function: isLocked
      Returns the lock status of this cell.
      
    Returns:
      A boolean.
  */
  isLocked: function()
  {
    return this.__lockedElement != null;
  },


  getParentRow: function()
  {
    // TODO: related to SSTableView - not sure if this should be here.
    // probably should not because this.element is not in the DOM
    if(this.element) return this.element.getParent('.SSRow');
    return null;
  }

});