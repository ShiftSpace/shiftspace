// ==Builder==
// @required
// ==/Builder==

Event.Keys.shift = 16;

Array.implement({
  first: function() {
    return this[0];
  },
  
  rest: function() {
    return this.slice(1, this.length);
  },
  
  drop: function(n) {
    return this.slice(n, this.length);
  },
  
  isEmpty: function() {
    return this.length == 0;
  },
  
  isEqual: function(ary) {
    if(this.length != ary.length) return false;
    for(var i = 0; i < this.length; i++)
    {
      if(this[i] != ary[i]) return false;
    }
    return true
  }
});

/*
var verify = function(fn) {
   return function() {
      var args = $A(arguments);
      if($type(args[0]) != "string")
      {
         throw new Error("First arg is not a string");
      }
      else
      {
         return fn.apply(null, args);
      }
   }
};

var myfn = function(argA, argB) {
  console.log("Hello from myfn! argA " + argA + ", argB " + argB);
}.decorate(verify);

myfn("foo", "bar");
myfn(2, "bar");
*/

Function.implement({
  decorate: function()
  {
    var decorators = $A(arguments);
    var resultFn = this;
    decorator = decorators.pop();
    
    while(decorator)
    {
      resultFn = decorator(resultFn);
      decorator = decorators.pop();
    }
    
    return resultFn;
  }
});

function $msg(methodName) {
  var rest = $A(arguments).drop(1);
  return function(obj) {
    return obj[methodName].apply(obj, rest);
  };
};

function $get(first, prop) {
  var args = $A(arguments);
  var rest = args.drop(2);
  var next;
  
  if(rest.length == 0) return first[prop];
  if(['object', 'array'].contains($type(first)))
  {
    next = first[prop];
  }
  if($type(next) == 'function')
  {
    next = first[prop]();
  }
  return (next == null) ? null : $get.apply(null, [next].concat(rest));
};

function $getf(first, prop) {
  return $get.apply(null, arguments) || $empty;
};

