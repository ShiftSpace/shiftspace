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
  
  name: "GM.Request",
  
  initialize: function(force)
  {
    if(!GM_log && !force)
    {
      throw Error();
    }
    this.headers = {};
  },
  
  
  __onreadystatechange__: function(responseDetails)
  {
    this.status = responseDetails.status;
    this.statusText = responseDetails.statusText;
    this.responseHeaders = responseDetails.responseHeaders;
    this.responseText = responseDetails.responseText;
    this.readyState = responseDetails.readyState;
    if(this.onreadystatechange && $type(this.onreadystatechange) == 'function') this.onreadystatechange();
  },
  
  
  open: function(method, url)
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
    return this.responseHeaders[key];
  },
  
  
  send: function(data)
  {
    GM_xmlhttpRequest({
      method: this.method,
      url: this.url,
      headers: this.headers,
      data: data,
      onreadystatechange: this.__onreadystatechange__.bind(this)
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