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
  SSPostNotification('onSetCollection', {name:name, collection:collection});
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


function SSCollectionCheckRead(collectionName)
{
  return function(fn) {
    return function decorator() {
      var args = $A(arguments);
      var coll = SSCollectionForName(collectionName);
      if(coll.isUnread())
      {
        return coll.read(decorator.rewind(this, args));
      }
      else
      {
        return fn.apply(this, args);
      }
    }
  };
}

function SSCollectionCheckIsReading(collectionName)
{
  return function(fn) {
    return function decorator() {
      var args = $A(arguments);
      var coll = SSCollectionForName(collectionName);
      if(coll.isUnread())
      {
        return coll.addOnReadFn(decorator.rewind(this, args));
      }
      else
      {
        return fn.apply(this, args);
      }
    }
  };
}

// ====================
// = Class Definition =
// ====================

// ====================
// Using SSCollection =
// ====================
// 
// read
// ----
// {
//   "action": "read",
//   "table": "user/shift/trail/comment",
//   "constraints": {
//      "user_id": 67
//   },
//   "properties": "*" || ["username", "summary", "modified"],
//   "orderby": ["<" || ">", "modified"],
//   "startIndex": 2,
//   "range": {
//     "startIndex": 2, // array base is 0
//     "count": 20
//   }
// }
// - returns array of results
//  
// delete
// ------
// {
//   "action": "delete",
//   "table": "user/shift/trail/comment",
//   "constraints": {
//      "user_id": 67
//   },
// }
// - returns number of rows deleted
//  
// update
// ------
// {
//   "action": "update",
//   "table": "user/shift/trail/comment",
//   "constraints": {
//      "user_id": 67
//   },
//   "values": {
//     "user_id": 68,
//     "name": "Avital"
//   }
// }
// - returns number of rows updated
//  
// create
// ------
// {
//   "action": "create",
//   "table": "user/shift/trail/comment",
//   "values": {
//     "name": "Avital"
//   }
// }
// - returns new id
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
      delegate: null,
      plugins: null,
      views: []
    }
  },
  
  initialize: function(name, options)
  {
    this.setOptions(this.defaults(), options);
    
    // set the delegate
    if(this.options.delegate) this.setDelegate(this.options.delegate);
    
    // TODO: shouldn't allow plugins from element, need a way to prevent - David
    this.setViews(this.options.views);
    this.setPlugins((this.options.plugins && $H(this.options.plugins)) || $H());
    
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
       Sets the plugin(s) to apply to a collection. Plugins are used to assign multiple actions on collections.
       
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
      action -  the type of action (create, write, delete, update)
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
      action - the type of action (create, write, delete, update)
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
      Sets the loadOnRefresh property, which determines if the collection
      should be loaded in when refreshed. 
      
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
      Function: transact
        Accepts an action, an array of options, and a compiled collection. If a bulk is not passed or is null, the collection object is cleaned and the currently set delagates are applied. 
      
      Parameters:
        action - the type of action (create, write, delete, update)
        options - An array of options to apply to the transaction.
        bulk -   A bulk is a compiled version without any server calls/actions.
        
      Returns:
        A payload object, an array of collection methods.      
  */
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
      range: options.range,
      bare: options.bare || 0
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
  
  /*
     Function: applyPlugins
      Takes an action and a collection, and applies the currently set plugins
      to the collection. The modified collection is returned. 
      
     Parameters:
       action - the type of action (create, write, delete, update)
       data - an array. 
       
      Returns: 
        A collection array. 
   */
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


  /*
    Function: setProperties
      Sets the properties property of a collection. The coloumns that
      are to be affected in the sqlLite database.
      
    Parameters:
      props  - An array of properties.  
  */ 
  setProperties: function(props)
  {
    this.__properties = props;
  },
  
  /*
    Function: properties
      Returns properties property of a collection. 
      
    Returns:
      An array.
  */
  properties: function()
  {
    return this.__properties;
  },
  
  /*
    Function: setOrderBy
      Sets the orderBy property of a collection. 
      
    Parameters:
      orderBy - A string.
  */
  setOrderBy: function(orderBy)
  {
    this.__orderBy = orderBy;
  },
  
  /*
    Function: orderBy
      Returns the orderBy property of a collection. 
      
    Returns:
      A string.
  */
  orderBy: function()
  {
    return this.__orderBy;
  },
  
  /*
    Function: setRange
      Sets the range property of a collection. 
      
    Parameters:
      range - An integer.
  */
  setRange: function(range)
  {
    this.__range = range;
  },
  
  /*
    Function: range
      Sets the range property of a collection. 
      
    Returns:
       An integer.
  */
  range: function()
  {
    return this.__range;
  },
  
  /*
    Function: setConstraints
      Sets the constraints property of a collection. 
      
    Parameters:
      constraints - An array.
  */
  setConstraints: function(constraints)
  {
    this.__constraints = constraints;
  },
  
  /*
    Function: constraints
      Returns the constraints property of a collection. 
      
    Return:
      An array.
  */
  constraints: function()
  {
    return this.__constraints;
  },
  
  /*
    Function: setArray
      Sets the array property of a collection. 
      
    Parameters:
      array - An array.
  */
  setArray: function(array)
  {
    this.__array = array;
  },
  
  /*
    Function: getArray
      Returns the array property of a collection. 
      
    Parameters:
      array - An array.
  */
  getArray: function()
  {
    return this.__array;
  },
  
  /*
    Function: getColumn
      Returns a coloumn in the collections array.
    
    Parameters:
      col - An integer
    
    Returns:
      An object. 
  */
  getColumn: function(col)
  {
    return this.getArray().map(function(x) {
      return x[col];
    });
  },
  
  /*
    Function: getColumn
      Returns a row in the collections array.
      
    Parameters:
      idx - An integer.
      
    Returns:
      An object.
  */
  get: function(idx)
  {
    return this.__array[idx];
  },
  
  /*
    Function: push
      Takes an object and inserts it into the collections array.
      
    Parameters:
      object - An object.
      
    Note:
      See add method. Possibly redundant? - justin

  */
  push: function(object)
  {
    this.__array.push(object);
  },
  
  /*
    Function: length
      Returns the length of an array, or 0 an array is not set.
      
    Returns:
      An integer
      
  */
  length: function()
  {
    if(!this.__array) return 0;
    return this.__array.length;
  },
  
  /*
    Function: add 
      Takes an object and adds it the the collections array.  
      Fires the onAdd and onChange events.
      
    Parameters:
      An integer
  */
  add: function(obj)
  {
    this.__array.push(obj);
    
    this.fireEvent('onAdd');
    this.fireEvent('onChange');
  },
  
  /*
    Function: remove
      Takes an index and removes the row from the array. 
      
    Parameters:
      inx - An integer
  */
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
  
  /*
    Function: insert
      Takes an object and an index, and inserts the object into 
      the collection array at the passed index. Fires an onInsert 
      and onChange event.
      
    Parameters: 
      obj - An object.
      idx - An integer.
  */
  insert: function(obj, idx)
  {
    this.__array.splice(idx, 0, obj);
    
    this.fireEvent('onInsert', {object:obj, index:idx});
    this.fireEvent('onChange');
  },
  
  /*
    Function: move
      Takes a fromIndex and a toIndex, and fires an onMove event 
      
    Parameters: 
      fromIndex - An integer.
      toIndex - An integer.
  */
  move: function(fromIndex, toIndex)
  {
    this.fireEvent('onMove', {from:fromIndex, to:toIndex});
  },
  
  /*
    Function: set      
      Takes an object and an index, and sets the object into the
      collection array at the passed index. 
      
    Parameters: 
      obj - An object.
      index -  An integer.
  */
  set: function(obj, index)
  {
    this.__array[index] = obj;
  },
  
  /*
    Function: loadIndex (abstract)
        NOTE: Abstract or To Be Deleted? -Justin
        
    Parameters: 
      index - An integer.
      count -  An integer.
  */
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
      
    Returns: 
      A payload object.
  */
  read: function(callback, options, bulk)
  {
    this.setIsReading(true);
    this.initializeReadFns();
    var defaults = {
      table: this.table(),
      constraints: this.constraints(),
      properties: this.properties(),
      orderBy: this.orderBy(),
      onComplete: function(data) {
        if(!options.doNotUpdate) this.setArray(data);
        this.setIsUnread(false);
        this.setIsReading(false);
        this.clearOnReadFns();
        this.onRead(data);
        if(options.onRead && $type(options.onRead) == 'function') callback(data);
      }.bind(this)
    };
    options = $merge(defaults, options);
    return this.transact('read', options, bulk);
  },
  
  /*
    Function: initializeReadFns (private)
      Creates a new readFns array, which stores the functions
      
  */
  initializeReadFns: function()
  {
    this.__readFns = [];
  },
  
  /*
    Function: addOnReadFn 
      Takes a function and adds it to the readFns array. 
      
    Parameters: 
      fn - A function.
      
  */
  addOnReadFn: function(fn)
  {
    this.__readFns.push(fn);
  },
  
  /*
    Function: clearOnReadFns
      Clears the readFns array.
      
  */
  clearOnReadFns: function()
  {
    this.__readFns.each(function(fn){fn();});
    this.__readFns = [];
  },
  
  /*
    Function: readIndex
      Takes an index, constraint, and callback function
      
    Parameters:
      index - An integer.
      constraint - An integer. 
      callback - A function.
  */
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
  
  /*
    Function: create 
      Creates a new set or work in the collection. Accepts an array of data to be created and an array of options. 

    Parameters:
      data - An array.
      options - An array.
      
    Returns: 
      A payload object, an array of collection methods.
  */
  create: function(data, options)
  {
    return this.transact('create', {
      table: this.table(),
      values: data,
      onComplete: function(theId) {
        var newData = $merge(data, {id:theId});
        this.onCreate(newData, (options && options.userData));
        if(options && options.onCreate && $type(options.onCreate) == 'function') options.onCreate(newData);
        this.dirtyTheViews();
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
  
  /*
    Function: delete 
      Delete from the collection. Accepts the index to be deleted in the collection.
      Returns a payload object. Also fires an onComplete and onFailure event. 
      
    Parameters: 
      index - An integer.
      
    Returns: 
      A payload object, an array of collection methods.
  */
  'delete': function(index)
  {
    return this.transact('delete', {
      table: this.table(),
      constraints: $merge(this.constraints(), {
        id: this.get(index).id
      }),
      onComplete: function(data) {
        this.onDelete(data, index);
        this.dirtyTheViews();
      }.bind(this),
      onFailure: function(data) {
        this.onFailure('delete', data, index);
      }.bind(this)
    });
  },
  
  
  deleteById: function(id, options, bulk)
  {
    var defaults = {
      table: this.table(),
      constraints: $merge(this.constraints(), {id: id}),
      onComplete: function(rx) {
        this.onDeleteById(rx, id);
        this.dirtyTheViews();
        if(options.onDelete && $type(options.onDelete) == 'function') options.onDelete(rx, id);
      }.bind(this),
      onFailure: function(data) {
        this.onFailure('delete', data, index);
      }.bind(this)
    };
    options = $merge(defaults, options);
    return this.transact('delete', options, bulk);
  },
  
  
  onDeleteById: function(data, id)
  {
    this.fireEvent('onDeleteById', {data:data, id: id});
  },
  
  
  deleteByConstraint: function(constraint, options, bulk)
  {
    var defaults = {
      table: this.table(),
      constraints: $merge(this.constraints(), constraint),
      onComplete: function(rx) {
        this.onDeleteByConstraint(rx, constraint);
        this.dirtyTheViews();
        if(options.onDelete && $type(options.onDelete) == 'function') options.onDelete(rx, constraint); 
      }.bind(this),
      onFailure: function(data) {
        this.onFailure('delete', data, index);
      }.bind(this)
    };
    options = $merge(defaults, options);
    return this.transact('delete', options, bulk);
  },
  
  
  onDeleteByConstraint: function(data, constraint)
  {
    this.fireEvent('onDeleteByConstraint', {data:data, constraint: constraint});
  },
  
  /*
    Function: update
      Updates the collection by index. Accepts the updated array of data, the index to insert the new data, and a bulk. Inserts the new data into the Collection array at the given index.  
      
    Parameters:
      data - An array. 
      index - An integer.
      bulk - A bulk is a compiled version without any server calls/actions.
      
    Returns:
      A payload object.
      
    See Also: 
      updateById
      
  */
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
        this.dirtyTheViews();
      }.bind(this),
      onFailure: function(data) {
        this.onFailure('delete', data, index);
      }.bind(this)
    }, bulk);
  },
  
  /*
    Function: updateById
      Updates the collection by id. Accepts the updated array of data, the id to insert the new data, and a bulk .....
      
    Parameters:
      data - An array. 
      id - An integer.
      bulk - A bulk is a compiled version without any server calls/actions.

    Returns:
      A payload object.
  
    See Also: 
      update
  */
  updateById: function(data, id, bulk)
  {
    return this.transact('update', {
      table: this.table(),
      values: data,
      constraints: $merge(this.constraints(), {id: id}),
      onComplete: function(rx) {
        this.onUpdateById(data, id);
        this.dirtyTheViews();
      }.bind(this),
      onFailure: function(data) {
        this.onFailure('delete', data, index);
      }.bind(this)
    }, bulk);
  },
  
  /*
    Function: onFailure (abstract)
      Event handler for failure.
      
    Parameter:
      action - The type of action (create, write, delete, update)
      data -   An array.
      index -  An integer.
  */
  onFailure: function(action, data, index)
  {
    
  },
  
  /*
    Function: onRead 
      Fires the onLoad event 
  */  
  onRead: function(data)
  {
    this.fireEvent('onLoad', data);
    this.fireEvent('onRead', [data]);
  },
  
  /*
    Function: onCreate (private)
      Called in the create function. Fires the onCreate event after create has completed. 
      
    Paramters:
      data - An array.
      userData - An array.
      
    See Also:
      create
  */
  onCreate: function(data, userData)
  {
    this.fireEvent('onCreate', {data:data, userData:userData});
  },
  
  /*
    Function: onDelete (private)
      Takes an index row in the collection and removes it from the array. Fires the onDelete event when called. 
      
    Parameters:
      data - An array. NOTE: unused. - Justin
      index - An integer.
      
    See Also:
      delete
  */
  onDelete: function(data, index)
  {
    // synchronize internal
    this.remove(index);
    this.fireEvent('onDelete', {data:data, index:index});
  },
  
  /*
    Function: onUpdate (private)
      Merges an array of data into the passed index in the collection array. Fires the onUpdate event when called. 
      
    Parameters:
      data - An array. 
      index - An integer.
  */
  onUpdate: function(data, index)
  {
    this.__array[index] = $merge(this.__array[index], data);
    this.fireEvent('onUpdate', {data:this.__array[index], index:index});
  },
  
  /*
    Function: byId 
      Returns a row in the collection array specified by the passed id.
      
    Parameters:
      id - An integer.
    
    Returns:
       A row in the collection array.
  */
  byId: function(id)
  {
    return this.find(function(x){return x.id == id;});
  },
  
  /*
    Function: onUpdateById
      Merges an array of data into the passed id in the collection array. Fires the onUpdateById event when called.
      
    Parameters: 
      data - An array of data. 
      id - An integer.
  */
  onUpdateById: function(data, id)
  {
    var index = this.byId(id);
    this.__array[index] = $merge(this.__array[index], data);
    this.fireEvent('onUpdateById', {data:this.__array[index], index: index});
  },
  
  /*
    Function: each
      Takes a function and applies it to each row in the collection array. 
      
    Parameters:
      fn - A function. 
  */
  each: function(fn)
  {
    this.__array.each(fn);
  },
  
  /*
    Function: map
      Takes a function and performs it on each row in the collection array. Returns an array containing the results of each function call. 
      
    Parameters:
      fn - A function.
      
    Returns:
      An array 
  */
  map: function(fn)
  {
    var result = []
    var len = this.__array.length;
    for(var i = 0; i < len; i++)
    {
      result.push(fn(this.__array[i], i));
    }
    return result;
  },
  
  /*
    Function: updateConstraints
      Takes an array of constraints and a value, and update the constraints array.
      
    Parameters:
      constraint - An array.
      value - An integer.
  */
  updateConstraints: function(constraint, value)
  {
    this.setConstraints($merge(this.constraints(), constraint.assoc(value)));
  },
  
  /*
    Function: empty 
      Clears the collections array. 
  */
  empty: function()
  {
    this.setArray([]);
  },
  
  /*
    Function: reset
      Clears the collections array and sets the unread attribute of the collection to true. 
  */
  reset: function()
  {
    this.empty();
    this.setIsUnread(true);
  },
  
  
  setViews: function(views)
  {
    this.__views = views;
  },
  
  
  views: function()
  {
    return this.__views;
  },
  
  
  addView: function(view)
  {
    this.views().push(view);
  },
  
  
  removeView: function(view)
  {
    this.views().remove(view);
  },
  
  
  dirtyTheViews: function()
  {
    this.views().each(function(viewName) {
      var theView = ShiftSpaceNameTable[viewName];
      if(theView) theView.setNeedsDisplay(true);
    });
  }

});

SSCollection.bulkTransact = function(payload, options)
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
};