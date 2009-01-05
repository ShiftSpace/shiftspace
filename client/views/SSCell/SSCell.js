// ==Builder==
// @uiclass
// @optional
// @name              SSCell
// @package           ShiftSpaceCoreUI
// @dependencies      SSView
// ==/Builder==

var SSCell = new Class({

  name: 'SSCell',
  Extends: SSView,

  initialize: function(el, options)
  {
    this.parent(el, options);
    if(this.options.properties)
    {
      this.properties = this.options.properties;
    }
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
      args = $A(arguments[0]);
    }
    else if(arguments.length > 1)
    {
      args = $A(arguments);
    }
    return args.map(this.getProperty.bind(this));
  },
  
  
  setProperty: function(property, value)
  {
    var setter = 'set'+property.capitalize();
    if(this[setter])
    {
      this[setter](value);
    }
  },
  
  
  getProperty: function(property, value)
  {
    var getter = 'get'+property.capitalize();
    if(this[getter])
    {
      return this[getter];
    }
    return null;
  },


  lock: function(element)
  {
    this.element = element;
  },


  unlock: function()
  {
    this.element = null;
  },


  isLocked: function()
  {
    return (this.element != null);
  },


  getParentRow: function()
  {
    if(this.element) return this.element.getParent('.SSRow');
    return null;
  }

});