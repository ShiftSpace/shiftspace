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
  

  initialize: function(options)
  {
    this.setOptions(this.defaults(), options);
    this.setServer(this.options.server);
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
  
  
  urlOrder: ['resource', 'id', 'action'],
  
  
  genUrl: function(parts)
  {
    var ary = this.urlOrder.map(function(pname) {
      return parts[pname];
    }).filter(this.isNull);
    
    return ary.join('/');
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
    return this.call({resource:resource, method:'post', data:data, json: true});
  },
  
  
  read: function(resource, id)
  {
    return this.call({resource:resource, id:id, method:'get'});
  },
  
  
  update: function(resource, id, data)
  {
    return this.call({resource:resource, id:id, method:'put', data:data});
  },
  
  
  delete: function(resource, id)
  {
    return this.call({resource:resource, id:id, method:'delete'});
  },
  
  
  post: function(options)
  {
    return this.call($merge(options, {method:'post'}));
  },
  
  
  get: function(options)
  {
    return this.call($merge(options, {method:'get'}));
  }

});


var confirm = function (value) {
  SSLog('confirm:', SSLogForce);
  SSLog(value, SSLogForce);
}.asPromise();


var noErrGenerator = function(cb) {
  return function(value) {
    if(!value.error) return value;
    return cb(value);
  }.asPromise();
};

var noErr = noErrGenerator(function(v) {
  alert(v.error);
});

/*
var app = new ApplicationServer();
confirm(app.post({action:"login", data:fakemary, json:true}))
*/