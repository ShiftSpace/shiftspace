// ==Builder==
// @required
// @name	            SSViewProxy
// @package           System
// @dependencies      SandalphonSupport
// ==/Builder==

/*
  Class: SSViewProxy
    Private internal class for managing communication between before they are
    actually instantiated. This is very much an implementation detail and should
    probably be revisited. In anycase, do not manipulate this class unless you
    know what you are doing.
    
  See Also:
    <SSView>, <Sandalphon>
*/
var SSViewProxy = new Class({
  Implements: [Options, Events],
  name: "SSViewProxy",
  
  defaults: function() { return {}; },

  initialize: function(el, options)
  {
    this.element = $(el);
    el._ssgenId();
    this.setMessages([]);
    SSAddInstantiationListener(el, this);
  },
  
  onInstantiate: function() { this.deliverMessages(); },
  setMessages: function(newMessages) { this.__messages__ = newMessages; },
  messages: function() { return this.__messages__; },

  deliverMessages: function()
  {
    var controller = SSControllerForNode(this.element);
    this.messages().each(function(message) {
      controller[message.name].apply(controller, message.arguments);
    });
  },

  setDelegate: function() { this.messages().push({name:'setDelegate', arguments:$A(arguments)}); },
  show: function() { this.messages().push({name:'show', arguments:$A(arguments)}); },
  hide: function() { this.messages().push({name:'hide', arguments:$A(arguments)}); },
  refresh: function() { this.messages().push({name:'refresh', arguments:$A(arguments)}); },
  addEvent: function(type, handler) { this.message().push({name:'addEvent', arguments:$A(arguments)}); },
  destroy: function() { }
});