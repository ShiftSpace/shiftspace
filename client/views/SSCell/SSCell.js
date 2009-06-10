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
  Extends: SSCellError,
  Implements: SSExceptionPrinter,
  name:"SSCellError.NoSuchProperty"
});

SSCellError.NoLock = new Class({
  Extends: SSCellError,
  Implements: SSExceptionPrinter,
  name:"SSCellError.NoLock"
});

// DELETE
SSCellError.MissingAccessor = new Class({
  Extends: SSCellError,
  Implements: SSExceptionPrinter,
  name:"SSCellError.MissingAccessor"
});

SSCellError.NoSuchTarget = new Class({
  Extends: SSCellError,
  Implements: SSExceptionPrinter,
  name:"SSCellError.NoSuchTarget"
});

// ====================
// = Class Definition =
// ====================

var SSCell = new Class({

  Extends: SSView,
  name: 'SSCell',
  
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
      var cellNode = (event.target.get('tag') == 'li' && event.target) || event.target.getParent('li');
      this.delegate().onCellClick(cellNode);
    }
  },
  
  
  runAction: function(action, event)
  {
    var target = this.getBinding(action.target);
    var method = (target && target[action.method] && target[action.method].bind(target)) || 
                 (action.target == 'SSProxiedTarget' && this.forwardToProxy.bind(this, [action.method])) ||
                 null;
                  
    if(!method)
    {
      throw (new SSCellError.NoSuchTarget(new Error(), "target " + target + " does not exist."));
    }
    
    method(this, event);
  },
  
  
  getBinding: function(target)
  {
    // TODO: allow getBinding to access simple properties - David
    if(target == 'self') return this;
    
    var parts = target.split('.');
    var base = ShiftSpaceNameTable[parts.shift()];
    var result = base;
    if(parts.length < 1) return result;
    while(parts.length > 0)
    {
      var property = parts.shift();
      result = result['get'+property.capitalize()]();
    }
    return result;
  },
  
  
  actionForNode: function(node)
  {
    if(!this.lockedElement()) throw new SSCellError.NoLock(new Error(), "actionForNode called with no locked element.");
    var ary = this.getActions().filter(function(x) {
      return this.lockedElement().getElements(x.selector).contains(node);
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
  
  
  cleanData: function(data)
  {
    return $H(data).filter(function(value, key) {
      return value != null;
    }).getClean();
  },
  
  
  getAllData: function()
  {
    var data = {};
    this.getPropertyList().each(function(property) {
      data[property] = this.getProperty(property);
    }.bind(this));
    return this.cleanData(data);
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
    
    clone.addClass('SSCellClone');
    
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
  },
  
  
  edit: function()
  {
    var el = this.lockedElement();

    // show the edit view
    el.addClass('SSIsBeingEdited');
    if(el.getElement('.SSEditView')) el.getElement('.SSEditView').addClass('SSActive');
  },
  
  
  leaveEdit: function()
  {
    var el = this.lockedElement();
    
    // let the delegate know the edits were committed
    el.removeClass('SSIsBeingEdited');
    
    // FIXME: hmm seems hacky - David
    el.setStyles({
      width: ''
    });
    
    if(el.getElement('.SSEditView')) el.getElement('.SSEditView').removeClass('SSActive');
  }

});