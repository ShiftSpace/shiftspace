// ==Builder==
// @required
// ==/Builder==

Event.Keys.shift = 16;

(function() {

var _urlJoin = Function.dispatch(
  function(a) { return a; },
  function(a, b) {
    if(b.length > 0) {
      a = (a.tail(1) == "/") ? a : a + "/";
      return a + b.first()
    } else {
      return a;
    }
  }
);


String.implement({

  pop: function() { return this.substring(1, this.length); },

  tail: function(n) { return this.substring(this.length-(n || 1)); },

  drop: function(n) { return this.substring(0, this.length-(n || 1)); },

  pluralize: function() { return this + "s"; },

  unpluralize: function() { return (this.tail() == "s") ? this.drop() : $A(this).join(""); },

  trunc: function(limit, options) {
    var tail = (options && options.tail === false) ? '' : ((options && options.tail) || '...');
    return this.substring(0, limit) + tail;
  },

  repeat: function(times) {
    var result = "";
    for(var i = 0; i < times; i++) {
      result += this;
    }
    return result;
  },

  urlJoin: function() {
    var args = $A(arguments);
    args = ($type(this) == 'string') ? [this].extend(args) : args;
    return _urlJoin.reduce(args);
  },

  domain: function() {
    var trimmed = this.trim(), idx = trimmed.search("http://");
    idx = (idx == -1) ? 0 : 7;
    var first = trimmed.substr(idx, trimmed.length).split("/").first();
    return "http://"+first;
  }
});

})();


Array.implement({
  str: function() { return this.join(""); },

  isEqual: function(other) { return $hash(this) == $hash(other); }
});


Hash.implement({
  changeKeys: function(keyFn) {
    var result = $H();
    if($type(keyFn) == 'object' || $type(keyFn) == 'hash') keyFn = $H(keyFn).asFn();
    this.each(function(v, k) {
      if(keyFn(k)) {
        result[keyFn(k)] = v;
      } else {
        result[k] = v;
      }
    });
    return result;
  }
});


var Delegate = new Class({
  __delegate: null,
  setDelegate: function(delegate) {
    if($type(delegate) == "string") {
      this.__delegate = ShiftSpaceNameTable[delegate];
    } else {
      this.__delegate = delegate;
    }
  },
  delegate: function() { return this.__delegate; }
});


function $element(tag, options) { return new Element(tag, options); }


function $implements(obj, protocol)
{
  for(var p in protocol) {
    if(!obj[p] || $type(obj[p]) != protocol[p]) return false;
  }
  return true;
}

