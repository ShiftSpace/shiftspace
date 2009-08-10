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
    SSSetResourceForName(name, this);
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
    this.__resource = resource;
  },
  
  
  resource: function(method)
  {
    return this.__resource[method];
  },
  
  
  create: function(data)
  {
    this.dirtyTheViews();
    return this.app().create(this.resource('create'), data);
  },
  
  
  read: function(id, options)
  {
    options = (this.delegate()) ? $merge(options, this.delegate().optionsForResource(this)) : options;
    if(id) return this.app().read(this.resource('read'), id);
    return this.app().get({resource:this.resource('read'), data:options});
  },
  
  
  update: function(id, data)
  {
    this.dirtyTheViews();
    return this.app().update(this.resource('update'), id, data);
  },
  
  
  'delete': function(id)
  {
    this.dirtyTheViews();
    return this.app()['delete'](this.resource('delete'), id);
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
  
  
  dirtyTheViews: function()
  {
    this.views().each($msg('setNeedsDisplay', true));
  }
});