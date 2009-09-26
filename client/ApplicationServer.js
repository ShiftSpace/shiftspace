// ==Builder==
// @required
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


var ApplicationServer = new Class({
  
  Implements: [Events, Options],
  
  defaults: function() {
    return {
      server: null
    }
  },
  
  eventOrder: ['method', 'resource', 'action'],
  urlOrder: ['resource', 'id', 'action'],  
  
  
  initialize: function(options)
  {
    this.setOptions(this.defaults(), options);
    this.setServer(this.options.server);
    this.setCache({global:{}});
    this.setResources({});
    this.setWatchers({});
  },
  
  
  setCache: function(cache)
  {
    this.__cache = cache;
  },
  
  
  cache: function(name, asArray)
  {
    var result = (name) ? this.__cache[name] : this.__cache;
    if(asArray)
    {
      result = $H(result).getValues();
    }
    return result;
  },
  
  
  setDocument: function(cacheName, doc)
  {
    if(doc && doc._id)
    {
      var cache = this.cache();
      if(!cache[cacheName]) cache[cacheName] = {};
      cache[cacheName][doc._id] = doc;
    }
  },
  
  
  updateCache: function(data, name)
  {
    var cache = this.cache(), name = (name) ? name : 'global';
    if(!cache[name]) cache[name] = {};
    if($type(data) != 'array') data = $splat(data);
    data.each(this.setDocument.partial(this, name));
  },
  
  
  removeCache: function(name)
  {
    delete this.cache()[name];
  },
  
  
  deleteFromCache: function(id, name)
  {
    var caches = (name) ? [this.cache()[name]] : this.cache();
    $H(caches).each(function(cache) {
      delete cache[id];
    });
  },
  

  allCachedDocuments: function()
  {
    var merged = {}, cache = this.cache();
    for(var resourceName in cache) merged = $merge(merged, cache[resourceName]);
    return merged;
  },


  getDocument: function(id)
  {
    return this.allCachedDocuments()[id];
  },
  
  
  documentForIndex: function(cacheName, idx)
  {
    return this.cache(cacheName, true)[idx];
  },
  
  
  setResources: function(resources)
  {
    this.__resources = resources;
  },
  
  
  resources: function()
  {
    return this.__resources;
  },
  
  
  addResource: function(resource)
  {
    this.resources()[resource.getName()] = resource;
  },
  
  
  getResource: function(name)
  {
    return this.resources()[name];
  },

  
  setServer: function(url)
  {
    this.__server = url;
  },
  
  
  server: function()
  {
    return this.__server;
  },
  

  isNull: function(v)
  {
    return v != null;
  },
  
  
  genUrl: function(parts)
  {
    var ary = this.urlOrder.map(function(pname) {
      return parts[pname];
    }).filter(this.isNull);
    
    return ary.join('/');
  },
  
  
  setWatchers: function(watchers)
  {
    this.__watchers = watchers;
  },
  
  
  watchers: function()
  {
    return this.__watchers;
  },
  
  
  watchersFor: function(rsrcSpec)
  {
    return this.__watchersFor__($hash(rsrcSpec));
  },
  
  
  __watchersFor__: function(rsrcSpecHashed)
  {
    var watchers = this.watchers()[rsrcSpecHashed];
    return watchers || [];
  },
  
  
  addWatcher: function(watcher, rsrcSpec)
  {
    var watchers = this.watchers(), hashed = $hash(rsrcSpec);
    if(!watchers[hashed]) watchers[hashed] = [];
    watchers[hashed].push(watcher);
  },
  
  
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
  
  
  specsForWatcher: function(watcher)
  {
    var watchers = this.watchers(), result = [];
    for(var rsrcSpec in watchers)
    {
      if(watchers[rsrcSpec].contains(watcher)) result.push(rsrcSpec);
    }
    return result;
  },
  
  
  notifyWatchers: function(rsrcSpec, value, oldValue)
  {
    var resourceSpec = $hash($H(rsrcSpec).extract(['resource', 'method'], true));
    var watchers = this.__watchersFor__(resourceSpec);
    watchers.each($msg('matchSpec', resourceSpec, value, oldValue));
    
    if(rsrcSpec.id)
    {
      var idSpec = $hash($H(rsrcSpec).extract(['resource', 'method', 'id'], true));
      watchers = this.__watchersFor__(idSpec);
      watchers.each($msg('matchSpec', idSpec, value, oldValue));
    }
    
    if(rsrcSpec.action)
    {
      var actionSpec = $hash($H(rsrcSpec).extract(['resource', 'method', 'action'], true));
      watchers = this.__watchersFor__(actionSpec);
      watchers.each($msg('matchSpec', actionSpec, value, oldValue));
    }
    
    if(rsrcSpec.action && rsrcSpec.id)
    {
      var actionIdSpec = $hash($H(rsrcSpec).extract(['resource', 'method', 'action', 'id'], true));
      watchers = this.__watchersFor__(actionIdSpec);
      watchers.each($msg('matchSpec', actionIdSpec, value, oldValue));
    }
  },
  
  
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
    
    return new Request(options);
  }.decorate(promise),
  
  
  create: function(resource, data, options)
  {
    var p = this.call({resource:resource, method:'post', data:data, json: true});
    p.op(function(value) {
      if(this.noErr(value))
      {
        var rsrcSpec = {resource:'shift', method:'create'};
        this.notifyWatchers(rsrcSpec, value);
        this.updateCache(value, (options && options.local));
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
  
  
  read: function(resource, id, options)
  {
    var p = this.call({resource:resource, id:id, method:'get'});
    p.op(function(value) {
      if(this.noErr(value))
      {
        var readRsrcSpec = {resource:resource, method:'read', id:id};
        this.notifyWatchers(readRsrcSpec, value);
        this.updateCache(value, (options && options.local));
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
  
  
  update: function(resource, id, data, options)
  {
    var p = this.call({resource:resource, id:id, method:'put', data:data, json: true});
    p.op(function(value) {
      if(this.noErr(value))
      {
        var updateRsrcSpec = {resource:resource, method:'update', id:id};
	var oldValue = this.allCachedDocuments()[id];
        this.notifyWatchers(updateRsrcSpec, value);
        this.updateCache(value, (options && options.local));
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
  
  
  'delete': function(resource, id, options)
  {
    var p = this.call({resource:resource, id:id, method:'delete'});
    p.op(function(value) {
      if(this.noErr(value)) 
      {
        var deleteRsrcSpec = {resource:resource, method:'delete', id:id};
        this.notifyWatchers(deleteRsrcSpec, value);
        this.deleteFromCache(id, (options && options.local));
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
  
  
  post: function(postOptions, options)
  {
    var p = this.call($merge(postOptions, {method:'post'}));
    p.op(function(value) {
      if(this.noErr(value))
      {
        var postRsrcSpec = {resource:postOptions.resource, action:postOptions.action, id:postOptions.id};
	var oldValue = this.allCachedDocuments()[postOptions.id];
        this.notifyWatchers(postRsrcSpec, value, oldValue);
        this.updateCache(value, (options && options.local));
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
  
  
  get: function(getOptions, options)
  {
    var p = this.call($merge(getOptions, {method:'get'}));
    p.op(function(value) {
      if(this.noErr(value))
      {
        var getRsrcSpec = {resource:getOptions.resource, action:getOptions.action, id:getOptions.id};
        this.notifyWatchers(getRsrcSpec, value);
        this.updateCache(value, (options && options.local));
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
