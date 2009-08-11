// ==Builder==
// @optional
// @package           ShiftSpaceCore
// ==/Builder==

var __resources = $H();


function SSResourceForName(name)
{
  return __resources[name];
}


function SSSetResourceForName(name, resource)
{
  __resources[name] = resource;
  SSPostNotification("resourceSet", {name:name, resource:resource});
}


var SSResource = new Class({

  Implements: [Events, Options, Delegate],
  name: "SSResource",
  
  mapKeys: {c:"create", r:"read", u:"update", d:"delete"},
  
  defaults: function()
  {
    return {
      app: SSResource.app,
      resource: null,
      watch: null,
      delegate: null
    }
  },
  
  
  initialize: function(name, options)
  {
    this.setOptions(this.defaults(), options);
    this.setViews([]);
    if(this.options.app) this.setApp(this.options.app);
    if(this.options.resource) this.setResource(this.options.resource);
    if(this.options.watch) this.setWatch(this.options.watch);
    if(this.options.delegate) this.setDelegate(this.options.delegate);
    this.setName(name);
    SSSetResourceForName(name, this);
  },
  
  
  setName: function(name)
  {
    this.__name = name;
  },
  
  
  getName: function()
  {
    return this.__name;
  },
  
  
  get: function(idx)
  {
    return this.read()[idx];
  },
  
  
  setApp: function(app)
  {
    this.__app = app;
  },
  
  
  app: function()
  {
    return this.__app;
  },
  
  
  setResource: function(resource)
  {
    resource = $H(resource).changeKeys($H(this.mapKeys).asFn());
    if(resource.o)
    {
      resource = $merge(['create', 'update', 'delete'].zipmap($repeat(3, resource.o)), resource);
      delete resource.o;
    }
    var parts = resource.read.split("/");
    var identifier = (parts.length > 1) ? parts[1] : "{id}";
    resource = $H(resource).changeKeys(function(k){return [k, identifier].join("/");});
    this.__resource = resource;
  },
  
  
  setWatch: function(watch)
  {
    if($type(watch) == 'object')
    {
      var pair = $H(watch).normalize().first();
      var key = pair[0];
      var fn = pair[1].bind(this);
      var parts = key.split(/\s*/);
      var methods = parts.shift();
      var resource = parts.shift();
      var action = parts.shift();
      if(methods == "_")
      {
        this.app().addWatcher({resource:resource, action:action, fn:fn});
      }
      else
      {
        methods.split("").each(function(part) {
          this.app().addWatcher({method:this.mapKeys(part), resource:resource, action:action, fn:fn});
        }.bind(this));
      }
    }
    else if($type(watch) == 'array')
    {
      
    }
  },
  
  
  resource: function(method)
  {
    return this.__resource[method];
  },
  
  
  create: function(data, options)
  {
    this.dirtyTheViews();
    var p = this.app().create(this.resource('create'), data);
    p.op(function(v) { this.fireEvent('onCreate', {resource:this, value:v}); return v; }.bind(this));
    return p;
  },
  
  
  read: function(options)
  {
    options = (this.delegate()) ? $merge(options, this.delegate().optionsForResource(this)) : options;
    var p = this.app().get({resource:this.resource('read'), data:options});
    p.op(function(v) { this.fireEvent('onRead', {resource:this, value:v}); return v; }.bind(this));
    return p;
  },
  
  
  update: function(idx, data, options)
  {
    var oldValue = this.get(idx);
    this.dirtyTheViews();
    var p = this.app().update(this.resource('update'), oldValue._id, data);
    p.op(function(v) { this.fireEvent('onUpdate', {resource:this, oldValue:oldValue, 'newValue':v}); return v; }.bind(this));
    return p;
  },
  
  
  'delete': function(idx, options)
  {
    var oldValue = this.get(idx);
    this.dirtyTheViews();
    var p = this.app()['delete'](this.resource('delete'), oldValue._id);
    p.op(function(v) { this.fireEvent('onDelete', {resource:this, oldValue:v}); return v; }.bind(this));
    return p;
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
  
  
  setDirty: function(val)
  {
    this.__dirty = val;
  },
  
  
  isDirty: function()
  {
    return this.__dirty;
  },
  
  
  dirtyTheViews: function()
  {
    this.views().each($msg('setNeedsDisplay', true));
  }
});

SSResource.dirty = function()
{
  this.setDirty(true);
}