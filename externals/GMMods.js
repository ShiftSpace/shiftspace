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