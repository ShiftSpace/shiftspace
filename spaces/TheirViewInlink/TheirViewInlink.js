// long data trimming
String.extend({
  trimLength: function( maxLength, appendValue ) {
    if ( this.length <= maxLength ) return this;
    return this.substr( 0, maxLength ) + appendValue;
  }
});

/* TheirView inlink block */
var TheirViewInlinkSpace = ShiftSpace.Space.extend({
    attributes: {
        name: 'TheirViewInlink',
        icon: 'TheirViewInlink.png',
		title: 'TheirViewInlink',
		css: 'TheirViewInlink.css'
	}
});

var TheirViewInlinkShift = ShiftSpace.Shift.extend({
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
	
	// begin specific code: Inlink
	buildHoldingDiv: function() {
		var d = new Element('div',{id:'theirviewinlink', 'class':'theirview'});
		d.setStyles({'width':'800px'});
		
		// close button
		var tCloseButton = new Element('div',{'class':'SSTheirViewShiftCloseButton'});
		tCloseButton.addEvent('click', function(){ this.cancel('theirviewinlink'); }.bind(this));
		tCloseButton.inject(d);
		
		// easier using setHTML than doing multiple adds and injects
		new Element('div',{'id':'tv-google'   }).setHTML('<h1>Google</h1><div id="tgoogle-data" class="req-google"></div><div id="tgoogle-page" class="req-google"></div><div id="google-attribution" class="attribution">enhanced by <a href="http://www.google.com/"><img src="http://www.google.com/uds/css/small-logo.png" /></a></div>'           ).inject(d);
		new Element('div',{'id':'tv-yahoo'    }).setHTML('<h1>Yahoo</h1><div id="tyahoo-data" class="req-yahoo"></div><div id="tyahoo-page" class="req-yahoo"></div><div id="yahoo-attribution" class="attribution"><a href="http://developer.yahoo.com/"><img src="http://l.yimg.com/us.yimg.com/i/us/nt/bdg/websrv_120_1.gif"></a></div>'            ).inject(d);
		new Element('div',{'id':'tv-digg'     }).setHTML('<h1>Digg</h1><div id="tdigg-data" class="req-digg"></div><div id="digg-attribution" class="attribution">enhanced by <a href="http://digg.com/"><img src="http://digg.com/img/badges/16x16-digg-guy.gif"></a> Digg!</div>'                                                                    ).inject(d);
		new Element('div',{'id':'tv-delicious'}).setHTML('<h1>del.icio.us</h1><div id="tdelicious-data" class="req-delicious"></div><div id="delicious-attribution" class="attribution">Sourced from <a href="http://del.icio.us/">del.icio.us</a></div>'                                                                                              ).inject(d);
		new Element('div',{'id':'tv-wikipedia'}).setHTML('<h1>Wikipedia</h1><div id="twikipedia-data" class="req-wikipedia"></div><div id="wikipedia-attribution" class="attribution">Sourced from <a href="http://www.theirview.org/download#wikipedia">snapshot</a> of <a href="http://www.wikipedia.org/">WikiPedia</a>. Licensed under GFDL.</div>').inject(d);
		return d;
	},
	
	fetchData: function() {	
		this.google(0);
		this.yahoo(0);
		this.digg();
		this.delicious();
		this.wikipedia();
	},
	
	google:    function(offset) { this.wrapCall('google',    new Hash({'action':'inlink.google',   'url':this.cl(), 'offset':offset}), [this.renderGoogle.bind(this),this.pageGoogle.bind(this)] );},
	yahoo:     function(offset) { this.wrapCall('yahoo',     new Hash({'action':'inlink.yahoo',    'url':this.cl(), 'offset':offset}), [this.renderYahoo.bind(this),this.pageYahoo.bind(this)]   );},
	digg:      function()       { this.wrapCall('digg',      new Hash({'action':'inlink.digg',     'url':this.cl()                 }), [this.renderDigg.bind(this)]                              );},
	delicious: function()       { this.wrapCall('delicious', new Hash({'action':'inlink.delicious','url':this.cl()                 }), [this.renderDelicious.bind(this)]                         );},
	wikipedia: function()       { this.wrapCall('wikipedia', new Hash({'action':'inlink.wikipedia','url':this.cl()                 }), [this.renderWikipedia.bind(this)]                         );},
	
	renderGoogle: function(json) {
	  	var ul = new Element('ul',{'class':'tmp-google'});
		if(json.responseStatus != 200) new Element('li').appendText(json.responseDetails).inject(ul);
	  	if(json.responseStatus == 200) {
			if(json.responseData.results.length == 0) {
				new Element('li').appendText("No results available").inject(ul);
			}
			else {
	  			json.responseData.results.each(function(item){
	  				var li = new Element('li');
	  				new Element('a',{'href':item.url,'title':item.title,'class':'google-result-link'}).appendText(item.title.trimLength(50,'...')).inject(li);
					new Element('p',{'class':'google-result-description'}).setHTML(item.content).inject(li);
	  				li.inject(ul);
	  			});
			}
	  	}
		ul.inject($('tgoogle-data'));
	},
	
	renderYahoo: function(json) {
	  	var ul = new Element('ul',{'class':'tmp-yahoo'});
	  	if(json.Error) {
	  		new Element('li').appendText(json.Error.Message).inject(ul);
	  	}
	  	else {
			if(json.ResultSet.totalResultsAvailable == 0) {
				new Element('li').appendText("No results available").inject(ul);
			}
			else {
				// yahoo might return a single result
				if(json.ResultSet.Result instanceof Array ) {
	  				json.ResultSet.Result.each(function(item){
	  					var li = new Element('li');
	  					new Element('a',{'href':item.ClickUrl,'title':item.Title}).appendText(item.Title.trimLength(50,'...')).inject(li);
	  					li.inject(ul);
	  				});
	  			}
	  			else {
	  				var item = json.ResultSet.Result;
  					var li = new Element('li');
  					new Element('a',{'href':item.ClickUrl,'title':item.Title}).appendText(item.Title.trimLength(50,'...')).inject(li);
  					li.inject(ul);
	  			}
	  			
			}
	  	}
	  	ul.inject($('tyahoo-data'));
	},
	
	renderDigg: function(json) {
		if(json.count == 0) {
			// TODO - better wording about prompting user to submit to digg
			new Element('p',{'class':'tmp-digg'}).appendText("no stories found.").inject($('tdigg-data'));
			
			// modified version of http://digg.com/tools/diggthis.js, using 'compact' skin
			var url = "http://digg.com/tools/diggthis.php?u=" + encodeURIComponent(this.cl()) + '&s=compact';
			var i = new Element('iframe',{'class':'tmp-digg','src':url,'width':120,'height':18,'frameborder':0,'scrolling':'no'});
			i.inject($('tdigg-data'));
		}
		else {
			json.stories.each(function(item){
				new Element('div',{'class':'tmp-digg'}).setHTML(
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

	// TODO - nicer display del.icio.us data
	// TODO - format number of posts,tags
	// TODO - offer user option of bookmarking current link into delicious
	renderDelicious: function(json) {
		if(json.none) return new Element('p',{'class':'tmp-delicious'}).appendText("not found in del.icio.us").inject($('tdelicious-data'));
		
		new Element('p',{'class':'tmp-delicious'}).appendText('Total number of posts: ' + json.total_posts).inject($('tdelicious-data'));
		if(json.top_tags instanceof Object) {
			var ul = new Element('ul',{'class':'tmp-delicious theirview-listing'});
			var tHash = new Hash(json.top_tags);
			tHash.each(function(value,key){
				var li = new Element('li');
				new Element('a',{'href':'http://del.icio.us/tag/' + key}).appendText(key).inject(li);
				new Element('span').appendText(" : " + value).inject(li);
				li.inject(ul);
			})
			ul.inject($('tdelicious-data'));
			new Element('br',{'clear':'all'}).inject($('tdelicious-data'));
		}
	},
	
	renderWikipedia: function(json) {
		if(json.count == 0) {
			new Element('p',{'class':'tmp-wikipedia'}).appendText("no links found.").inject($('twikipedia-data'));
		}
		else {
			var ul = new Element('ul',{'class':'tmp-wikipedia theirview-listing'});
			json.rows.each(function(item){
				var li = new Element('li');
				new Element('a',{'href':'http://en.wikipedia.org/wiki/' + item.title}).appendText(item.title).inject(li);
				li.inject(ul);
			});
			ul.inject($('twikipedia-data'));
			new Element('br',{'clear':'all'}).inject($('twikipedia-data'));
		}
	},
	
	pageGoogle: function(json) {
		// google doesn't go beyond four pages
		if(json.responseData.cursor.currentPageIndex == 3) {
			var p = new Element('p',{'class':'tmp-google paginate'});
			var prev = new Element('a',{'title':'Previous','href':'#'}).setHTML("&laquo; prev");
			prev.addEvent('click',function(evt){ new Event(evt).stop(); this.google(16); }.bind(this));
			prev.inject(p);
			new Element('span',{'class':'p-divider'}).appendText("|").inject(p);
			new Element('a',{'href':json.responseData.cursor.moreResultsUrl}).setHTML("more results at Google").inject(p);
			p.inject($('tgoogle-page'));
		}
		else {
			this.paginate('google', 'tgoogle-page', 8, json.responseData.cursor.currentPageIndex * 8, json.responseData.cursor.estimatedResultCount);
		}
	},
	
	pageYahoo:  function(json) { this.paginate('yahoo', 'tyahoo-page', 10, json.ResultSet.firstResultPosition - 1, json.ResultSet.totalResultsAvailable); },
	
	paginate: function(name,div,num,offset,max) {
		var p = new Element('p',{'class': 'tmp-' + name + ' paginate'});
		
		if(offset > 0) {
			var prev = new Element('a',{'title':'Previous',href:'#'}).setHTML("&laquo; prev");
			if(name == 'google') prev.addEvent('click',function(evt){ new Event(evt).stop(); this.google(offset - num); }.bind(this));
			if(name == 'yahoo')  prev.addEvent('click',function(evt){ new Event(evt).stop(); this.yahoo(offset - num); }.bind(this));
			prev.inject(p);
		}
		else {
			new Element('span',{'class':'p-disabled'}).setHTML("&laquo; prev").inject(p);
		}
		
		new Element('span',{'class':'p-divider'}).appendText("|").inject(p);
		
		if(offset + num < max - 1) {
			var next = new Element('a',{'title':'Next','href':'#'}).setHTML("next &raquo;");
			if(name == 'google') next.addEvent('click',function(evt){ new Event(evt).stop(); this.google(offset + num); }.bind(this));
			if(name == 'yahoo')  next.addEvent('click',function(evt){ new Event(evt).stop(); this.yahoo(offset + num); }.bind(this))
			next.inject(p);
		} else {
			new Element('span',{'class':'p-disabled'}).setHTML("next &raquo;").inject(p);
		}
		
		p.inject($(div));
	}

});

var TheirViewInlink = new TheirViewInlinkSpace(TheirViewInlinkShift);
