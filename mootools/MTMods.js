// ==Builder==
// @required
// ==/Builder==

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

Array.implement({
  copy: function(){
    var results = [];
    for(var i = 0, l = this.length; i < l; i++) results[i] = this[i];
    return results;
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

MooTools.More = {
	'version': 'rc01'
};

/*
Script: Request.JSONP.js
	Defines Request.JSONP, a class for cross domain javascript via script injection.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
*/

Request.JSONP = new Class({

	Implements: [Chain, Events, Options],

	options: {/*
		onRetry: $empty(intRetries),
		onRequest: $empty(scriptElement),
		onComplete: $empty(data),
		onSuccess: $empty(data),
		onCancel: $empty(),*/
		url: '',
		data: {},
		retries: 0,
		timeout: 0,
		link: 'ignore',
		callBackKey: 'callback',
		injectScript: document.head
	},

	initialize: function(options){
		this.setOptions(options);
		this.running = false;
		this.requests = 0;
		this.triesRemaining = [];
	},
	
	check: function(caller){
		if (!this.running) return true;
		switch (this.options.link){
			case 'cancel': this.cancel(); return true;
			case 'chain': this.chain(caller.bind(this, Array.slice(arguments, 1))); return false;
		}
		return false;
	},

	send: function(options){
		if (!$chk(arguments[1]) && !this.check(arguments.callee, options)) return this;
		
		var type = $type(options), old = this.options, index = $chk(arguments[1]) ? arguments[1] : this.requests++;
		if (type == 'string' || type == 'element') options = {data: options};
		
		options = $extend({data: old.data, url: old.url}, options);
		
		if (!$chk(this.triesRemaining[index])) this.triesRemaining[index] = this.options.retries;
		var remaining = this.triesRemaining[index];
				
		(function(){
			var script = this.getScript(options);
			MooTools.log('JSONP retrieving script with url: ' + script.src);
			this.fireEvent('request', script);
			this.running = true;
			
			(function(){
				if (remaining){
					this.triesRemaining[index] = remaining - 1;
					if (script){
						script.destroy();
						this.request(options, index);
						this.fireEvent('retry', this.triesRemaining[index]);
					}
				} else if(script && this.options.timeout){
					script.destroy();
					this.cancel();
				}					
			}).delay(this.options.timeout, this);
		}).delay(Browser.Engine.trident ? 50 : 0, this);
		return this;
	},
	
	cancel: function(){
		if (!this.running) return this;
		this.running = false;
		this.fireEvent('cancel');
		return this;
	},
 	
	getScript: function(options){
		var options = this.options, index = Request.JSONP.counter, data;
		Request.JSONP.counter++;
		
		switch ($type(options.data)){
			case 'element': data = $(options.data).toQueryString(); break;
			case 'object': case 'hash': data = Hash.toQueryString(options.data);
		}
		
		var script = new Element('script', {
			type: 'text/javascript',
			src: options.url + 
				 (options.url.test('\\?') ? '&' :'?') + 
				 (options.callBackKey || this.options.callBackKey) + 
				 "=Request.JSONP.request_map.req_"+ index + 
				 (data ? '&' + data : '')
		}).inject(this.options.injectScript);
		
		var callback = function(data){ this.success(data, script); }.bind(this);
		Request.JSONP.request_map['req_' + index] = callback;
				
		return script;
	},
	
	success: function(data, script){
		if (script) script.destroy();
		this.running = false;
		MooTools.log('JSONP successfully retrieved: ',  data);
		this.fireEvent('complete', data).fireEvent('success', data).callChain();
	}

});

Request.JSONP.counter = 0;
Request.JSONP.request_map = {};

$extend(MooTools, {
	logged: [],
	log: function(){
		MooTools.logged.push(arguments);
	}
});