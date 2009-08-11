// ==Builder==
// @required
// ==/Builder==

Event.Keys.shift = 16;

function $identity(v)
{
  return v;
}

function $call(fn)
{
  if(fn && $type(fn) == 'function') fn();
}

function $apply()
{
  var args = $A(arguments);
  return function(fn) {
    return fn.apply(null, args);
  };
}

function $callable(v)
{
  return v && $type(v) == 'function';
}

function $not(fn)
{
  return function() {
    return !fn.apply(this, $A(arguments));
  }
}

String.implement({
  
  tail: function(n)
  {
    return this.substring(this.length-(n || 1));
  },
  
  
  drop: function(n)
  {
    return this.substring(0, this.length-(n || 1));
  },
  
  
  pluralize: function()
  {
    return this + "s";
  },
  
  
  unpluralize: function()
  {
    return (this.tail() == "s") ? this.drop() : $A(this).join("");
  },
  
  
  trunc: function(limit, options)
  {
    var tail = (options && options.tail === false) ? '' : ((options && options.tail) || '...');
    return this.substring(0, limit) + tail;
  }
  
});

function $iterate(n, fn) {
  var result = [];
  (n).times(function() {
    result.push(fn());
  });
  return result;
};

function $repeat(n, v) {
  return $iterate(n, $lambda(v));
};

function $normalize(v) {
  if($type(v) == "array")
  {
    v = v.normalize()
  }
  else if(['object', 'hash'].contains($type(v)))
  {
    v = $H(v).normalize();
  }
  return v;
}

function $hash(v) {
  return JSON.encode($normalize(v));
};

var Set = new Class({
  initialize: function(ary)
  {
    this.isset = true;
    this.rep = {};
    if(ary && !ary.isset)
    {
      ary.each(function(v) {
        this.rep[$hash(v)] = v;
      }, this);
    }
    else if(ary)
    {
      this.rep = ary.rep;
    }
  },
  
  
  put: function(v)
  {
    this.rep[$hash(v)] = v;
  },
  
  
  __put__: function(k, v)
  {
    this.rep[k] = v;
  },
  
  
  get: function(v)
  {
    return this.rep[$hash(v)];
  },
  
  
  remove: function(v)
  {
    delete this.rep[$hash(v)];
  },
  
  
  intersection: function(set)
  {
    var result = new Set();
    set = new Set(set);
    $H(this.rep).getValues().each(function(value) {
      var hashed = $hash(value);
      if(set.rep[hashed]) result.rep[hashed] = value;
    }, this);
    return result;
  },
  
  
  union: function(set)
  {
    var result = new Set();
    $H(this.rep).each(function(v, k) {
      result.rep[k] = v;
    }, this);
    set.each(function(v) {
      result.rep[$hash(v)] = v;
    });
    return result;
  },
  
  
  getValues: function()
  {
    return $H(this.rep).getKeys();
  },
  
  
  toArray: function()
  {
    return $H(this.rep).getValues();
  }
});

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
  
  isEqual: function(other) {
    return JSON.encode(this) == JSON.encode(other);
  },
  
  select: function(test) {
    for(var i = 0; i < this.length; i++)
    {
      if(test(this[i])) return this[i];
    }
    return;
  },
  
  zipmap: function(vs) {
    if($type(vs) != 'array')
    {
      
    }
    else
    {
      var result = {};
      this.each(function(v, i) {
        result[this[i]] = vs[i];
      }, this);
      return result;
    }
  },
  
  
  encode: function() {
    return JSON.encode(this);
  },
  
  
  normalize: function() {
    var result = [];
    this.each(function(v) {
      v = $normalize(v);
      result.push(v);
    });
    return result;
  }
});

