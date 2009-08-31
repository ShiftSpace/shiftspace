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

function SSDeleteResource(name)
{
  delete __resources[name];
  //SSPostNotification("resourceDelete", {name:name});
}

var SSResource = new Class({

  Implements: [Events, Options, Delegate],
  name: "SSResource",
  
  defaults: function()
  {
    return {
      resource: null,
      watch: null,
      delegate: null,
      sortFn: null
    }
  },
  
  
  initialize: function(name, options)
  {
    this.setOptions(this.defaults(), options);
    this.setConditions({});
    this.setHandlers({});
    this.setViews([]);
    this.setApp(this.options.app || SSApp);
    if(this.options.resource) this.setResource(this.options.resource);
    if(this.options.watches) this.setWatches(this.options.watches);
    if(this.options.delegate) this.setDelegate(this.options.delegate);
    this.setName(name);
    SSSetResourceForName(name, this);
  },
  
  
  setConditions: function(conditions)
  {
    this.__conditions = conditions;
  },
  
  
  conditions: function()
  {
    return this.__conditions;
  },
  
  
  setHandlers: function(handlers)
  {
    this.__handlers = handlers;
  },
  
  
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
    return this.app().documentForIndex(this.getName(), idx);
  },
  
  
  getLength: function()
  {
    return this.app().cache(this.getName()).length;
  },
  
  
  each: function(fn)
  {
    this.app().cache(this.getName()).each(fn);
  },
  
  
  map: function(fn)
  {
    return this.app().cache(this.getName()).map(fn);
  },
  
  
  filter: function(fn)
  {
    return this.app().cache(this.getName()).filter(fn);
  },
  
  
  setApp: function(app)
  {
    this.__app = app;
    app.addResource(this);
  },
  
  
  app: function()
  {
    return this.__app;
  },
  
  // must define at least read
  setResource: function(resource)
  {
    this.__resource = resource;
  },
  
  
  resource: function()
  {
    return this.__resource;
  },
  
  
  setWatches: function(watches)
  {
    this.__watches = new Set(watches);
    this.__watches.each(function(watch) {
      watch.events.each(function(event) { 
        this.app().addWatcher(event, this);
        var hashed = $hash(event);
        if(watch.conditions) this.conditions()[hashed] = watch.conditions;
        if(watch.handlers) this.handlers()[hashed] = watch.handlers;
      }, this);
    }, this);
  },
  
  
  watches: function()
  {
    return this.__watches;
  },
  
  
  create: function(data, options)
  {
    if(!this.getMethod('create')) { SSLog("Resource " + this.getName() + " does not support create.", SSLogError); return }
    this.dirtyTheViews();
    var p = this.app().create(this.getMethod('create'), data, {local:this.getName()});
    p.op(function(v) { this.fireEvent('onCreate', {resource:this, value:v}); return v; }.bind(this));
    return p;
  },
  
  
  read: function(options)
  {
    if(!this.getMethod('read')) { SSLog("Resource " + this.getName() + " does not support read.", SSLogError); return; }
    options = (this.delegate()) ? $merge(options, this.delegate().optionsForResource(this)) : options;
    var p = this.app().get({resource:this.getMethod('read'), data:options, local:this.getName()});
    p.op(function(v) { this.fireEvent('onRead', {resource:this, value:v}); return v; }.bind(this));
    return p;
  },
  
  
  update: function(idx, data, options)
  {
    if(!this.getMethod('update')) { SSLog("Resource " + this.getName() + " does not support update.", SSLogError); return; }
    var oldValue = this.get(idx);
    this.dirtyTheViews();
    var p = this.app().update(this.getMethod('update'), oldValue._id, data, {local:this.getName()});
    p.op(function(v) { this.fireEvent('onUpdate', {resource:this, oldValue:oldValue, 'newValue':v}); return v; }.bind(this));
    return p;
  },
  
  
  'delete': function(idx, options)
  {
    if(!this.getMethod('update')) { SSLog("Resource " + this.getName() + " does not support update.", SSLogError); return; }
    var oldValue = this.get(idx);
    this.dirtyTheViews();
    var p = this.app()['delete'](this.getMethod('delete'), oldValue._id, {local:this.getName()});
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
  },
  
  
  passesConditions: function(rsrcSpec, doc)
  {
    var conditions = this.conditions()[$hash(rsrcSpec)], len = (conditions) ? conditions.length : 0;
    if(!conditions || len == 0) return true;
    for(var i = 0, len; i < len; i++) if(!conditions[i](doc)) return false;
    return true;
  },
  

  matchSpec: function(rsrcSpec, value)
  {
    SSLog('matchSpec!', rsrcSpec, value, SSLogForce);
    if(!this.passesConditions(value)) return;
    SSLog('conditions passed!', SSLogForce);
    var handlers = this.handlers()[rsrcSpec];
    handlers.each(function(fn) {
      fn.bind(this)(value);
    }, this);
  }
});

SSResource.dirtyTheViews = function(rsrc)
{
  rsrc.dirtyTheViews(true);
}

SSResource.dispatcher = function()
{
  
}