// ==Builder==
// @package           ShiftSpaceCore
// ==/Builder==

var __resources = $H();

/*
Function: SSTableForName
  Return the resource for the given name.

Parameters:
  name - a string.

Returns:
  An SSTable instance.
*/
function SSTableForName(name)
{
  return __resources[name];
}

/*
Function: SSSetTableForName (private)
  Associate a resource with given name in the global __resources
  hashmap.

Parametesr:
  name - the name of the resource.
  resource - a SSTable instance.
*/
function SSSetTableForName(name, resource)
{
  __resources[name] = resource;
  SSPostNotification("tableSet", {name:name, resource:resource});
}

/*
Function: SSDeleteTable
  Delete a resource by name. Will also clear any references to the
  resource from the resource's application server.

Parameters:
  name - a string.

See Also:
   SSTable.dispose
*/
function SSDeleteTable(name)
{
  var resource = SSTableForName(name);
  if(resource) resource.cleanup();
  if(__resources[name]) delete __resources[name];
  if(resource) SSPostNotification("tableDelete", {name:name});
}

/*
Class: SSTable
  This class works with ApplicationServer to present a simple interface for
  looking at server side data as an array of items. It is designed to work
  closely with SSViews, in particular SSListView.

See Also:
  ApplicationServer, SSListView
*/
var SSTable = new Class({

  Implements: [Events, Options, Delegate],
  name: "SSTable",
  
  defaults: function()
  {
    return {
      resource: null,
      watch: null,
      delegate: null,
      sortFn: null,
      transforms: null
    };
  },
  
  
  initialize: function(name, options)
  {
    var delegate, views;
    // NOTE: delegate is an object and we might have circular references so we deal with it first - David
    if(options.delegate)
    {
      delegate = options.delegate;
      delete options.delegate;
    }
    if(options.views)
    {
      views = options.views;
      delete options.views;
    }
    this.setOptions(this.defaults(), options);
    this.setConditions({});
    this.setHandlers({});
    this.setViews(views || []);
    this.setApp(this.options.app || SSApplication());
    if(this.options.sortFn)
    {
      this.setSortFn(this.options.sortFn);
    }
    else
    {
      this.setSortFn(this.sortByModified);
    }
    this.setTransforms([this.convertDates].combine(this.options.transforms || []));
    if(this.options.resource) this.setResource(this.options.resource);
    if(this.options.watches) this.setWatches(this.options.watches);
    if(delegate) this.setDelegate(delegate);
    this.setName(name);
    SSSetTableForName(name, this);
    this.dirtyTheViews();
  },
  
  /*
    Function: convertDates (private)
      Internal transform utility. We want to convert all dates string representations
      to Data objects. Meant to be used to read in data. Not mean to be used directly.
    
    Parameters:
      doc - a document object from the server.
    
    Returns:
      A transformed document.
   */
  convertDates: function(doc)
  {
    doc.created = Date.parse(doc.created);
    doc.modified = Date.parse(doc.modified);
    return doc;
  },
  
  /*
    Function: sortByModified (private)
      Utility sort by modified date function. Not meant to be used directly.
   */
  sortByModified: function(a, b)
  {
    return a.modified < b.modified;
  },
  
  /*
    Function: setSortFn (private)
      Set the sorting function.

    Parameters:
      Takes a sort function. This should be valid sort function, the kind that
      can be passed to Array.sort.
   */
  setSortFn: function(sortFn)
  {
    this.__sortFn = sortFn;
  },
  
  /*
    Function: sortFn (private)
      Getter for the sort function.
   */
  sortFn: function()
  {
    return this.__sortFn;
  },
  
  /*
    Function: setTransforms (private)
      Takes an array of sort functions and composes them into a single function.

    Parameters:
      transforms - an array of functions. Each should take and return a value.
   */
  setTransforms: function(transforms)
  {
    this.__transformFn = Function.comp.apply(null, transforms);
  },
  
  /*
    Function: transformFn (private)
      Returns the composed transform function.

    Returns:
      The transform function.

    See Also:
      setTransforms
   */
  transformFn: function()
  {
    return this.__transformFn;
  },
  
  /*
    Function: setConditions (private)
      Set the conditions for the resource. Each condition function should be
      a function which takes a document and returns a boolean value.
    
    Parameters:
      condition - an array of functions which take a document and return a boolean.
   */
  setConditions: function(conditions)
  {
    this.__conditions = conditions;
  },
  
  /*
    Function: conditions (private)
      Returns the list of conditions for this resource.

    Returns:
      An array of functions.
   */
  conditions: function()
  {
    return this.__conditions;
  },
  
  /*
    Function: handlers (private)
      Set the hash map of handlers. The map should be organized with resource specifications
      as the keys.
   */
  setHandlers: function(handlers)
  {
    this.__handlers = handlers;
  },
  
  /*
    Function: handlers (private)
      Returns the hash map of handlers.
   */
  handlers: function()
  {
    return this.__handlers;
  },
  
  
  setMethod: function(method, path)
  {
    this.resource()[method] = path;
  },
  
  
  getMethod: function(method)
  {
    return this.resource()[method];
  },
  
  /*
    Function: setName (private)
      Set the name of this resource.

    Parameters:
      name - a string.
   */
  setName: function(name)
  {
    this.__name = name;
  },
  
  /*
    Function: getName
      Return the name of this resource.
      
    Returns:
      A string.

    See Also:
      SSTableForName
   */
  getName: function()
  {
    return this.__name;
  },
  
  /*
    Function: get
      Return the item at the specified index.

    Parameters:
      idx - an integer.

    Returns:
      A single document.
   */
  get: function(idx)
  {
    return this.data()[idx];
  },
  
  /*
    Function: getLength
      Return the number of items managed by this resource.

    Returns:
      An integer.
   */
  getLength: function()
  {
    return this.data().length;
  },
  
  /*
    Function: each
      Like Array.forEach/each. Apply a function for each item in this
      resource's data.

    Parametesr: 
      fn - a function to be applied to each item.
   */
  each: function(fn)
  {
    this.data().each(fn);
  },
  
  /*
    Function: map
      Like Array.map. Map a function over this resource's data.

    Parameters:
      fn - a function to applied to each document.

    Returns:
      A new array of items with the map function applied to each original document.
   */
  map: function(fn)
  {
    return this.data().map(fn);
  },
  
  
  filter: function(fn)
  {
    return this.data().filter(fn);
  },
  
  /*
    Function: setApp (private)
      Set the application server used by this resource.

    Parameters:
      app - an ApplicationServer instance.

    See Also:
      ApplicationServer
   */
  setApp: function(app)
  {
    this.__app = app;
    app.addResource(this);
  },
  
  /*
    Function: app
      Return the ApplicationServer instance used by this resource.

    Returns:
      An ApplicationServer instance.
   */
  app: function()
  {
    return this.__app;
  },
  

  setResource: function(resource)
  {
    this.__resource = resource;
  },
  
  
  resource: function()
  {
    return this.__resource;
  },
  
  /*
    Function: data
      Returns the data represented by this resource.

    Returns:
      An array of documents.
   */
  data: function()
  {
    return SSApplication().cache(
      this.getName(), 
      {
        asArray: true, 
        transform: this.transformFn(),
        sort: this.sortFn()
      }
    );
  },
  
  /*
    Function: setWatches (private)
      Take a watch specification and creates the hash map of conditions and handlers
      based on resource specifications.

    Parameters:
      watches - a watch specification. Consult documentation.
   */
  setWatches: function(watches)
  {
    this.__watches = new Set(watches);
    this.__watches.each(function(watch) {
      watch.events.each(function(event) { 
        this.app().addWatcher(this, event);
        var hashed = $hash(event), conditions = this.conditions(), handlers = this.handlers();
        if(!conditions[hashed]) conditions[hashed] = [];
        if(!handlers[hashed]) handlers[hashed] = [];
        if(watch.conditions) conditions[hashed].combine(watch.conditions);
        if(watch.handlers) handlers[hashed].combine(watch.handlers);
      }, this);
    }, this);
  },
  
  /*
    Function: watches (private)
      Returns the watch specification for this resource. Intended for debugging only.
   */
  watches: function()
  {
    return this.__watches;
  },
  
  
  create: function(data, options)
  {
    if(!this.getMethod('create')) { SSLog("Resource " + this.getName() + " does not support create.", SSLogError); return; };
    var p = this.app().create(this.getMethod('create'), data, {local:this.getName()});
    p.op(function(v) { 
      this.dirtyTheViews();
      this.fireEvent('onCreate', {resource:this, value:v}); 
      return v; 
    }.bind(this));
    return p;
  },
  
  
  read: function(options)
  {
    if(!this.getMethod('read')) { SSLog("Resource " + this.getName() + " does not support read.", SSLogError); return; };
    options = (this.delegate()) ? $merge(options, this.delegate().optionsForTable(this)) : options;
    var p = this.app().get({resource:this.getMethod('read'), data:options}, {local:this.getName()});
    p.op(function(v) { this.fireEvent('onRead', {resource:this, value:v}); return v; }.bind(this));
    return p;
  },
  
  
  update: function(idx, data, options)
  {
    if(!this.getMethod('update')) { SSLog("Resource " + this.getName() + " does not support update.", SSLogError); return; };
    var oldValue = this.get(idx);
    var p = this.app().update(this.getMethod('update'), oldValue._id, data, {local:this.getName()});
    p.op(function(v) {
      this.dirtyTheViews();
      this.fireEvent('onUpdate', {resource:this, oldValue:oldValue, 'newValue':v}); 
      return v; 
    }.bind(this));
    return p;
  },
  
  
  'delete': function(idx, options)
  {
    if(!this.getMethod('update')) { SSLog("Resource " + this.getName() + " does not support update.", SSLogError); return; };
    var oldValue = this.get(idx);
    var p = this.app()['delete'](this.getMethod('delete'), oldValue._id, {local:this.getName()});
    p.op(function(v) {
      this.dirtyTheViews();
      this.fireEvent('onDelete', {resource:this, oldValue:v});
      return v; 
    }.bind(this));
    return p;
  },
  
  /*
    Function: setViews (private)
      Set the views managed by this resource.

    Parameters:
      views - an array of views to manage.
  */
  setViews: function(views)
  {
    this.__views = views;
    views.each(this.addView.bind(this));
  },
  
  /*
    Function: views (private)
      Returns the list of views managed by this resource.

    Returns:
      An array of SSViews

    See Also: 
      SSView
  */
  views: function()
  {
    return this.__views;
  },
  
  /*
    Function: addView (private)
      Add a view to the managed views list. Also sets a reference
      to this resource in the view.

    Parameter:
      view - An instance of SSView

    See Also:
      SSView
   */
  addView: function(view)
  {
    if(this.views().contains(view)) return;
    this.views().push(view);
    view.setTable(this);
    view.setNeedsDisplay(true);
  },
  
  /*
    Function: hasView
      Check whether this resource is managing a particular view.

    Parameters:
      view - an SSView.

    Returns:
      A boolean.
   */
  hasView: function(view)
  {
    return !this.views().contains(view);
  },
  
  /*
    Function: dirtyTheViews
      Refresh all of the managed views. If the views are visible this will
      trigger an immediate refresh. Force will force the views to refresh.

    Parameters:
      force - an optional boolean to force view refresh.

    See Also:
      SSView __refresh__
   */
  dirtyTheViews: function(force)
  {
    this.views().each(function(view) {
      view.setNeedsDisplay(true);
      view.__refresh__(force);
    }, this);
  },
  
  /*
    Function: passesConditions (private)
      Checks that a document passes the conditions for a particular resource specification.
      
    Parameters:
      rsrcSpecHashed - a hashed resource specification.
      value - a document.

    Returns:
      A boolean.

    See Also:
      matchSpec
   */
  passesConditions: function(rsrcSpecHashed, value)
  {
    var conditions = this.conditions()[rsrcSpecHashed], len = (conditions) ? conditions.length : 0;
    if(!conditions || len == 0) return true;
    for(var i = 0, len; i < len; i++) if(!conditions[i](value)) return false;
    return true;
  },
  
  /*
    Function: matchSpec (private)
      Not meant to be called directly. Called by SSApp on this resource. Checks to
      see if a remove event matches any handlers for this resource.

    Parameters:
      rsrcSpecHashed - a hashed resource specification.
      value - the current value of a document.
      oldValue - the previous value of a document if applicable.

    See Also:
      passesConditions
   */
  matchSpec: function(rsrcSpecHashed, value, oldValue)
  {
    if(!this.passesConditions(rsrcSpecHashed, value)) return;
    var handlers = this.handlers()[rsrcSpecHashed];
    handlers.each(function(fn) {
      fn.bind(this)(value, oldValue, rsrcSpecHashed);
    }, this);
  },
  
  /*
    Function: cleanup
      Removes the cache associated with this resource. Remove all events
      from the global application server assocaited with this resource.
      Removes self from any views associated with this resource.
   */
  cleanup: function()
  {
    SSApplication().removeCache(this.getName());
    SSApplication().removeWatcher(this);
    this.views().each(Function.msg('setTable', null));
  },
  
  /*
    Function: dispose
      Calls SSDeleteTable.

    See Also:
      SSDeleteTable
   */
  dispose: function()
  {
    SSDeleteTable(this.getName());
  },
  
  /*
    Function: refresh
      Removes the cache associated with this resource. Dirties all
      associated views.
   */
  refresh: function()
  {
    SSApplication().removeCache(this.getName());
    this.dirtyTheViews(true);
  },


  optionsForTable: function()
  {
    var delegate = this.delegate();
    return (delegate && delegate.optionsForTable && delegate.optionsForTable(this)) || {};
  }
});

SSTable.protocol = {
  "getName": "function",
  "hasView": "function"
};

SSTable.dirtyTheViews = function(value)
{
  this.dirtyTheViews();
}

SSTable.updateViews = function(newValue, oldValue)
{
  this.updateViews(newValue, oldValue);
}

SSTable.updateDoc = function(doc)
{ 
  SSApplication().setDocument(this.getName(), doc);
}

SSTable.dirtyAllViews = function(value)
{
  __resources.each(function(v, k) {
    v.dirtyTheViews();
  });
}