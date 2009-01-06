// ==Builder==
// @optional
// @package           ShiftSpaceCore
// ==/Builder==

var SSCollection = new Class({

  Implements: [Events, Options],

  name: "SSCollection",

  initialize: function()
  {
    // a new collection
  },
  
  metadata: function()
  {
    
  },
  
  length: function()
  {
    
  },
  
  add: function(obj)
  {
    this.fireEvent('onAdd');
    this.fireEvent('onChange');
  },
  
  remove: function(idx)
  {
    this.fireEvent('onRemove', idx);
    this.fireEvent('onChange');
  },
  
  insert: function(obj, idx)
  {
    this.fireEvent('onInsert', {object:obj, index:idx});
    this.fireEvent('onChange');
  },
  
  swap: function(fromIndex, toIndex)
  {
    this.fireEvent('onSwap', {from:fromIndex, to:toIndex});
  },
  
  update: function(index, newValues)
  {
    this.data[index] = this.data[index].merge(newValues);
    this.fireEvent('onUpdate');
  },
  
  load: function(idx, count)
  {
    // actually load content
  }

});