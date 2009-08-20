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
  
  
  cache: function(name)
  {
    return (name) ? this.__cache[name] : this.__cache;
  },
  
  
  setDocument: function(cacheName, doc)
  {
    this.cache()[cacheName][doc._id] = doc;
  },
  
  
  updateCache: function(name, data, merge)
  {
    if(!this.cache()[name]) this.cache()[name] = {};
    if($type(data) != 'array') data = $splat(data);
    if(merge)
    {
      data.each(this.setDocument.partial(this, name));
    }
    else
    {
      this.cache()[name] = data;
    }
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
    var hashed = $hash(rsrcSpec), watchers = this.watchers()[hashed];
    return watchers || [];
  },
  
  
  addWatcher: function(rsrcSpec, watcher)
  {
    var watchers = this.watchers(), hashed = $hash(rsrcSpec);
    if(!watchers[hashed]) watchers[hashed] = [];
    watchers[hashed].push(watcher);
  },
  
  
  notifyWatchers: function(rsrcSpec)
  {
    var resourceSpec = $H(rsrcSpec).extract(['resource', 'method'], true);
    var watchers = this.watchersFor(resourceSpec);
    watchers.each($msg('matchSpec'), resourceSpec);;
    
    if(rsrcSpec.id)
    {
      var idSpec = $H(rsrcSpec).extract(['resource', 'method', 'id'], true);
      watchers = this.watchersFor(idSpec);
      watchers.each($msg('matchSpec'), idSpec);
    }
    
    if(rsrcSpec.action)
    {
      var actionSpec = $H(rsrcSpec).extract(['resource', 'method', 'action'], true);
      wacthers = this.watchersFor(actionSpec);
      watchers.each($msg('matchSpec'), actionSpec);
    }
    
    if(rsrcSpec.action && rsrcSpec.id)
    {
      var actionIdSpec = $H(rsrcSpec).extract(['resource', 'method', 'action', 'id'], true);
      wacthers = this.watchersFor(actionSpec);
      watchers.each($msg('matchSpec'), actionIdSpec);
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
        this.notifyWatchers(rsrcSpec);
        if(options.local) this.updateCache(options.local, value);
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
        this.notifyWatchers(readRsrcSpec);
        if(options.local) this.updateCache(options.local, value, true);
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
        this.notifyWatchers(upaateRsrcSpec);
        if(options.local) this.updateCache(options.local, value);
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
        this.notifyWatchers(deleteRsrcSpec);
        if(options.local) this.deleteLocal(options.local, id);
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
  
  
  post: function(options)
  {
    var p = this.call($merge(options, {method:'post'}));
    p.op(function(value) {
      if(this.noErr(value))
      {
        var postRsrcSpec = {resource:options.resource, action:options.action, id:options.id};
        this.notifyWatchers(postRsrcSpec);
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
  
  
  get: function(options)
  {
    var p = this.call($merge(options, {method:'get'}));
    p.op(function(value) {
      if(this.noErr(value))
      {
        var getRsrcSpec = {resource:options.resource, action:options.action, id:options.id};
        this.notifyWatchers(getRsrcSpec);
        if(options.local) this.updateCache(options.local, value);
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