// allows for queries on namespaced attributes
Selectors.RegExps = {
  id: (/#([\w-]+)/),
  tag: (/^(\w+|\*)/),
  quick: (/^(\w+|\*)$/),
  splitter: (/\s*([+>~\s])\s*([a-zA-Z#.*:\[])/g),
  combined: (/\.([\w-]+)|\[([\w:]+)(?:([!*^$~|]?=)(["']?)([^\4]*?)\4)?\]|:([\w-]+)(?:\(["']?(.*?)?["']?\)|$)/g)
};


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
  _ssgenId: function() {
    var id = this.getProperty('id');
    if(!id) {
      id = Math.round(Math.random()*1000000+(new Date()).getMilliseconds());
      this.setProperty('id', 'generatedId_'+id);
    }
    return id;
  },

  _getElement: function(sel) {
    this._ssgenId();
    return (new Document(this.ownerDocument)).getWindow().$$('#' + this.getProperty('id') + ' ' + sel)[0];
  },

  _getElements: function(sel) {
    this._ssgenId();
    return (new Document(this.ownerDocument)).getWindow().$$('#' + this.getProperty('id') + ' ' + sel);
  },
  
  isEqual: function(node) {
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
  if(!id) {
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
  toDay: function() {
    return this.set('hours', 0).set('minutes', 0).set('seconds', 0).set('milliseconds', 0);
  }
});


Fx.CSS.implement({
  search: function(selector, doc){
    if (Fx.CSS.Cache[selector]) return Fx.CSS.Cache[selector];
    var to = {};
    
    function extract(sheet, j){
      var href = sheet.href;
      if (href && href.contains('://') && !href.contains((doc || document).domain)) return;
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
    Array.each((doc || document).styleSheets, extract);
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


Drag.Move.implement({
  checkAgainst: function(el, i){
    el = (this.positions) ? this.positions[i] : el.getCoordinates();
    var now = this.mouse.now;
    var inside = (now.x > el.left && now.x < el.right && now.y < el.bottom && now.y > el.top);
    return inside;
  },
  
  checkDroppables: function(){
    var overed = this.droppables.filter(this.checkAgainst, this).getLast();
    if (this.overed != overed) {
      if (this.overed && overed && this.overed.isEqual(overed)) return;
      if (this.overed)
      {
        this.fireEvent('leave', [this.element, this.overed]);
      }
      if (overed)
      {
        this.fireEvent('enter', [this.element, overed]);
      }
      this.overed = overed;
    }
  }
});


Sortables.implement({
  getDroppables: function(){
    function erase(ary, element) {
      for (var i = ary.length; i--; i){
        if (ary[i].isEqual(element)) ary.splice(i, 1);
      }
      return ary;
    }
    var droppables = this.list.getChildren();
    if (!this.options.constrain) droppables = erase(this.lists.concat(droppables), this.list);
    return erase(erase(droppables, this.clone), this.element);
  },

  insert: function(dragging, element){
    SSLog('insert', SSLogForce);
    var where = 'inside';
    // use our special contains check
    function contains(nodes, node) {
      SSLog(nodes, node, SSLogForce);
      if(!nodes) return false;
      nodes.each(Function.msg("_ssgenId"));
      return nodes.some(node.isEqual.bind(node));
    }
    if (contains(this.lists, element)){
      this.list = element;
      this.drag.droppables = this.getDroppables();
    } else {
      where = contains(this.element.getAllPrevious(), element) ? 'before' : 'after';
    }
    SSLog("injecting ", element, " ", where, SSLogForce);
    this.element.inject(element, where);
    SSLog("SORT", SSLogForce);
    this.fireEvent('sort', [this.element, this.clone]);
  }
});


function SSFormToHash(formEl)
{
  var inputs = formEl.getElements("input[name]"), result = $H();
  inputs.each(function(input) {
    result[input.getProperty("name")] = input.getProperty("value");
  });
  return result;
}

function SSTemplate(el, props)
{
  $H(props).each(function(value, key) {
    var attr = "text",
        target = el.getElement("."+key);
    if(!target) return;
    if(target.get('tag') == "input")
    {
      switch(el.getProperty("type"))
      {
        case "text":
           attr = "value";
           break;
        case "checkbox":
           attr = "checked";
           break;
        default:
           attr = "value";
      }
    }
    if(target.get('tag') == "img")
    {
      attr = "src";
    }
    if(target) target.set(attr, value);
  }, this);
}


var DelayedAsset = new Class({
  Implements: Events,
  name: "DelayedAsset",
  
  initialize: function(type, source, properties) {
    this.type = type;
    this.source = source;
    this.properties = properties;
  },

  load: function() {
    switch(this.type) {
      case 'javascript':
        this.asset = new Asset.javascript(this.source, $merge(this.properties, {
          onload: function() {
            if($callable(this.properties.onload)) this.properties.onload(this.asset);
            this.fireEvent('onload', this.asset);
          }.bind(this)
        }));
        break;
      case 'css':
        this.asset = new Asset.css(this.source, $merge(this.properties));
        break;
      case 'image':
        this.asset = new Asset.image(this.source, $merge(this.properties, {
          onload: function() {
            if($callable(this.properties.onload)) this.properties.onload(this.asset);
            this.fireEvent('onload', this.asset);
          }.bind(this),
          onabort: function() {
            if($callable(this.properties.onabort)) this.properties.onabort(this.asset);
            this.fireEvent('onabort', this.asset);
          }.bind(this),
          onerror: function() {
            if($callable(this.properties.onerror)) this.properties.onerror(this.asset);
            this.fireEvent('onerror', this.asset);
          }.bind(this)
        }));
        break;
    }
  }
});