// ==Builder==
// @optional
// @package           ShiftSpaceCore
// ==/Builder==

// ==============
// = Exceptions =
// ==============

var SSCollectionError = SSException;

SSCollectionError.NoName = new Class({
  name:"SSCollectionError.NoName",
  Extends: SSCollectionError,
  Implements: SSExceptionPrinter
});

// =========================
// = Collection Management =
// =========================

var SSCollections = $H();

function SSCollectionForName(name)
{
  return SSCollections.get(name);
}

function SSSetCollectionForName(collection, name)
{
  SSCollections.set(name, collection);
}

function SSClearCollections()
{
  SSCollections.empty();
}

// ====================
// = Class Definition =
// ====================

var SSCollection = new Class({

  Implements: [Events, Options],

  name: "SSCollection",
  
  defaults: function()
  {
    return {
      table: null,
      fields: {}
    }
  },
  
  initialize: function(name, options)
  {
    this.setOptions(this.defaults(), options);
    
    if(name == null)
    {
      throw new SSCollectionError.NoName(new Error(), "collection instantiated without name.");
    }
    // a new collection
    SSSetCollectionForName(name);
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
  
  
  move: function(fromIndex, toIndex)
  {
    this.fireEvent('onMove', {from:fromIndex, to:toIndex});
  },
  
  
  update: function(index, newValues)
  {
    this.data[index] = this.data[index].merge(newValues);
    this.fireEvent('onUpdate');
  },
  
  
  set: function(data, index)
  {
    
  },
  
  
  load: function(index, count)
  {
    // actually load content
  }

});