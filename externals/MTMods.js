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