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
    this.setCache({});
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
  
  
  updateCache: function(name, data, merge)
  {
    var cache = this.cache();
    if(!cache[name] || merge === false) cache[name] = {};
    if($type(data) != 'array') data = $splat(data);
    data.each(this.setDocument.partial(this, name));
  },
  
  
  deleteFromCache: function(name, id)
  {
    delete this.cache()[name][id];
  },
  

  allCachedDocuments: function()
  {
    var merged = {};
    var cache = this.cache();
    for(var resourceName in cache)
    {
      var resource = cache[resourceName];
      for(var i = 0, len = resource.length; i < len; i++)
      {
        var doc = resource[i];
        merged[doc._id] = doc;
      }
    }
    return merged;
  },


  getDocument: function(id)
  {
    return this.allCachedDocuments[id];
  },
  
  
  documentForIndex: function(cacheName, idx)
  {
    return this.cache()[cacheName][idx];
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
  
  
  notifyWatchers: function(rsrcSpec, value)
  {
    var resourceSpec = $hash($H(rsrcSpec).extract(['resource', 'method'], true));
    var watchers = this.__watchersFor__(resourceSpec);
    watchers.each($msg('matchSpec', resourceSpec, value));
    
    if(rsrcSpec.id)
    {
      var idSpec = $hash($H(rsrcSpec).extract(['resource', 'method', 'id'], true));
      watchers = this.__watchersFor__(idSpec);
      watchers.each($msg('matchSpec', idSpec, value));
    }
    
    if(rsrcSpec.action)
    {
      var actionSpec = $hash($H(rsrcSpec).extract(['resource', 'method', 'action'], true));
      watchers = this.__watchersFor__(actionSpec);
      watchers.each($msg('matchSpec', actionSpec, value));
    }
    
    if(rsrcSpec.action && rsrcSpec.id)
    {
      var actionIdSpec = $hash($H(rsrcSpec).extract(['resource', 'method', 'action', 'id'], true));
      watchers = this.__watchersFor__(actionIdSpec);
      watchers.each($msg('matchSpec', actionIdSpec, value));
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
        if(options && options.local) this.updateCache(options.local, value);
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
        if(options && options.local) this.updateCache(options.local, value, true);
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
        this.notifyWatchers(upaateRsrcSpec, value);
        if(options && options.local) this.updateCache(options.local, value);
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
        if(options && options.local) this.deleteLocal(options.local, id);
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
        this.notifyWatchers(postRsrcSpec, value);
        if(options && options.local) this.updateCache(options.local, value);
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
        if(options && options.local) this.updateCache(options.local, value);
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

  
  confirm: function (value)
  {
    SSLog('confirm:', SSLogForce);
    SSLog(value, SSLogForce);
  }.asPromise(),


  noErr: function(v, allowNull)
  {
    if(allowNull === false && (v === undefined || v === null)) return false;
    return (v && v.error) ? false : true;
  }.asPromise(),
  
  
  hasData: function(v)
  {
    return (!v.message && !v.error) ? true : false;
  }.asPromise(),

  
  showErr: function(err)
  {
    alert(err.error);
  }.asPromise()

});
