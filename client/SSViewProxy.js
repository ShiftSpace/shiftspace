var SSViewProxy = new Class({
  
  name: "SSViewProxy",
  
  Implements: Options,

  initialize: function(el, options)
  {
    // store the element
    this.element = el;
    // generate an id for the element
    el._ssgenId();
    // set messages
    this.setMessages([]);
    // add a listener for this element
    SSAddInstantiationListener(el, this);
  },
  
  
  onInstantiate: function()
  {
    this.deliverMessages();
  },
  
  
  adoptClassMethods: function()
  {
    
  },
  

  setMessages: function(newMessages)
  {
    this.__messages__ = newMessages;
  },
  

  messages: function()
  {
    return this.__messages__;
  },
  

  deliverMessages: function()
  {
    var controller = this.element.retrieve('__ssviewcontroller__');
    this.messages().each(function(message) {
      controller[message.name].apply(controller, message.arguments);
    });
  },
  

  show: function()
  {
    // add a show message
    this.messages().push({name:'show', arguments:$A(arguments)});
  },
  

  hide: function()
  {
    // add a hide message
    this.messages().push({name:'hide', arguments:$A(arguments)});
  },
  

  refresh: function()
  {
    // add a refresh message
    this.messages().push({name:'refresh', arguments:$A(arguments)});
  },
  

  destroy: function()
  {
    
  }
  
});