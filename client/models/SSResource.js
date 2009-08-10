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
      resource: null,
      watch: null,
      delegate: null
    }
  },
  
  
  initialize: function(name, options)
  {
    this.setOptions(this.defaults(), options);
    if(this.options.resource) this.setResource(this.options.resource);
    if(this.options.watch) this.setWatch(this.options.watch);
    if(this.options.delegate) this.setDelegate(this.options.delegate);
    SSSetResourceForName(name, this);
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
    return SSApp.create(this.resource('create'), data);
  },
  
  
  read: function(id, options)
  {
    options = (this.delegate()) ? $merge(options, this.delegate().optionsForResource(this)) : options;
    if(id) return SSApp.read(this.resource('read'), id);
    return SSApp.get({resource:this.resource('read'), data:options});
  },
  
  
  update: function(id, data)
  {
    return SSApp.update(this.resource('update'), id, data);
  },
  
  
  'delete': function(id)
  {
    return SSApp['delete'](this.resource('delete'), id);
  }
});