Hash.implement({
  normalize: function()
  {
    var result = [];
    var sortArray = [];
    this.each(function(v, k) {
      sortArray.push(k);
    });
    sortArray.sort();
    sortArray.each(function(k) {
      var v = $normalize(this[k]);
      result.push([k, v]);
    }, this);
    return result;
  },
  
  isEqual: function(other)
  {
    return JSON.encode(this.normalize()) == JSON.encode($H(other).normalize());
  },
  
  changeKeys: function(keyFn)
  {
    var result = $H();
    if($type(keyFn) == 'object' || $type(keyFn) == 'hash')
    {
      keyFn = $H(keyFn).asFn();
    }
    this.each(function(v, k) {
      if(keyFn(k))
      {
        result[keyFn(k)] = v;
      }
      else
      {
        result[k] = v;
      }
    });
    return result;
  },
  
  asFn: function()
  {
    var self = this;
    return function(k) {
      return self[k];
    };
  },
  
  encode: function()
  {
    return JSON.encode(this);
  }
});

var Delegate = new Class({
  __delegate: null,
  setDelegate: function(delegate) { this.__delegate = delegate; },
  delegate: function() { return this.__delegate; }
});

Function.implement({
  decorate: function()
  {
    var decorators = $A(arguments);
    var resultFn = this;
    var decorator = decorators.pop();
    
    while(decorator)
    {
      var temp = resultFn;
      resultFn = decorator(resultFn);
      temp._decorator = resultFn;
      decorator = decorators.pop();
    }
    
    return resultFn;
  },
  
  comp: function()
  {
    var fns = $A(arguments)
    var self = this;
    return function() {
      var args = $A(arguments);
      var result = self.apply(this, args);
      var fn;
      while(fn = fns.shift())
      {
        result = fn.apply(null, [result]);
      }
      return result;
    }
  },
  
  rewind: function(bind, args)
  {
    return (this._wrapper) ? this._wrapper.bind(bind, args) : this.bind(bind, args);
  }
});


function $element(tag, options)
{
  return new Element(tag, options);
}


Class.extend({
  wrap: function(self, key, method)
  {
    if (method._origin) method = method._origin;

    var wrapper = function(){
      if (method._protected && this._current == null) throw new Error('The method "' + key + '" cannot be called.');
      var caller = this.caller, current = this._current;
      this.caller = current; this._current = arguments.callee;
      var result = method.apply(this, arguments);
      this._current = current; this.caller = caller;
      return result;
    }.extend({_owner: self, _origin: method, _name: key});

    method._wrapper = wrapper;
    return wrapper;
  }
});

// patch for MooTools 1.2.1 - David
Class.extend({
  inherit: function(object, properties){
    var caller = arguments.callee.caller;
    for (var key in properties){
      var override = properties[key];
      var previous = object[key];
      var type = $type(override);
      if (previous && type == 'function'){
        if (override != previous){
          if (caller){
            override.__parent = previous;
            object[key] = override;
          } else {
            Class.override(object, key, override);
          }
        }
      } else if(type == 'object'){
        object[key] = $merge(previous, override);
      } else {
        object[key] = override;
      }
    }

    if (caller) object.parent = function(){
      var caller = arguments.callee.caller;
      var parent = (caller._decorator) ? caller._decorator.__parent : caller.__parent;
      return parent.apply(this, arguments);
    };

    return object;
  },

  override: function(object, name, method){
    var parent = Class.prototyping;
    if (parent && object[name] != parent[name]) parent = null;
    var override = function(){
      var previous = this.parent;
      this.parent = parent ? parent[name] : object[name];
      var value = method.apply(this, arguments);
      this.parent = previous;
      return value;
    };
    method._wrapper = override;
    object[name] = override;
  }  
});


function $msg(methodName) 
{
  var rest = $A(arguments).drop(1);
  return function(obj) {
    return obj[methodName].apply(obj, rest);
  };
}


function $implements(obj, method)
{
  return obj && obj[method] && $type(obj[method]) == 'function';
}


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


function $acc() {
  var args = $A(arguments);
  return function(obj) {
    return $get.apply(null, [obj].combine(args));
  };
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

Date.implement({
  toDay: function() 
  {
    return this.set('hours', 0).set('minutes', 0).set('seconds', 0).set('milliseconds', 0);
  }
});


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