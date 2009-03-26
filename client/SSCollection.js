// ==Builder==
// @optional
// @package           ShiftSpaceCore
// ==/Builder==

String.implement({
  assoc: function(value)
  {
    var result = {};
    result[this] = value;
    return result;
  }
});


Hash.implement({
  copy: function(value)
  {
    var copy = $H();
    this.each(function(value, key) {
      copy.set(key, value);
    });
    return copy;
  }
});


Hash.implement({
  choose: function(_properties)
  {
    var properties = $splat(_properties);
    return this.filter(function(value, key) {
      return properties.contains(key);
    });
  }
});


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

var SSCollections = $H()

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

function SSCollectionsClearAllPlugins()
{
  SSCollections.each(function(coll, name) {
    coll.clearPlugins();
  });
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
      constraints: null,
      properties: [],
      orderBy: null,
      startIndex: null,
      range: null,
      delegate: null
    }
  },
  
  initialize: function(name, options)
  {
    this.setOptions(this.defaults(), options);
    
    // set the delegate
    if(this.options.delegate) this.setDelegate(this.options.delegate);
    
    // TODO: shouldn't allow plugins from element, need a way to prevent - David
    this.setPlugins($H());
    
    this.setIsUnread(true);

    // check if using array
    if(this.options.array)
    {
      this.setArray(this.options.array)
    }
    else if(this.options.table)
    {
      // real DB backend
      this.setLoadRefresh(true);
      this.setTable(this.options.table);
      this.setConstraints(this.options.constraints);
      this.setProperties(this.options.properties);
      this.setOrderBy(this.options.orderBy);
      this.setRange(this.options.range);
    }
    else
    {
      this.setArray([]);
    }
    
    if(name == null)
    {
      throw new SSCollectionError.NoName(new Error(), "collection instantiated without name.");
    }
    
    // a new collection
    this.setName(name);
    SSSetCollectionForName(this, name);
  },
  
  /*
    Function: setIsUnread 
      Sets the isUnread property of a collection. This property specifies if any of the information has been read from the collection array. 
      
    Parameters:
      value - A boolean value.
  */
  setIsUnread: function(value)
  {
    if(this.__isunread && !value) this.fireEvent('onCollectionFirstRead');
    this.__isunread = value;
  },
  /*
    Function: isUnread 
       Returns the isUnread property of a collection. This property specifies if any of the information has been read from the collection array. 
      
    Returns:
      A boolean value. 
  */
  isUnread: function()
  {
    return this.__isunread;
  },
  /*
    Function: setIsReading 
      Sets the isreading property of a collection. This property specifies if the content of a collection is being read. 
      
    Parameters:
      value - A boolean value.
  */
  setIsReading: function(value)
  {
    this.__isreading = value;
  },
  /*
    Function: isReading 
       Returns the isreading property of a collection. This property specifies if the content of a collection is being read
      
    Returns:
      A boolean value. 
  */
  isReading: function()
  {
    return this.__isreading;
  },
  /*
    Function: setPlugins 
       Sets the plugin(s) to apply to a collection. 
       
    Parameters:
      newPlugins - plugin names as string, or an array of string values. 
  */
  setPlugins: function(newPlugins)
  {
    this.__plugins = newPlugins;
  },
  /*
    Function: plugins 
       Returns the plugins all of the plugins currently applied to a collection. 
      
    Returns:
       An array.
  */  
  plugins: function()
  {
    return this.__plugins;
  },
  /*
    Function: pluginsForAction
      Returns all of the plugins currently applied with the specified action.
      
    Parameters: 
      action - An event.
      
    Returns:
      A plugin, or an array of plugins. 
  */
  pluginsForAction: function(action)
  {
    if(!this.plugins().get(action)) this.plugins().set(action, []);
    return $A(this.plugins().get(action));
  },
  /*
    Function: addPlugin
      Accepts an event and a plugin, and inserts it into the current plugins array. 
      
    Parameters: 
      action -  the type of action (read, write, delete, update)
      plugin -  Plugin name as string
      
  */
  
  addPlugin: function(action, plugin)
  {
    var pluginsForAction = this.pluginsForAction(action);
    pluginsForAction.push(plugin);
    this.plugins().set(action, pluginsForAction);
  },
  /*
    Function: removePlugin
      Accepts an event and a plugin, and clears it from the current plugins array. 
      
    Parameters: 
      action - the type of action (read, write, delete, update)
      plugin -  Plugin name as string
  */
  removePlugin: function(action, plugin)
  {
    // erase a plugin
    var pluginsForAction = this.pluginsForAction(action);
    this.plugins().set(action, pluginsForAction.erase(plugin));
  },
  /*
    Function: clearPlugins
      Clears all of the currently set plugins for the collection.
  */
  
  clearPlugins: function()
  {
    this.setPlugins($H());
  },
  /*
    Function: setDelegate
      Sets a delegate for the collection.
      
    Parameter:
      delegate - A delegate object. 
  */
  
  setDelegate: function(delegate)
  {
    this.__delegate = delegate;
  },
  /*
    Function: delegate
      Returns the delegate for the collection.
      
    Return:
      A delegate object. 
  */
  
  delegate: function()
  {
    return this.__delegate;
  },
  /*
    Function: setLoadRefresh
      Sets the loadOnRefresh property, which determines if the collection should be loaded in when refreshed. 
      
    Parameters:
      val - A boolean value.
  */
  
  setLoadRefresh: function(val)
  {
    this.__loadOnRefresh = val;
  },
  /*
    Function: setLoadRefresh
      Returns whether the collection should be loaded in when refreshed. 
      
    Returns:
      A boolean value.
  */

  shouldLoadOnRefresh: function()
  {
    return this.__loadOnRefresh;
  },
  /*
    Function: setName
      Sets the name of the collection 
      
    Parameters:
      name - A string.
  */
  
  setName: function(name)
  {
    this.__name = name;
  },
  /*
    Function: name
      Returns the name of the collection 
      
    Returns:
      A string.
  */
  
  name: function()
  {
    return this.__name;
  },
  /*
    Function: cleanObject
      Accepts an object, and removes any null values contained within it. 
      
    Parameters:
      anObject - An object.
  */
  
  cleanObject: function(anObject)
  {
    return $H(anObject).filter(function(value, key) {
      return value != null && value !== '';
    }).getClean();
  },
  /*
    Function: cleanPayload
      Accepts an payload, and removes any null values contained within it. 
      
    Parameters:
      anObject - An object.
  */
  
  
  cleanPayload: function(payload)
  {
    if($type(payload) == 'array')
    {
      return payload.map(this.cleanObject);
    }
    return this.cleanObject(payload);
  },
  /*
      MARKED FOR DELETION: never used -Justin 
  */
  escapeValues: function(obj)
  {
    return $H(obj).map(function(value, key) {
      return escape(value);
    }).getClean();
  },
  /*
      MARKED FOR DELETION: never used -Justin 
  */
  
  unescapeValues: function(obj)
  {
    return $H(obj).map(function(value, key) {
      return unescape(value);
    }).getClean();
  },
  /*
      MARKED FOR DELETION: never used -Justin 
  */
  
  unescapeResult: function(ary)
  {
    return ary.map(this.unescapeValues);
  },
  
  
  transact: function(action, options, bulk)
  {
    var payload = {
      action: action,
      table: options.table,
      values: options.values,
      properties: options.properties,
      constraints: options.constraints,
      orderby: options.orderBy,
      startIndex: options.startIndex,
      range: options.range
    };
    
    if(!bulk)
    {
      // allow the delegate to add info
      var delegate = this.delegate();
      if(delegate && delegate.onTransact) payload = delegate.onTransact(this, payload);

      payload = this.cleanPayload(payload);

      // clean values as well
      if(payload.values) payload.values = this.cleanObject(payload.values);
      
      SSCollectionsCall({
        desc: payload,
        onComplete: function(response) {
          var result = JSON.decode(response);
          var data = result.data;
          data = this.applyPlugins(action, data);
          // transform the data
          options.onComplete(data);
        }.bind(this),
        onFailure: options.onFailure
      });
    }
    else
    {
      return payload;
    }
  },
  
  /*
    Function: bulkTransact
      Takes a series of methods. Incomplete implementation, does not support
      plugins.
    
    Parameters:
      payload - an array of collection methods.
  */
  bulkTransact: function(payload, options)
  {
    SSCollectionsCall({
      desc: payload,
      onComplete: function(response) {
        var result = JSON.decode(response);
        var data = result.data;
        // transform the data
        options.onComplete(data);
      }.bind(this),
      onFailure: options.onFailure
    });
  },
  
  
  applyPlugins: function(action, data)
  {
    var rdata = data;
    var pluginsForAction = this.pluginsForAction(action);
    
    if(pluginsForAction.length == 0) return rdata;

    var plugin = pluginsForAction.shift();
    while(plugin)
    {
      rdata = plugin(rdata);
      plugin = pluginsForAction.shift();
    }
    
    return rdata;
  },
  
  
  setTable: function(table)
  {
    this.__table = table;
  },
  
  
  table: function()
  {
    return this.__table;
  },
  
  
  setProperties: function(props)
  {
    this.__properties = props;
  },
  
  
  properties: function()
  {
    return this.__properties;
  },
  
  
  setOrderBy: function(orderBy)
  {
    this.__orderBy = orderBy;
  },
  

  orderBy: function()
  {
    return this.__orderBy;
  },
  
  
  setRange: function(range)
  {
    this.__range = range;
  },
  
  
  range: function()
  {
    return this.__range;
  },
  
  
  setConstraints: function(constraints)
  {
    this.__constraints = constraints;
  },
  
  
  constraints: function()
  {
    return this.__constraints;
  },
  
  
  setArray: function(array)
  {
    this.__array = array;
  },
  
  
  getArray: function()
  {
    return this.__array;
  },
  
  
  getColumn: function(col)
  {
    return this.getArray().map(function(x) {
      return x[col];
    });
  },
  
  
  get: function(idx)
  {
    return this.__array[idx];
  },
  
  
  push: function(object)
  {
    this.__array.push(object);
  },
  
  
  setMetadata: function(metadata)
  {
    this.__metadata = metadata;
  },
  
  
  metadata: function()
  {
    return this.__metadata;
  },
  
  
  length: function()
  {
    if(!this.__array) return 0;
    return this.__array.length;
  },
  
  
  add: function(obj)
  {
    this.__array.push(obj);
    
    this.fireEvent('onAdd');
    this.fireEvent('onChange');
  },
  
  
  remove: function(idx)
  {
    if(!this.table())
    { 
      this.__array.splice(idx, 1);
    }
    else
    {
      this.__array.splice(idx, 1);
      this.fireEvent('onChange');
    }
  },
  
  
  insert: function(obj, idx)
  {
    this.__array.splice(idx, 0, obj);
    
    this.fireEvent('onInsert', {object:obj, index:idx});
    this.fireEvent('onChange');
  },
  
  
  move: function(fromIndex, toIndex)
  {
    this.fireEvent('onMove', {from:fromIndex, to:toIndex});
  },
  
  
  set: function(obj, index)
  {
    this.__array[index] = obj;
  },
  
  
  loadIndex: function(index, count)
  {

  },
  
  /*
    Function: read
      Read from the collection. Accepts a callback. Also fires
      an onLoad event that can be listened to. The onLoad event
      can be suppressed.  This is useful for handling animations
      which should wait until the result is synchronized with the
      server.
      
    Parameters:
      callback - a function.
      suppressEvent - a boolean value.
  */
  read: function(callback, suppressEvent)
  {
    this.setIsReading(true);
    this.initializeReadFns();
    return this.transact('read', {
      table: this.table(),
      constraints: this.constraints(),
      properties: this.properties(),
      orderBy: this.orderBy(),
      onComplete: function(data) {
        this.setArray(data);
        this.setIsUnread(false);
        this.setIsReading(false);
        this.clearOnReadFns();
        this.onRead(suppressEvent);
        if(callback && $type(callback) == 'function') callback(data);
      }.bind(this)
    });
  },
  
  
  initializeReadFns: function()
  {
    this.__readFns = [];
  },
  
  
  addOnReadFn: function(fn)
  {
    this.__readFns.push(fn);
  },
  
  
  clearOnReadFns: function()
  {
    this.__readFns.each(function(fn){fn();});
    this.__readFns = [];
  },
  
  
  readIndex: function(index, constraint, callback)
  {
    var theConstraint = {};
    theConstraint[constraint] = this.get(index)[constraint];
    this.transact('read', {
      table: this.table(),
      constraints: $merge(this.constraints(), theConstraint),
      properties: this.properties(),
      onComplete: function(data) {
        if(callback && data.length > 0) callback(data[0]);
      }.bind(this)
    });
  },
  
  
  create: function(data, callback)
  {
    return this.transact('create', {
      table: this.table(),
      values: data,
      onComplete: function(theId) {
        var newData = $merge(data, {id:theId});
        this.onCreate(newData);
        if(callback && $type(callback) == 'function') callback(newData);
      }.bind(this)
    });
  },
  
  /*
    Function: query
      Takes a predicate function and a list of properties to be returned for each matching item.
      
    Parameters:
      queryFn - a predicate function.
      properties - an array of string of the properties to be returned.
      
    Returns:
      An array of matching items containing only the request properties.
  */
  query: function(queryFn, properties)
  {
    // IE6 fix
    if(!this.getArray()) return;
    
    return this.getArray().filter(queryFn).map(function(obj) {
      return $H(obj).choose(properties).getClean();
    });
  },
  
  /*
    Function: indexWhere
      Returns the first index of the item matching the predicate fn.
      
    Parameters:
      fn - A predicate function.
      
    Returns:
      The index of the first matching item, or -1 if no match.
  */
  indexWhere: function(fn)
  {
    var ary = this.getArray();
    for(var i = 0, len = ary.length; i < len; i++)
    {
      if(fn(ary[i])) return i;
    }
    return -1;
  },
  
  /*
    Function: find
      Returns the first item matching the passed in predicated:
      
    Parameters:
      fn - a predicate function.
      
    Returns:
      The first item matching the predicate or null.
  */
  find: function(fn)
  {
    var index = this.indexWhere(fn);
    if(index == -1)
    {
      return null;
    }
    else
    {
      return this.get(index);
    }
  },
  
  
  'delete': function(index)
  {
    return this.transact('delete', {
      table: this.table(),
      constraints: $merge(this.constraints(), {
        id: this.get(index).id
      }),
      onComplete: function(data) {
        this.onDelete(data, index);
      }.bind(this),
      onFailure: function(data) {
        this.onFailure('delete', data, index);
      }.bind(this)
    });
  },
  
  
  update: function(data, index, bulk)
  {
    var indexConstraint = null;
    if(index != null) indexConstraint = {id: this.get(index).id};

    return this.transact('update', {
      table: this.table(),
      values: data,
      constraints: $merge(this.constraints(), indexConstraint),
      onComplete: function(rx) {
        this.onUpdate(data, index);
      }.bind(this),
      onFailure: function(data) {
        this.onFailure('delete', data, index);
      }.bind(this)
    }, bulk);
  },
  
  
  updateById: function(data, id, bulk)
  {
    return this.transact('update', {
      table: this.table(),
      values: data,
      constraints: $merge(this.constraints(), {id: id}),
      onComplete: function(rx) {
        this.onUpdateById(data, id);
      }.bind(this),
      onFailure: function(data) {
        this.onFailure('delete', data, index);
      }.bind(this)
    }, bulk);
  },
  
  
  onFailure: function(action, data, index)
  {
    
  },
  
  
  onRead: function(suppressEvent)
  {
    this.fireEvent('onLoad');
  },
  
  
  onCreate: function(data)
  {
    this.fireEvent('onCreate', data);
  },
  
  
  onDelete: function(data, index)
  {
    // synchronize internal
    this.remove(index);
    this.fireEvent('onDelete', index);
  },
  
  
  onUpdate: function(data, index)
  {
    this.__array[index] = $merge(this.__array[index], data);
    this.fireEvent('onUpdate', index);
  },
  
  
  byId: function(id)
  {
    return this.find(function(x){return x.id == id;});
  },
  
  
  onUpdateById: function(data, id)
  {
    var index = this.byId(id);
    this.__array[index] = $merge(this.__array[index], data);
    this.fireEvent('onUpdateById', index);
  },
  
  
  each: function(fn)
  {
    this.__array.each(fn);
  },
  
  
  map: function(fn)
  {
    return this.__array.map(fn);
  },
  
  
  updateConstraints: function(constraint, value)
  {
    this.setConstraints($merge(this.constraints(), constraint.assoc(value)));
  },
  
  
  empty: function()
  {
    this.setArray([]);
  },
  
  
  reset: function()
  {
    this.empty();
    this.setIsUnread(true);
  }

});