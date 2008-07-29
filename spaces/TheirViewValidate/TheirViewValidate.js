/* TheirView validation block */

var TheirViewValidateSpace = ShiftSpace.Space.extend({
    attributes: {
        name: 'TheirViewValidate',
        icon: 'TheirViewValidate.png',
		title: 'TheirViewValidate',
		css: 'TheirViewValidate.css'
	}
});

var TheirViewValidateShift = ShiftSpace.Shift.extend({
	// common code for TheirView within ShiftSpace
	webservice: 'http://www.theirview.org/webservice.php',
	
	initialize: function(json) {
		this.parent(json);
		this.build(json.position.x,json.position.y);
	},
	
	build: function(x,y) {
		$$('.theirview').each(function(item){item.remove()});
		var e = this.buildHoldingDiv();
		e.setStyles({ 'left': this.rhswidth(x,e.getStyle('width').toInt(),40), 'top': y });
		e.makeDraggable();
		e.inject(document.body);
		this.fetchData();
	},

	cancel: function(div) {
		var d = $(div);
		var fx = d.effects({ 'duration': 500, 'transition': Fx.Transitions.linear });
		fx.start({'opacity': 0}).chain(function(){ if(d) d.remove(); });
	},
	
	rhswidth: function(pWidth,width,margin) {
		var wWidth = window.getWidth();
		if(pWidth + width > (wWidth - margin)) pWidth = wWidth - width - margin;
		if(pWidth < margin) pWidth = margin;
		return pWidth;
	},
	
	cl: function() { return window.location.href; },
	
	wrapCall: function(name,hash,func) {
		$$('.req-' + name ).each(function(item){ new Element('p',{'class':'tmp-' + name}).appendText('requesting...').inject(item); });
		
		var tData = new Array();
		hash.each(function(value,key){ tData[tData.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value); });
		var data = tData.join("&");
		
		var options = {
			  'data'   : data
			, 'url'    : this.webservice
			, 'method' : 'POST'
			, 'headers': {'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'}
			, 'onload' : function(responseDetails){
				var response = responseDetails.responseText;
				$$('.tmp-' + name).each(function(item) { item.remove() });
				var json = eval("(" + response + ")");
				if(typeof(func) == "function") func(json);
				if(typeof(func) == "object") func.each(function(item){ item(json); });
			}
		};
		this.xmlhttpRequest(options);
	},
	
	// begin specific code: Validation
	buildHoldingDiv: function() {
		var d = new Element('div',{id:'theirviewvalidate','class':'theirview'});
		d.setStyles({'width':'500px'});
		
		// close button
		var tCloseButton = new Element('div',{'class':'SSTheirViewShiftCloseButton'});
		tCloseButton.addEvent('click', function(){ this.cancel('theirviewvalidate'); }.bind(this));
		tCloseButton.inject(d);
		
		// easier using setHTML than doing multiple adds and injects
		new Element('div',{'id':'tv-w3'}  ).setHTML('<h1>W3</h1><div id="tw3-data" class="req-w3"></div><div id="w3-attribution" class="attribution">Sourced using W3 validator</div>').inject(d);
		new Element('div',{'id':'tv-tidy'}).setHTML('<h1>Tidy</h1><div id="ttidy-data" class="req-tidy"></div><div id="tidy-attribution" class="attribution">Sourced using Tidy</div>').inject(d);
		
		return d;
	},
	
	fetchData: function() {
		this.tidy();
		this.w3();
	},
	
	tidy: function() { this.wrapCall('tidy', new Hash({action:'validate.tidy',url:this.cl()}), this.renderTidy.bind(this) );},
	w3: function()   { this.wrapCall('w3',   new Hash({action:'validate.w3',  url:this.cl()}), this.renderW3.bind(this)   );},
	
	renderTidy: function(json) { return this.renderValidate('tidy',json); },
	renderW3:   function(json) { return this.renderValidate('w3',  json); },
	
	renderValidate: function(type,json) {
		var table = new Element('table');
		
		if(json.items.length == 0) {
			var tr = new Element('tr');
			new Element('td').appendText("no errors found").inject(tr);
			tr.inject(table);
		}
		else {
			var tr = new Element('tr');
			new Element('th').appendText("line"   ).inject(tr);
			new Element('th').appendText("column" ).inject(tr);
			new Element('th').appendText("message").inject(tr);
			tr.inject(table);
			
			json.items.each(function(item){
				var trow = new Element('tr');
				new Element('td').appendText(item.line   ).inject(trow);
				new Element('td').appendText(item.column ).inject(trow);
				new Element('td').appendText(item.message).inject(trow);
				trow.inject(table);
			});
		}
		table.inject($('t' + type + '-data'));
	}
});

var TheirViewValidate = new TheirViewValidateSpace(TheirViewValidateShift);
