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

// ====================
// = Class Definition =
// ====================

var SSCell = new Class({

  name: 'SSCell',
  Extends: SSView,

  initialize: function(el, options)
  {
    this.parent(el, options);
    if(this.options.properties)
    {
      this.setPropertyList(this.options.properties);
    }
  },
  
  
  setPropertyList: function(propertyList)
  {
    this.__properties = propertyList
  },
  
  
  getPropertyList: function()
  {
    return this.__properties;
  },
  
  
  setData: function(data)
  {
    $H(data).each(function(value, property) {
      this.setProperty(property, value);
    }.bind(this));
  },
  
  
  getData: function()
  {
    var args;
    if(arguments.length == 1 && $type(arguments[0]) == 'array')
    {
      args = arguments[0];
    }
    else if(arguments.length > 1)
    {
      args = $A(arguments);
    }
    return args.map(this.getProperty.bind(this));
  },
  
  
  setProperty: function(property, value)
  {
    if(!this.isLocked()) throw new SSCellError.NoLock(new Error(), "attempt to set property " + property + " without element lock.");
    if(!this.getPropertyList().contains(property)) throw new SSCellError.NoSuchProperty(new Error(), "no such property " + property);
    var setter = 'set'+property.capitalize();
    if(this.isLocked() && this[setter])
    {
      this[setter](value);
    }
  },
  
  
  getProperty: function(property)
  {
    if(!this.isLocked()) throw new SSCellError.NoLock(new Error(), "attempt to get property " + property + " without element lock.");
    if(!this.getPropertyList().contains(property)) throw new SSCellError.NoSuchProperty(new Error(), "no such property " + property);
    var getter = 'get'+property.capitalize();
    if(this.isLocked() && this[getter])
    {
      return this[getter];
    }
    return null;
  },
  
  /*
    Function: clone
      Creates a clone of the DOM model and returns it.
      
    Returns:
      A DOM node.
  */
  clone: function()
  {
    
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

  /*
    Function: lock
      Lock the cell on a particular node.  Any setting of
      data on this controller will affect only that node.
      
    Parameters:
      element - a DOM node.
  */
  lock: function(element)
  {
    this.element = element;
  },

  /*
    Function: lock
      Unlock this cell.
  */
  unlock: function()
  {
    this.element = null;
  },

  /*
    Function: isLocked
      Returns the lock status of this cell.
      
    Returns:
      A boolean.
  */
  isLocked: function()
  {
    return (this.element != null);
  },


  getParentRow: function()
  {
    // TODO: related to SSTableView - not sure if this should be here.
    if(this.element) return this.element.getParent('.SSRow');
    return null;
  }

});