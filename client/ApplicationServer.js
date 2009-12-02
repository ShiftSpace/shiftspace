// ==Builder==
// @package           App
// ==/Builder==

Hash.implement({
  extract: function(ary, clean)
  {
    var result = $H();
    ary.each(function(key) {
      if(this[key])
      {
        result[key] = this[key];
      }
    }, this);
    return clean ? result.getClean() : result;
  }
});

/*
Class: ApplicationServer
  The main class for talking to a remote ShiftServer. This class tries to eliminate the
  tedium of making remote requests. It leans heavily on the Promises library to eliminate
  request management. It also manages notifying SSTable instances about the occurance
  of calls made to the server. SSTable is the blue between local caches of server side
  documents and the UI.
*/
var ApplicationServer = new Class({
  
  Implements: [Events, Options],
  
  defaults: function() {
    return {
      server: null
    };
  },
  
  eventOrder: ['method', 'resource', 'action'],
  urlOrder: ['resource', 'id', 'action'],  
  
  
  initialize: function(options)
  {
    this.setOptions(this.defaults(), options);
    this.setServer(this.options.server);
    this.setCache({global:{}});
    this.setTables({});
    this.setWatchers({});
    this.initTables();
    this.fireEvent('tableInit');
  },
  
  /*
    Function: initTables
      *abstract*
      To be overriden by subclasses. By convention you should
      define all of your clientside tables here.
  */
  initTables: function() {},
  
  /*
    Function: setCache (private)
      Set the cache hashmap.

    Parameters:
      cache - a object.
   */
  setCache: function(cache)
  {
    this.__cache = cache;
  },
  
  /*
    Function: cache
      Returns a named cache or all caches. Can return the cache
      as an unsorted array if specified.

    Parameters:
      name (optional) - the cache to return.
      asArray - a boolean.

    Returns:
      A cache, all caches
   */
  cache: function(name, options)
  {
    var result = (name) ? this.__cache[name] : this.__cache;
    var asArray = $get(options, 'asArray'), 
        transform = $get(options, 'transform'),
        sort = $get(options, 'sort');
    if(asArray) result = (name) ? $H(result).getValues() : this.allCachedDocuments().getValues();
    if(transform) result = result.map(transform);
    if(sort) result = result.sort(sort);
    return result;
  },
  
  /*
    Function: setDocument
      Set a document in the cache. If no cache name specified will be placed in the
      global cache.

    Parameters:
      cacheName (optional) - a string.
      doc - a document.
   */
  setDocument: function(cacheName, doc)
  {
    cacheName = (cacheName) ? cacheName : 'global';
    if(doc && doc._id)
    {
      var cache = this.cache();
      if(!cache[cacheName]) cache[cacheName] = {};
      cache[cacheName][doc._id] = doc;
    }
  },
  
  /*
    Function: updateDocument
      Takes a document and updates all instances of that
      document in the cache.
      
    Parameters:
      doc - a document. Must have _id property.
      
    Returns:
      The document.
  */
  updateDocument: function(doc)
  {
    if(!doc._id) return doc;
    $H(this.cache()).each(function(cache, name) {
      if(cache[doc._id]) cache[doc._id] = doc;
    }, this);
    return doc;
  },
  
  /*
    Function: updateCache (private)
      Takes an array of documents adds them to the specified
      cache. If none specified, documents are placed in the
      global cache.

    Parameters:
      docs - an array of documents.
      name - a string.
   */
  updateCache: function(docs, name)
  {
    var cache = this.cache(), name = (name) ? name : 'global';
    if(!cache[name]) cache[name] = {};
    if($type(docs) != 'array') docs = $splat(docs);
    docs.each(this.setDocument.partial(this, name));
  },
  
  /*
    Function: removeCache
      Removes a cache by name.

    Parameters:
      name - a string.
   */
  removeCache: function(name)
  {
    delete this.cache()[name];
  },
  
  /*
    Function: deleteFromCache
      Delete a document from the cache. If no cache name is specified will delete
      that document from every cache.

    Parameters:
      id - document id.
      name - a string.
   */
  deleteFromCache: function(id, name)
  {
    var caches = this.cache();
    for(var cache in caches)
    {
      if((name && cache == name) || !name)
      {
        delete caches[cache][id];
      }
    }
  },
  
  /*
    Function: allCachedDocuments
      Returns a hash map of all the cached documents.
    
    Returns:
      An object.
   */
  allCachedDocuments: function()
  {
    var merged = {}, cache = this.cache();
    for(var resourceName in cache) merged = $merge(merged, cache[resourceName]);
    return merged;
  },

  /*
    Function: getDocument
      Get a document from the cache by its id.

    Parameters:
      id - a document id.

    Returns:
      a document.
   */
  getDocument: function(id)
  {
    return this.allCachedDocuments()[id];
  },
  
  /*
    Function: setTables (private)
      Set the hash map to store SSTable instances.

    Parameters:
      resource - a object.
   */
  setTables: function(resources)
  {
    this.__resources = resources;
  },
  
  /*
    Function: resources (private)
      Returns the hash map of all SSTable instances used by this application server.

    Returns:
      A object.
   */
  resources: function()
  {
    return this.__resources;
  },
  

  /*
    Function: addResource (private)
      Add a tracked resource. Not meant to be called directly. SSTable instances
      add themselves.

    Parameters:
      resource - a SSTable instance.
   */
  addResource: function(resource)
  {
    this.resources()[resource.getName()] = resource;
  },
  
  /*
    Function: setServer (private)
      Set the server url. Not meant to be used directly. Server should be passed
      as an option on instantiation. Consult documentation.

    Parameters:
      url - a string.
   */
  setServer: function(url)
  {
    this.__server = url;
  },
  
  /*
    Function: server
      Return the url used by this application server.

    Returns:
      A string.
   */
  server: function()
  {
    return this.__server;
  },
  
  /*
    Function: isNull (private)
      Utility for checking if a value is null.
    
    Parameters:
      v - a JavaScript value.

    Returns:
      a boolean.
   */
  isNull: function(v)
  {
    return v != null;
  },
  
  /*
    Function: genUrl (private)
      Generate the url for a server call.

    Parameters:
      parts - the parts of a url

    See Also:
      call
   */
  genUrl: function(parts)
  {
    var ary = this.urlOrder.map(function(pname) {
      return parts[pname];
    }).filter(this.isNull);
    return ary.join('/');
  },
  
  /*
    Function: setWatchers (private)
      Set the watchers hash map. Not meant to be called directly.

    Parametesr:
      watchers - a object.
   */
  setWatchers: function(watchers)
  {
    this.__watchers = watchers;
  },
  
  /*
    Function: watchers
      Return the list of watchers.

    Returns:
      An array of watchers.
   */
  watchers: function()
  {
    return this.__watchers;
  },
  
  /*
    Function: watchersFor
      Return the list of watchers for a resource specification.

    Parameters:
      rsrcSpec - a resource specification.

    See Also:
      SSTable.matchSpec
   */
  watchersFor: function(rsrcSpec)
  {
    return this.__watchersFor__($hash(rsrcSpec));
  },
  
  /*
    Function: __watchersFor__ (private)
      Not meant to be called directly. Returns the list of watchers for
      a hashed resource specfication.

    Parameters:
      rsrcSpecHashed - a hashed resource specification.

    See Also:
      watchersFor, $hash
   */
  __watchersFor__: function(rsrcSpecHashed)
  {
    var watchers = this.watchers()[rsrcSpecHashed];
    return watchers || [];
  },
  
  
  /*
    Function: addWatcher
      Add a watcher for a resource specification.

    Parameters:
      watcher - a SSTable instance.
      rsrcSpec - a resource specification.

    See Also:
      SSTable.matchSpec
   */
  addWatcher: function(watcher, rsrcSpec)
  {
    var watchers = this.watchers(), hashed = $hash(rsrcSpec);
    if(!watchers[hashed]) watchers[hashed] = [];
    watchers[hashed].push(watcher);
  },
  
  /*
    Function: removeWatcher
      Remove a wathcer for a resource specification.

    Parameters:
      watcher - a SSTable instance.
      rsrcSpec - a resource specification.
   */
  removeWatcher: function(watcher, rsrcSpec)
  {
    var watchers = this.watchers();
    if(rsrcSpec)
    {
      watchers[$hash(rsrcSpec)].erase(watcher);
    }
    else
    {
      for(var rsrcSpec in watchers)
      {
        watchers[rsrcSpec].erase(watcher);
      }
    }
  },
  
  /*
    Function: specsForWatcher (private)
      Returns the resource specifications for a watcher.
   
    Parameters:
      watcher - a SSTable instance.
   */
  specsForWatcher: function(watcher)
  {
    var watchers = this.watchers(), result = [];
    for(var rsrcSpec in watchers)
    {
      if(watchers[rsrcSpec].contains(watcher)) result.push(rsrcSpec);
    }
    return result;
  },
  
  /*
    Function: notifyWatchers (private)
      Notify all watchers listening for a particular resource specification.

    Parameters:
      rsrcSpec - a resource specification.
      value - the document value.
      oldValue - the previous document value if applicable.
   */
  notifyWatchers: function(rsrcSpec, value, oldValue)
  {
    var resourceSpec = $hash($H(rsrcSpec).extract(['resource', 'method'], true));
    var watchers = this.__watchersFor__(resourceSpec);
    watchers.each(Function.msg('matchSpec', resourceSpec, value, oldValue));
    
    if(rsrcSpec.id)
    {
      var idSpec = $hash($H(rsrcSpec).extract(['resource', 'method', 'id'], true));
      watchers = this.__watchersFor__(idSpec);
      watchers.each(Function.msg('matchSpec', idSpec, value, oldValue));
    }
    
    if(rsrcSpec.action)
    {
      var actionSpec = $hash($H(rsrcSpec).extract(['resource', 'method', 'action'], true));
      watchers = this.__watchersFor__(actionSpec);
      watchers.each(Function.msg('matchSpec', actionSpec, value, oldValue));
    }
    
    if(rsrcSpec.action && rsrcSpec.id)
    {
      var actionIdSpec = $hash($H(rsrcSpec).extract(['resource', 'method', 'action', 'id'], true));
      watchers = this.__watchersFor__(actionIdSpec);
      watchers.each(Function.msg('matchSpec', actionIdSpec, value, oldValue));
    }
  },
  
  
  /*
    Function: call (private)
      Main function for producing promises for requests to the server.
    
    Parameters:
      options - the following options are supported
        resource, the resource 
        id, the id of the resource being acted upon
        method, the url method (post, get, put, delete)
        action, the action to take on the resource
        data, url paramaters or json payload
        json, whether to send data as a JSON string

    Returns:
      A promise.
   */
  call: function(options)
  {
    var urlParts = $H(options).extract(this.urlOrder);
    options = $H(options).filter(function(v, k) {
      return !this.urlOrder.contains(k);
    }, this);
    
    options = $merge(options.getClean(), {
      url: this.server() + this.genUrl(urlParts),
      emulation: false
    });
    
    if(options.json)
    {
      if(!options.headers) options.headers = {};
      options.headers['Content-type'] = 'application/json';
      options.data = JSON.encode(options.data);
      delete options.json;
    }

    SSLog("REQUEST:", options.url, SSLogRequest);
    return new Request(options);
  }.decorate(promise),
  
  /*
    Function: create
      Create a new document using the specified data and resource type.

    Parameters:
      resource - the resource type
      data - the contents of the new resource
      options - the following options are allowed
        local, associate the new document with a named cached.

    Returns:
      A promise for the newly created document.
   */
  create: function(resource, data, options)
  {
    var p = this.call({resource:resource, method:'post', data:data, json: true});
    p.op(function(value) {
      if(this.noErr(value))
      {
        var rsrcSpec = {resource:'shift', method:'create'};
        this.updateCache(value, (options && options.local));
        this.notifyWatchers(rsrcSpec, value);
        return value;
      }
      else
      {
        SSLog("Create failed", value, SSLogError);
        return value;
      }
    }.bind(this));
    return p;
  },
  
  /*
    Function: read
      Read a resource.

    Parameters:
      resource - the resource type.
      id - the resource id.
      options - the following options are supported
        local, associated the loaded document with a named cache.
   */
  read: function(resource, id, options)
  {
    var p = this.call({resource:resource, id:id, method:'get'});
    p.op(function(value) {
      if(this.noErr(value))
      {
        var readRsrcSpec = {resource:resource, method:'read', id:id};
        this.updateCache(value, (options && options.local));
        this.notifyWatchers(readRsrcSpec, value);
        return value;
      }
      else
      {
        SSLog("Read failed", value, SSLogError);
        return value;
      }
    }.bind(this));
    return p;
  },
  
  /*
    Function: update
      Update a remote document.
    
    Paramters:
      resource - the resource type.
      id - the resouurce id.
      data - the updated document.
      options - the following option are supported
        local, update the specified named cache, otherwise all caches are updated.

    Returns:
      A promise for the updated document.
   */
  update: function(resource, id, data, options)
  {
    var p = this.call({resource:resource, id:id, method:'put', data:data, json: true});
    p.op(function(value) {
      if(this.noErr(value))
      {
        var updateRsrcSpec = {resource:resource, method:'update', id:id};
        var oldValue = this.allCachedDocuments()[id];
        this.updateDocument(value);
        this.notifyWatchers(updateRsrcSpec, value, oldValue);
        return value;
      }
      else
      {
        SSLog("Update failed", value, SSLogError);
        return value;
      }
    }.bind(this));
    return p;
  },
  
  /*
    Function:
      Delete a document from the server.

    Parameters:
      resource - a resource type.
      id - a resource id.
      options - the following options are supported
        local, delete only from a specified cache. Otherwise this document is deleted from
        all caches.

     Returns:
       A promise for the ack.
   */
  'delete': function(resource, id, options)
  {
    var p = this.call({resource:resource, id:id, method:'delete'});
    p.op(function(value) {
      if(this.noErr(value)) 
      {
        var deleteRsrcSpec = {resource:resource, method:'delete', id:id};
        this.deleteFromCache(id, (options && options.local));
        this.notifyWatchers(deleteRsrcSpec, value);
        return value;
      }
      else
      {
        SSLog("Delete failed", value, SSLogError);
        return value;
      }
    }.bind(this));
    return p;
  },
  
  /*
    Function: post
      A simplified way to run other actions on remote resources.
      
    Parameters:
      postOptions - the following options are supported
        resource, the resource type
        id, a resource id
        action, the action to take
        data, a JSON object representing the data
        json, flag to send data as Content-Type application/json

     Returns:
       A proimse for the server return value.
   */
  post: function(postOptions, options)
  {
    var p = this.call($merge(postOptions, {method:'post'}));
    p.op(function(value) {
      if(this.noErr(value))
      {
        var postRsrcSpec = {resource:postOptions.resource, action:postOptions.action, id:postOptions.id};
        var oldValue = this.allCachedDocuments()[postOptions.id];
        this.updateDocument(value);
        this.notifyWatchers(postRsrcSpec, value, oldValue);
        return value;
      }
      else
      {
        SSLog("Post failed", value, SSLogError);
        return value;
      }
    }.bind(this));
    return p;
  },
  
  /*
    Function: get
      A simplified way to make a get request to the server.

    Parameters:
      getOptions - the following options are supported
        resource, the resource type
        id, a resource id
        action, the action to take

    Returns:
      A promise for the server return value.
   */
  get: function(getOptions, options)
  {
    var p = this.call($merge(getOptions, {method:'get'}));
    p.op(function(value) {
      if(this.noErr(value))
      {
        var getRsrcSpec = {resource:getOptions.resource, action:getOptions.action, id:getOptions.id};
        this.updateCache(value, (options && options.local));
        this.notifyWatchers(getRsrcSpec, value);
        return value;
      }
      else
      {
        SSLog("Get failed", value, SSLogError);
        return value;
      }
    }.bind(this));
    return p;
  },

  /*
    Function: confirm
      Takes a promises and forces it to realize synchronously. Useful for
      unit testing.

    Parameters:
      p - a promise.
    
    Returns:
      The actual value of the promise.
   */
  confirm: function (p) { p.setAsync(true); p.realize(); return p.value(); },

  /*
    Function: show
      Takes a promise and prints it to the console asynchronously.
    
    Parameters:
      p - a promise value.

    Returns:
      A promise.
   */
  show: function(v) { SSLog('show:', v, SSLogForce); }.asPromise(),

  /*
    Function: noErr
      Check that a remote value is not an error. If the value is a JSON object
      with an error field, it is an error. A null value is also an error. This
      behavior can be changed with the allowNull parameters.

    Parameters:
      v - the value to check, usually a promise.
      allowNull - bool.

    Returns:
      A promise for a boolean value, or a boolean.
  */
  noErr: function(v, allowNull)
  {
    if(allowNull === false && (v === undefined || v === null)) return false;
    return (v && v.error) ? false : true;
  }.asPromise(),
  
  /*
    Function: hasData
      Check that value has data.
    
    Parameters:
      A promise for JSON object or a JSON object.

    Returns:
      A promise for a boolean value or a boolean value.
   */
  hasData: function(v)
  {
    return (!v.message && !v.error) ? true : false;
  }.asPromise(),

  /*
    Function: showErr
      Alert an error value. For debugging.

    Parameters:
      err - a promise for a error JSON object or a JSON object.
   */
  showErr: function(err)
  {
    alert(err.error);
  }.asPromise()
});
