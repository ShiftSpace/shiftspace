// ==Builder==
// @uiclass
// @package           ShiftSpaceCoreUI
// @dependencies      SSView
// ==/Builder==

/*
  Constants:
    SSCellError - base SSCell exception
    SSCellError.NoSuchProperty - no such property exists in the cell.
    SSCellError.NoLock - attempt to operate on a node with locking the cell first.
    SSCellError.NoSuchTarget - attempt to add a action-target with a target that does not exists.
 */

var SSCellError = SSException;

SSError(SSCellError, SSCellError, [
  "NoSuchProperty",
  "NoLock",
  "MissingAccessor",
  "NoSuchTarget",
  "NoMethodForAction"
]);

/*
  Class: SSCell
    Used with SSListView. Generally takes a model DOM node which is the cookie
    cutter which is used to populate the list view. SSCell is also the templating
    class of the ShiftSpace UI system. Generally you define setters so that a
    JSON object can be mapped onto the DOM.
*/
var SSCell = new Class({
  Extends: SSView,
  name: 'SSCell',
  
  initialize: function(el, options)
  {
    this.parent(el, options);
    
    this.setActions(this.options.actions);
    this.attachEvents();
    this.prepareClone();
    
    this.setPropertyList(this.options.properties || []);
  },

  /*
    Function: index
      Return the index of the currently locked element.
  */
  index: function()
  {
    return this.delegate().indexOfCellNode(this.lockedElement());
  },
  
  
  attachEvents: function()
  {
    this.element.addEvent('click', this.eventDispatch.bindWithEvent(this, 'click'));
  },
  
  /*
    Function: setProxy
      Set a proxy.

    Paramaters:
      proxy - the proxy object.
   */
  setProxy: function(proxy)
  {
    this.__proxy = proxy;
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
  
  /*
    Function: eventDispatch
      *private*
      Dispatch an event. You should never call this directly.

    Parameters:
      event - the browser event.
      eventType - custom event type.
   */
  eventDispatch: function(event, eventType)
  {
    event = new Event(event);
    var target = $(event.target), action = this.actionForNode(target);
    if(action)
    {
      this.runAction(action, event, target);
      return true;
    }
    return false;
  },
  
  /*
    Function: action
      Takes an action JSON object and acts on it.

    Parameters:
      action - an action JSON object
      event - a custom event type.
   */
  runAction: function(action, event, node)
  {
    var target = this.getBinding(action.target),
        method = (target && target[action.method] && target[action.method].bind(target)) || 
                 (action.target == 'SSProxiedTarget' && this.forwardToProxy.bind(this, [action.method])) ||
                 null;
                  
    if(!method)
    {
      throw (new SSCellError.NoSuchTarget(new Error(), "target " + target + " does not exist."));
    }
    
    method(this, {
      action: action,
      listView: this.delegate(),
      target: node,
      data: this.delegate().dataForCellNode(this.lockedElement()),
      event: event
    });
  },
  
  /*
    Function: getBinding
      *private*
      Take a target specifier and resolve it to the actual object. Target specifier
      can be "self" or of the form "id.pA.pB.pC.."

    Parameters:
      target - a target specifier.
   */
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
  
  /*
    Function: actionForNode
      *private*
      Returns the action for a particular child node.
    
    Parameters:
      node - a DOM element.

    Returns:
      a function.
   */
  actionForNode: function(node)
  {
    if(!this.lockedElement()) throw new SSCellError.NoLock(new Error(), "actionForNode called with no locked element.");
    var actions = this.getActions();
    if(actions && actions.length > 0)
    {
      var ary = actions.filter(function(x) {
	return (this.indexOfNode(this.lockedElement().getElements(x.selector), node) != -1);
      }.bind(this));
      if(ary.length > 0) return ary[0];
    }
    return null;
  },


  validateActions: function(actions)
  {
    return actions.every(function(action) {
      return action.method != null;
    });
  },
  
  /*
    Function: setActions
      *private*
      Set the actions for this cell.

    Parameters:
      actions - an array of actions.
   */
  setActions: function(actions)
  {
    if(actions && !this.validateActions(actions)) throw new SSCellError.NoMethodForAction(new Error(), "No method for action");
    this.__actions = actions;
  },
  
  /*
    Function: getActions
      *private*
      Returns the array of actions on the cell instance.

    Returns:
      An array of actions.
   */
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
      if(propertyList.contains(property)) this.setProperty(property, value, data);
    }.bind(this));
  },
  
  
  data: function()
  {
    if(!this.isLocked()) throw new SSCellError.NoLock(new Error(), "attempt to get data without element lock.");
    return this.delegate().dataForIndex(this.index());
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
  
  
  setProperty: function(property, value, data)
  {
    if(!this.isLocked()) throw new SSCellError.NoLock(new Error(), "attempt to set property " + property + " without element lock.");
    if(!this.getPropertyList().contains(property)) throw new SSCellError.NoSuchProperty(new Error(), "no such property " + property);
    var setter = 'set'+property.capitalize();
    if(this[setter])
    {
      this[setter](value, data);
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
  
  /*
    Function: prepareClone
      *private*
      Prepares a clone. Removes the options, uiclass, and outlet attributes
      as well as the SSCell class.

    Returns:
      a clone of the cell's model DOM element.

    See Also:
      <clone>
   */
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
      Creates a clone of the cell's model DOM element and returns it.
      
    Returns:
      A DOM node.
      
    See Also:
      <prepareClone>
  */
  clone: function()
  {
    var clone = this.__modelClone.clone(true);
    if(clone.getElement('*[uiclass]')) Sandalphon.activate(clone);
    clone.addClass('SSCellClone');
    return clone;
  },
  
  /*
    Function: cloneWithData
      Creates a clone, locks it, modifies it's content
      with the passed in JSON object.

    Parameters:
      data - a JSON object.
      
    Returns:
      A DOM node.

    See Also:
      <setData>, <clone>
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
    Function: lockedElement
      Returns the currently locked DOM element.

    Returns:
      A DOM element.

    See Also:
      <lock>, <unlock>, <isLocked>
   */
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
    Function: unlock
      Unlock this cell.
  */
  unlock: function()
  {
    this.__lockedElement = null;
  },

  /*
    Function: isLocked
      Returns the lock status of the cell.
      
    Returns:
      A boolean.
  */
  isLocked: function()
  {
    return this.__lockedElement != null;
  },

  /*
    Function: getParentRow
      *deprecated*
      Used in conjunction with SSTableView which will probably get deprecated in 
      favor of SSListView.
   */
  getParentRow: function()
  {
    if(this.element) return this.element.getParent('.SSRow');
    return null;
  },
  
  /*
    Function: edit
      Put the currently locked element into edit mode. If there's an element
      with class SSEditView in the locked element give that element the SSActive
      class.
   */
  edit: function()
  {
    var el = this.lockedElement();
    el.addClass('SSIsBeingEdited');
    if(el.getElement('.SSEditView')) el.getElement('.SSEditView').addClass('SSActive');
  },
  
  /*
    Function: leaveEdit
      Remove css classes from the locked element that pertain to editing.
   */
  leaveEdit: function()
  {
    var el = this.lockedElement();
    el.removeClass('SSIsBeingEdited');
    // FIXME: hmm seems hacky - David
    el.setStyles({
      width: ''
    });
    if(el.getElement('.SSEditView')) el.getElement('.SSEditView').removeClass('SSActive');
  }
});