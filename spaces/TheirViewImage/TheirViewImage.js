/* TheirView image transformation block */

var TheirViewImageSpace = ShiftSpace.Space.extend({
    attributes: {
        name: 'TheirViewImage',
        icon: 'TheirViewImage.png',
		title: 'TheirViewImage',
		css: 'TheirViewImage.css'
	}
});

var TheirViewImageShift = ShiftSpace.Shift.extend({
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
	
	// begin specific code: Image manipulation
	inwebservice: function(u) {
		if(u.substring(0, this.webservice.length) == this.webservice) return true;
		return false;
	},

	// assumption: url=.... is the last item in wrapCall / webservices
	inwebserviceurl: function(u) {
		var l = u.indexOf("url=");
		u = u.substring(l + 4);
		u = decodeURIComponent(u);
		return u;
	},
	
	buildHoldingDiv: function() {
		var d = new Element('div',{id:'theirviewimage', 'class':'theirview'});
		d.setStyles({'width':'400px'});
		
		// close button
		var tCloseButton = new Element('div',{ 'class': 'SSTheirViewShiftCloseButton'});
		tCloseButton.addEvent('click', function(){ this.cancel('theirviewimage'); }.bind(this));
		tCloseButton.inject(d);
		
		var ul = new Element('ul');
		this.switchviewitem('blur'     ).inject(ul);
		this.switchviewitem('charcoal' ).inject(ul);
		this.switchviewitem('cycle'    ).inject(ul);
		this.switchviewitem('flip'     ).inject(ul);
		this.switchviewitem('grayscale').inject(ul);
		this.switchviewitem('solarize' ).inject(ul);
		this.switchviewitem('spread'   ).inject(ul);
		
		var el = new Element('div',{id:'tv-image'});
		new Element('h1').appendText("Images").inject(el);
		
		ul.inject(el);
		el.inject(d);
		
		return d;
	},
		
	switchviewitem: function(type) {
		var tElement = new Element('li');
		new Element('a',{'href':'#'}).appendText("switch to " + type).inject(tElement);
		tElement.addEvent('click',function(evt){ new Event(evt).stop(); this.switchview(type); }.bind(this));
		return tElement;
	},
	
	// TODO - distinguish between 'revertable' views dependant on JS support/other libraries loaded
	switchview: function(type) {
		var d = $('theirviewimage');
		var tHeight = d.getStyle('height').toInt();
		
		d.setStyles({'text-align':'center','padding-top':15,'padding-bottom':15,'background-color':'#ffc'});
		d.setHTML('switching view');
		var fx = d.effects({ duration: 700, transition: Fx.Transitions.linear });
		fx.start({}).chain(function(){ this.start.delay(10,this,{'opacity': 0 })}).chain(function(){ if(d) d.remove(); });
		
		// this can take a little while so put message up first
		this.images(type);
	},
	
	// callable wraps
	blur:      function() { this.images('blur'     ); },
	charcoal:  function() { this.images('charcoal' ); },
	cycle:     function() { this.images('cycle'    ); },
	flip:      function() { this.images('flip'     ); },
	grayscale: function() { this.images('grayscale'); },
	solarize:  function() { this.images('solarize' ); },
	spread:    function() { this.images('spread'   ); },
	
	// TODO - background image with relative links not evaluating in GreaseMonkey
	images: function(type) {

		// CSS elements first, as this will run fastest (no network operations)
		if(type == "grayscale") {
			$$('').each(function(item){ this.css_colour_transform(item, this.grayscale_calc); }.bind(this));
		}

		// all normal images
		$$('img').each(function(item){
			var t = item.src;
			if(this.inwebservice(t)) t = this.inwebserviceurl(t);
			t = this.webservice + '?action=image.' + type + '&url=' + encodeURIComponent(t);
			item.src = t;
		}.bind(this));
		
		// background and list images
		$$('').each(function(item){
			['background-image','list-style-image'].each(function(sname){
				var t = item.getStyle(sname);
				if(t != "none") {
					t = t.substring(4);
					t = t.substring(0, t.length - 1);
					if(this.inwebservice(t)) t = this.inwebserviceurl(t);
					t = this.webservice + '?action=image.' + type + '&url=' + encodeURIComponent(t);
					eval("item.setStyles({'" + sname + "':'" + t + "'})");
				}
			}.bind(this));
		}.bind(this));
	},
	
	// TODO - delve into individually applied styles. eg an element with style="color: rgb(1,2,3)"
	css_colour_transform: function(item,func) {
		['color','background-color'].each(function(sname){
			var t = item.getStyle(sname);
			if(t != 'transparent') {
				t = func(t);
				eval("item.setStyles({'" + sname + "': '" + t + "'})");
			}
		});
		
		['border-top-color','border-right-color','border-bottom-color','border-left-color'].each(function(sname){
			var t = item.getStyle(sname);
			if(t != '#000000') {
				t = func(t);
				eval("item.setStyles({'" + sname + "': '" + t + "'})");
			}
		});
	},
	
	// switching RGB to grayscale: I = 0.299r + 0.587g + 0.114b
	grayscale_calc: function(col) {
		var rgb = col.hexToRgb(true);
		var i = Math.round((0.299 * rgb[0] ) + (0.587 * rgb[1]) + (0.114 * rgb[2]));
		var r = "rgb(" + i + "," + i + "," + i + ")";
		return r.rgbToHex();
	}
});

var TheirViewImage = new TheirViewImageSpace(TheirViewImageShift);
