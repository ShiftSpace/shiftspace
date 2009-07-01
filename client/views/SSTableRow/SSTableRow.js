// ==Builder==
// @uiclass
// @required
// @package           ShiftSpaceCoreUI
// @dependencies      SSView
// ==/Builder==

var SSTableRow = new Class({
  
  Extends: SSView,
  name: 'SSTableRow',
  
  
  initialize: function(el, options)
  {
    this.parent(el, options);
    this.prepareAndSetModel(el);
  },
  
  
  setModel: function(model)
  {
    // prepareModel
    this.__model = model;
  },
  
  
  model: function()
  {
    return this.__model;
  },
  
  
  prepareAndSetModel: function(el)
  {
    this.setModel(this.prepareModel(el));
  },
  
  
  prepareModel: function(model)
  {
    // prepare the model
    return model;
  },
  
  
  modelRowClone: function()
  {
    return this.model().clone(true);
  },
  
  
  setDelegate: function(delegate)
  {
    this.parent(delegate);
  },
  
  
  setProperty: function(row, prop, value)
  {
    var propMethod = 'set'+prop.capitalize();
    var cell = row.getElement('> td[name='+prop+']');
    if(this[propMethod])
    {
      this[propMethod](cell, value);
    }
    else
    {
      cell.set('text', value);
    }
  },
  

  getProperty: function(row, prop)
  {
    var propMethod = 'get'+prop.capitalize();
    var cell = row.getElement('> td[name='+prop+']');
    if(this[propMethod])
    {
      return this[propMethod](cell, prop);
    }
    else
    {
      return cell.get('text');
    }
  }
});