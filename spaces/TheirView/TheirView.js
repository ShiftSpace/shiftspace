String.extend({
  trimLength: function( maxLength, appendValue ) {
    if ( this.length <= maxLength ) return this;
    return this.substr( 0, maxLength ) + appendValue;
  }
});

var TheirViewSpace = ShiftSpace.Space.extend({
    attributes: {
        name: 'TheirView',
        icon: 'TheirView.png',
		title: 'TheirView'
    }
});

var TheirViewShift = ShiftSpace.Shift.extend({
	initialize: function(json) {
		this.parent(json);
		this.build(json);
	},
	build: function(json) {
		this.element = this.buildHoldingDiv();
		this.element.setStyles({
			  left:  this.rhswidth(json.position.x,800,20)
			, top:   json.position.y
			, width: 800
		});
		this.element.makeDraggable();
		this.element.injectInside(document.body);
		this.fetchData();
	},
	
	// TODO - have rhswidth as a general layout function
	rhswidth: function(pWidth,width,margin) {
		var wWidth = window.getWidth();
		if(pWidth + width > (wWidth - margin)) pWidth = wWidth - width - margin;
		if(pWidth < margin) pWidth = margin;
		return pWidth;
	},
	
	buildHoldingDiv: function() {
		var d = new ShiftSpace.Element('div',{id:'theirview', class:'SS_TheirView'});

		var tCloseButton = new ShiftSpace.Element('div',{ class: 'SSTheirViewShiftCloseButton'});
		tCloseButton.addEvent('click', this.cancel.bind(this));
		tCloseButton.inject(d);
		
		// easier using setHTML than doing multiple adds and injects
		new Element('div',{id:'tv-google'}).setHTML('<h1>Google</h1><div id="tgoogle-data" class="req-google"></div><div id="tgoogle-page" class="req-google"></div><div id="google-attribution">enhanced by <a href="http://www.google.com/"><img src="http://www.google.com/uds/css/small-logo.png" /></a></div>').inject(d);
		new Element('div',{id:'tv-yahoo'}).setHTML('<h1>Yahoo</h1><div id="tyahoo-data" class="req-yahoo"></div><div id="tyahoo-page" class="req-yahoo"></div><div id="yahoo-attribution"><a href="http://developer.yahoo.com/"><img src="http://l.yimg.com/us.yimg.com/i/us/nt/bdg/websrv_120_1.gif"></a></div>').inject(d);
		new Element('div',{id:'tv-digg'}).setHTML('<h1>Digg</h1><div id="tdigg-data" class="req-digg"></div><div id="digg-attribution">enhanced by <a href="http://digg.com/"><img src="http://digg.com/img/badges/16x16-digg-guy.gif"></a> Digg!</div>').inject(d);
		new Element('div',{id:'tv-wikipedia'}).setHTML('<h1>Wikipedia</h1><div id="twikipedia-data" class="req-wikipedia"></div><div id="wikipedia-attribution">Sourced from <a href="http://www.theirview.org/download#wikipedia">snapshot</a> of <a href="http://www.wikipedia.org/">WikiPedia</a>. Licensed under GFDL.</div>').inject(d);
		return d;
	},
	
	// TODO - correct usage of "hide" method to remove our div/container
	cancel: function() { $('theirview').remove(); },
	
	fetchData: function() {
		this.google(0);
		this.yahoo(0);
		this.digg();
		this.wikipedia();
	},
	
	google:    function(offset) { this.wrapCall('inlink.google', offset, [this.renderGoogle.bind(this),this.pageGoogle.bind(this)]); },
	yahoo:     function(offset) { this.wrapCall('inlink.yahoo',  offset, [this.renderYahoo.bind(this),this.pageYahoo.bind(this)]);   },
	digg:      function()       { this.wrapCall('inlink.digg',        0, [this.renderDigg.bind(this)]); },
	wikipedia: function()       { this.wrapCall('inlink.wikipedia',   0, [this.renderWikipedia.bind(this)]); },

	wrapCall: function(name,offset,funcArray) {
		var url = 'http://www.theirview.org/webservice.php';
		$$('.req-' + name ).each(function(item,index){ new Element('p',{class:'tmp-' + name}).appendText('requesting...').inject(item);});
		var data = 'action=' + name + '&offset=' + offset + '&url=' + this.currentLocation();
		var req = {
			method: 'POST',
			url: url,
			data: data,
			async: true,
			onload: function(response) {
				$$('.tmp-' + name).each(function(item,index) { item.remove() });
			  	eval("var json = " + response.responseText + ";");
			  	funcArray.each(function(func,index){ func(json); });
			}
		};

      if(!window.webkit) req.headers = { 'Content-type': 'application/x-www-form-urlencoded' };
      GM_xmlhttpRequest(req);
	},
	
	renderGoogle: function(json) {
	  	var ul = new Element('ul',{ class: 'tmp-google' });
		
		// error conditions
		// TODO - when results = 0 ned to append some sort of text
		if(json.responseStatus != 200) new Element('li').appendText(json.responseDetails).inject(ul);
		
	  	if(json.responseStatus == 200) {
	  		json.responseData.results.each(function(item,index){
	  			var li = new Element('li');
	  			new Element('a',{href: item.url, title: item.title}).appendText(item.title.trimLength(50,'...')).inject(li);
				new Element('p').setHTML(item.content).inject(li);
	  			li.inject(ul);
	  		});
	  	}
		ul.inject($('tgoogle-data'));
	},
	renderYahoo: function(json) {
	  	var ul = new Element('ul', { class: 'tmp-yahoo'});
	  	if(json.Error) {
	  		new Element('li').appendText(json.Error.Message).inject(ul);
	  	}
	  	else {
			if(json.ResultSet.totalResultsAvailable == 0) {
				new Element('li').appendText("No results available").inject(ul);
			}
			else {
	  			json.ResultSet.Result.each(function(item,index){
	  				var li = new Element('li');
	  				new Element('a',{href: item.ClickUrl, title: item.Title }).appendText(item.Title.trimLength(50,'...')).inject(li);
	  				li.inject(ul);
	  			});
			}
	  	}
	  	ul.inject($('tyahoo-data'));
	},
	renderDigg: function(json) {
		if(json.count == 0) {
			// TODO - better wording about prompting user to submit to digg
			new Element('p',{class: 'tmp-digg'}).appendText("no stories found.").inject($('tdigg-data'));
			
			// modified version of http://digg.com/tools/diggthis.js, using 'compact' skin
			var url = "http://digg.com/tools/diggthis.php?u=" + this.currentLocation() + '&s=compact';
			var i = new Element('iframe',{class: 'tmp-digg', src: url, width: 120, height: 18, frameborder: 0, scrolling: 'no'});
			i.inject($('tdigg-data'));
		}
		else {
			json.stories.each(function(item,index){
				new Element('div',{class:'tmp-digg'}).setHTML(
					  '<span class="digg-count"><strong>' + item.diggs + '</strong>diggs</span>'
					+ '<a class="digg-title" href="' + item.href + '">' + item.title + '</a><br />'
					+ '<p class="digg-content">' + item.description
					+ '<a class="digg-more" href="' + item.href + '">more...</a>'
					+ '<span class="digg-topic">(' + item.topic.name + ')</span>'
					+ '</p>'
					+ '<br clear="both" />'
				).inject($('tdigg-data'));
			});
		}
	},
	renderWikipedia: function(json) {
		if(json.count == 0) {
			// TODO - better wording about prompting user to submit to digg
			new Element('p',{class: 'tmp-wikipedia'}).appendText("no links found.").inject($('twikipedia-data'));
		}
		else {
			var ul = new Element('ul',{class:'tmp-wikipedia'});
			json.rows.each(function(item,index){
				new Element('li').setHTML('<a href="http://en.wikipedia.org/wiki/' + item.title + '">' + item.title + '</a>').inject(ul);
			});
			ul.inject($('twikipedia-data'));
		}
	},
	
	pageGoogle: function(json) {
		// google doesn't go beyond four pages
		if(json.responseData.cursor.currentPageIndex == 3) {
			ref = this.getReference();
			p = new Element('p',{class: 'tmp-' + name + ' paginate'});
			new Element('a',{class: 'p-href', href: 'javascript:' + ref + '.google(16)'}).setHTML("&laquo; prev").inject(p);
			new Element('span',{class: 'p-divider'}).appendText("|").inject(p);
			new Element('a',{class: 'p-href', href: json.responseData.cursor.moreResultsUrl}).setHTML("more results at Google").inject(p);
			p.inject($(div));
			
		}
		this.paginate('google','tgoogle-page',8,json.responseData.cursor.currentPageIndex * 8, json.responseData.cursor.estimatedResultCount);
	},
	pageYahoo:  function(json) { this.paginate('yahoo', 'tyahoo-page',10, json.ResultSet.firstResultPosition - 1, json.ResultSet.totalResultsAvailable); },
	
	paginate: function(name,div,num,offset,max) {
		// note: fireevent/callbacks don't seem to keep rest of object for rendering
		ref = this.getReference();
		p = new Element('p',{class: 'tmp-' + name + ' paginate'});

		if(offset > 0) { new Element('a',{class: 'p-href', href: 'javascript:' + ref + '.' + name + '(' + (offset - num) + ')'}).setHTML("&laquo; prev").inject(p); }
		else { new Element('span',{class: 'p-disabled'}).setHTML("&laquo; prev").inject(p); }

		new Element('span',{class: 'p-divider'}).appendText("|").inject(p);

		if(offset + num < max - 1) { new Element('a',{class: 'p-href', href: 'javascript:' + ref + '.' + name + '(' + (offset + num) + ');'}).setHTML("next &raquo;").inject(p); }
		else { new Element('span',{class: 'p-disabled'}).setHTML("next &raquo;").inject(p); }

		p.inject($(div));
	},
	
	getReference: function() {
		return 'ShiftSpace.spaces.TheirView.currentShift';
	},
	
	currentLocation: function() {
		u = window.location.href;
		if(window.transformingproxy) u = transformingproxy.currentLocation();
		u = encodeURIComponent(u); //.replace(/\+/g,'%2b');
		return u;
	}
});

var TheirView = new TheirViewSpace(TheirViewShift);
loadStyle('spaces/TheirView/TheirView.css');