// allows for queries on namespaced attributes
Selectors.RegExps = {
  id: (/#([\w-]+)/),
  tag: (/^(\w+|\*)/),
  quick: (/^(\w+|\*)$/),
  splitter: (/\s*([+>~\s])\s*([a-zA-Z#.*:\[])/g),
  combined: (/\.([\w-]+)|\[([\w:]+)(?:([!*^$~|]?=)(["']?)([^\4]*?)\4)?\]|:([\w-]+)(?:\(["']?(.*?)?["']?\)|$)/g)
};

String.implement({
  repeat: function(times) {
    var result = "";
    for(var i = 0; i < times; i++) {
      result += this;
    }
    return result;
  }
});

Function.implement({
  partial: function(bind, args) {
    var self = this;
    args = $splat(args);
    return function() {
      return self.apply(bind, args.concat($A(arguments)));
    };
  }
});

function $id(node)
{
  return node._ssgenId();
}

Element.implement({
  _ssgenId: function()
  {
    var id = this.getProperty('id');
    if(!id)
    {
      id = Math.round(Math.random()*1000000+(new Date()).getMilliseconds());
      this.setProperty('id', 'generatedId_'+id);
    }
    return id;
  },
  _getElement: function(sel)
  {
    this._ssgenId();
    return (new Document(this.ownerDocument)).getWindow().$$('#' + this.getProperty('id') + ' ' + sel)[0];
  },
  _getElements: function(sel)
  {
    this._ssgenId();
    return (new Document(this.ownerDocument)).getWindow().$$('#' + this.getProperty('id') + ' ' + sel);
  },
  isEqual: function(node)
  {
    var id = this.getProperty('id');
    var oid = node.getProperty('id');
    return (this == node) || 
           (id && oid && (id == oid));
  }
});

var IFrame = new Native({

  name: 'IFrame',

  generics: false,

  initialize: function(){
    var params = Array.link(arguments, {properties: Object.type, iframe: $defined});
    var props = params.properties || {};
    var iframe = $(params.iframe) || false;
    var onload = props.onload || $empty;
    delete props.onload;
    props.id = props.name = $pick(props.id, props.name, iframe.id, iframe.name, 'IFrame_' + $time());
    iframe = new Element(iframe || 'iframe', props);
    var onFrameLoad = function(){
      var host = $try(function(){
        return iframe.contentWindow.location.host;
      });
      if ((host && host == window.location.host) || !host){ // CHANGE: so that frames with no host work - David
        var win = new Window(iframe.contentWindow);
        var doc = new Document(iframe.contentWindow.document);
        if(!win.Element.prototype) win.Element.prototype = {}; // CHANGE: fix for GM and MT1.2 IFrames - David
        $extend(win.Element.prototype, Element.Prototype);
      }
      onload.call(iframe.contentWindow, iframe.contentWindow.document);
    };
    (!window.frames[props.id]) ? iframe.addListener('load', onFrameLoad) : onFrameLoad();
    return iframe;
  }

});

Selectors.Utils.genId = function(self){
  var id = self.getProperty('id');
  if(!id){
    id = 'genId'+Math.round(Math.random()*1000000+(new Date()).getMilliseconds());
    self.setProperty('id', id);
  }
  return id;
};

Selectors.Utils.search = function(self, expression, local){
  var splitters = [];
  
  var selectors = expression.trim().replace(Selectors.RegExps.splitter, function(m0, m1, m2){
    splitters.push(m1);
    return ':)' + m2;
  }).split(':)');

  // allows .getElement('> selector') and .getElements('> selector')
  selectors = selectors.filter(function(selector) { return (selector != '');});
  
  
  if(splitters.length == selectors.length){
    return self.getWindow().$$('#'+this.genId(self)+' '+expression);
  }
  

  var items, match, filtered, item;

  for (var i = 0, l = selectors.length; i < l; i++)
  {

    var selector = selectors[i];

    if (i == 0 && Selectors.RegExps.quick.test(selector))
    {
      items = self.getElementsByTagName(selector);
      continue;
    }

    var splitter = splitters[i - 1];

    var tagid = Selectors.Utils.parseTagAndID(selector);
    var tag = tagid[0], id = tagid[1];

    if (i == 0){
      items = Selectors.Utils.getByTagAndID(self, tag, id);
    } else {
      var uniques = {}, found = [];
      for (var j = 0, k = items.length; j < k; j++) found = Selectors.Getters[splitter](found, items[j], tag, id, uniques);
      items = found;
    }

    var parsed = Selectors.Utils.parseSelector(selector);

    if (parsed)
    {
      filtered = [];
      for (var m = 0, n = items.length; m < n; m++)
      {
        item = items[m];
        if (Selectors.Utils.filter(item, parsed, local)) filtered.push(item);
      }
      items = filtered;
    }
  }
  return items;
};

Fx.CSS.implement({
  search: function(selector){
    if (Fx.CSS.Cache[selector]) return Fx.CSS.Cache[selector];
    var to = {};
    
    function extract(sheet, j){
      var href = sheet.href;
      if (href && href.contains('://') && !href.contains(document.domain)) return;
      var rules = sheet.rules || sheet.cssRules;
      if(sheet.imports) Array.each(sheet.imports, extract);
      Array.each(rules, function(rule, i){
        if (rule.styleSheet) extract(rule.styleSheet);
        if (!rule.style) return;
        var selectorText = (rule.selectorText) ? rule.selectorText.replace(/^\w+/, function(m){
          return m.toLowerCase();
        }) : null;
        if (!selectorText || !selectorText.test('^' + selector + '$')) return;
        Element.Styles.each(function(value, style){
          if (!rule.style[style] || Element.ShortStyles[style]) return;
          value = String(rule.style[style]);
          to[style] = (value.test(/^rgb/)) ? value.rgbToHex() : value;
        });
      });
    }
    Array.each(document.styleSheets, extract);
    return Fx.CSS.Cache[selector] = to;
  }
});

Request.implement({
  send: function(options){
		if (!this.check(options)) return this;
		this.running = true;

		var type = $type(options);
		if (type == 'string' || type == 'element') options = {data: options};

		var old = this.options;
		options = $extend({data: old.data, url: old.url, method: old.method}, options);
		var data = options.data, url = options.url, method = options.method.toLowerCase();

		switch ($type(data)){
			case 'element': data = document.id(data).toQueryString(); break;
			case 'object': case 'hash': data = Hash.toQueryString(data);
		}

		if (this.options.format){
			var format = 'format=' + this.options.format;
			data = (data) ? format + '&' + data : format;
		}

		if (this.options.emulation && !['get', 'post'].contains(method)){
			var _method = '_method=' + method;
			data = (data) ? _method + '&' + data : _method;
			method = 'post';
		}
    
		if (this.options.urlEncoded && method == 'post' && !this.headers.get('Content-type')){
			var encoding = (this.options.encoding) ? '; charset=' + this.options.encoding : '';
			this.headers.set('Content-type', 'application/x-www-form-urlencoded' + encoding);
		}

		if (this.options.noCache){
			var noCache = 'noCache=' + new Date().getTime();
			data = (data) ? noCache + '&' + data : noCache;
		}

		var trimPosition = url.lastIndexOf('/');
		if (trimPosition > -1 && (trimPosition = url.indexOf('#')) > -1) url = url.substr(0, trimPosition);

		if (data && method == 'get'){
			url = url + (url.contains('?') ? '&' : '?') + data;
			data = null;
		}

		this.xhr.open(method.toUpperCase(), url, this.options.async);

		this.xhr.onreadystatechange = this.onStateChange.bind(this);

		this.headers.each(function(value, key){
			try {
				this.xhr.setRequestHeader(key, value);
			} catch (e){
				this.fireEvent('exception', [key, value]);
			}
		}, this);

		this.fireEvent('request');
		this.xhr.send(data);
		if (!this.options.async) this.onStateChange();
		return this;
	}
});