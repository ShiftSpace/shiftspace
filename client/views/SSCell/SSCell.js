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

// ====================
// = Class Definition =
// ====================

var SSCell = new Class({

  name: 'SSCell',
  Extends: SSView,

  initialize: function(el, options)
  {
    this.parent(el, options);
    
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
  
  
  initActions: function()
  {
    if(this.options.actions)
    {
      var actions = this.options.actions.map(function(x) {
        x.method = ShiftSpaceNameTable[x.target][x.method];
        return x;
      }.bind(this));
      this.setActions(actions);
    }
  },
  
  
  eventDispatch: function(_event, eventType)
  {
    var event = new Event(_event);
    
    var action = this.actionForNode(event.target);
    
    if(action.length > 0)
    {
      (action[0].method.bind(this.delegate()))(_event);
    }
  },
  
  
  actionForNode: function(node)
  {
    return this.getActions().filter(function(x) {
      return this.element.getElements('> ' + x.selector).contains(node);
    }.bind(this));
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
    $H(data).each(function(value, property) {
      this.setProperty(property, value);
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
    if(!this.isLocked()) throw new SSCellError.NoLock(new Error(), "attempt to set property " + property + " without element lock.");
    if(!this.getPropertyList().contains(property)) throw new SSCellError.NoSuchProperty(new Error(), "no such property " + property);
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
    if(this.element) return this.element.getParent('.SSRow');
    return null;
  }

});