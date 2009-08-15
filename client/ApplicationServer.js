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
    this.setWatchers($H());
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
  
  
  eventSignature: function(eventSpec)
  {
    return this.eventOrder.map($H(eventSpec).asFn()).filter($identity).join(" ");
  },

  /*
    Function: addWatcher
    
    options - {resource:x, action:y, method:z, fn:cb}
  */
  addWatcher: function(options)
  {
    var watchers = this.watchers();
    var sig = this.eventSignature(options);
    if(!watchers[sig]) watchers[resource] = [];
    watchers[sig].push(options.fn);
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
  
  
  create: function(resource, data)
  {
    var p = this.call({resource:resource, method:'post', data:data, json: true});
    p.op(function(value) {
      var watchers = this.watchers()['create '+resource];
      if(watchers) watchers.each($apply(value));
      return value;
    }.bind(this));
    return p;
  },
  
  
  read: function(resource, id)
  {
    var p = this.call({resource:resource, id:id, method:'get'});
    p.op(function(value) {
      var watchers = this.watchers()['read '+resource];
      if(watchers) watchers.each($apply(value));
      return value;
    }.bind(this));
    return p;
  },
  
  
  update: function(resource, id, data)
  {
    var p = this.call({resource:resource, id:id, method:'put', data:data, json: true});
    p.op(function(value) {
      var watchers = this.watchers()['update '+resource];
      if(watchers) watchers.each($apply(value));
      return value;
    }.bind(this));
    return p;
  },
  
  
  'delete': function(resource, id)
  {
    var p = this.call({resource:resource, id:id, method:'delete'});
    p.op(function(value) { 
      var watchers = this.watchers()['delete '+resource];
      if(watchers) watchers.each($apply(value));
      return value;
    }.bind(this));
    return p;
  },
  
  
  post: function(options)
  {
    var p = this.call($merge(options, {method:'post'}));
    p.op(function(value) { 
      var watchers = this.watchers()[options.resource+' '+options.action];
      if(watchers) watchers.each($apply(value));
      return value;
    }.bind(this));
    return p;
  },
  
  
  get: function(options)
  {
    var p = this.call($merge(options, {method:'get'}));
    p.op(function(value) {
      var watchers = this.watchers()[options.resource+' '+options.action];
      if(watchers) watchers.each($apply(value));
      return value;
    }.bind(this));
    return p;
  },

  
  confirm: function (value)
  {
    SSLog('confirm:', SSLogForce);
    SSLog(value, SSLogForce);
  }.asPromise(),


  noErr: function(v)
  {
    if(v.error) return false;
    return v;
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
