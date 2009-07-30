// ==Builder==
// @required
// ==/Builder==

Browser.Request = function(){
  return $try(function(){
    return new GM.Request();
  }, function(){
    return new XMLHttpRequest();
  }, function(){
    return new ActiveXObject('MSXML2.XMLHTTP');
  });
};

var GM = {};

GM.Request = new Class({
  
  initialize: function(force)
  {
    if(!GM_log && !force)
    {
      throw Error();
    }
    this.headers = {};
    this.__defineGetter__("status", function() { return this.req.status });
    this.__defineGetter__("responseText", function() { return this.req.responseText });
  },
  
  
  open: function(method, url, async)
  {
    this.method = method;
    this.url = url;
  },
  
  
  setRequestHeader: function(key, values)
  {
    this.headers[key] = value;
  },
  
  
  getResponseHeader: function(key)
  {
    return this.req.responseHeaders[key];
  },
  
  
  send: function(data)
  {
    this.req = GM_xmlhttpRequest({
      method: this.method,
      url: this.url,
      headers: this.headers,
      data: data || this.data,
      onreadystatechange: this.onreadystatechange
    });
  }
});

Document.implement({
  getWindow: function(){
    return (new Window(this.defaultView || this.parentWindow));
  }
});

Window.implement({
  $$: function(selector){
    if (arguments.length == 1 && typeof selector == 'string') return (new Document(this.document)).getElements(selector); 
    var elements = [];
    var args = Array.flatten(arguments);
    for (var i = 0, l = args.length; i < l; i++){
      var item = args[i];
      switch ($type(item)){
        case 'element': elements.push(item); break;
        case 'string': (new Document(this.document)).getElements(item, true); break;
      }
    }
    return new Elements(elements);
  },
  
  getDocument: function(){
    return new Document(this.document);
  }
});

Element.implement({
  appendText: function(text, where){
    return this.grab((new Document(this.getDocument())).newTextNode(text), where);
  },

  getWindow: function(){
    return (new Window(this.ownerDocument.defaultView || this.ownerDocument.parentWindow));
  },
  
  getDocument: function(){
    return (new Document(this.ownerDocument));
  },

  getComputedStyle: function(property){
    if ($(this).currentStyle) return $(this).currentStyle[property.camelCase()];
    var computed = $(this).getDocument().defaultView.getComputedStyle($(this), null);
    return (computed) ? computed.getPropertyValue([property.hyphenate()]) : null;
  }
});