
// Our Space class - refs to our code, icon, and css
//var FisheyeSpace = new Class({
	//Extends: ShiftSpace.Space,
	//attributes: {
		//name: 'Fisheye',
		//icon: 'Fisheye.png',
		//css : 'Fisheye.css'
	//}
//});


var wrapSetHTML =  function(el, html) {
    if (typeof (el.setHTML) != 'undefined') {
	    el.setHTML(html);
    } else if (typeof (el.set) != 'undefined') {
	    el.set("html", html);
    }
    // TODO: alert if supports neither
}

// Get the latest plugins, languages, and layout from SVN
//var feRoot="http://metatron.shiftspace.org/code/trunk/spaces/Fisheye/";
var feRoot="http://fisheye.ffem.org/shiftspace_0.5_nov_2008/spaces/Fisheye/";

var makeTextBox = function(target, text) {
    var usrBox = new ShiftSpace.Element('div');
    usrBox.appendText(text);
    usrBox.injectInside(target);
    return usrBox;
}

// Some convenience funcs
var makeNoteBox = function (container) {
    var nb = new ShiftSpace.Element('div', {'class' : 'FisheyeNoteBox'});
    if (container)
	nb.injectInside(container);
    return nb;
}

var makeButton = function(label, container, callbackFunc) {
    var ab = new ShiftSpace.Element( 'input', {
	type : 'button', 'class' : 'FisheyeNoteShiftButton',
	value : label,
    });
    if (container)
        ab.injectInside(container);
    if (callbackFunc)
	ab.addEvent('click', callbackFunc);
    return ab;
}

var makeDisplayItem = function(target) {
    var ad = new ShiftSpace.Element('div', { 'class' : 'FisheyeDisplayItem' });
    if (target)
	ad.injectInside(target);
    return ad;
}

var addImage = function(imguri, container) {
	imageBox = new ShiftSpace.Element('div');
	wrapSetHTML(imageBox, '<img src="' + imguri + '" />');
	imageBox.injectInside(container);
}


/* Define a render class. This allows it to be extended, so that special
 * types (eg NewsTrust) can extend this and override some funcs to
 * customize rendering and interface.  Render funcs all take 'that'
 * as first argument, this is a FisheyeShift object equivalent to
 * 'this' in the main class code */
var FisheyeCriticismRenderClass = new Class({

    appendMode: function(that, target, txt) {
	if (!that.haveSaved)
	  txt += " (draft)";
	else
	  txt += that.modes[that.mode].iconNote;
	target.appendText(txt); // TODO: only if not empty?
    },

    // Render the icon, the only thing visible until user mouses over
    renderIcon: function(that, target) {
	this.appendMode(that, target, that.iconText);
    },

    renderCategory: function(that, isEdit, container) {
	//var someBox = new ShiftSpace.Element('div', {'class':'FisheyeCategory'});
	var categoryText = that.criticismCategoryGetName (that.categoryType);

	if (isEdit) {
	    var someBox = new ShiftSpace.Element('div', {'class':'FisheyeEditableText'});
	    someBox.setStyles({ 'class': 'FisheyeEditableText', });

	    that.someList = new ShiftSpace.Element('select', 
		{'class':'FisheyeEditableText',
		 'name':'mylist'}
	    );
	    for (var key in that.criticismCategories) {
	      var someOption = new ShiftSpace.Element('option', {'value':key});
	      someOption.setStyles({
		  'color': 'white',
		  'background-color': that.criticismCategoryGetColor(key),
	      });
	      someOption.appendText(key + " : " + that.criticismCategoryGetName(key));
	      someOption.injectInside(that.someList);
            }
	    that.someList.value = that.categoryType;
	    that.someList.addEvent('change', function(){
		    var w = this.someList.selectedIndex;
		    var key = this.someList.options[w].value;
		    this.setCategory(key);
		}.bind(that));
	    that.someList.injectInside(container);

	    //someBox.appendText("[ " + categoryText + " ]");
	    //someBox.addEvent('click', that.changeCategory.bind(that));
	    //someBox.injectInside(container);
	}
	else {
	    var someBox = new ShiftSpace.Element('div', {'class':'FisheyeCategory'});
	    someBox.appendText(categoryText);
	    someBox.injectInside(container);
	}

	//someBox.injectInside(container);
    },

    simpleSummaryEdit: true,

    // Render the summary, the main text body of popup
    // in edit mode, render an entry box
    renderSummary: function(that, isEdit, de) {
        that.log("RENDER SUMMARY CALLED");
	if (isEdit) {
	    that.log("RENDER SUMMARY IN EDIT MODE");
	    if (this.simpleSummaryEdit) {
	        that.log("RENDER SUMMARY SIMPLE IN EDIT MODE");
		that.buildInputArea();
		that.inputArea.injectInside(that.editBox);
	    } else {
		// create an iframe with the css already loaded
		that.summaryFrame = new ShiftSpace.Iframe({
		  'class' : 'FisheyeEditableText',
		  scroll : 'no',
		  rows : 4,
		  cols : 25,
		  wrap : 'hard',
		  css : that.getParentSpace().attributes.css,
		  border : 'medium double #C4C87C' ,
		  onload : that.finishFrame.bind(that)
		});
		that.summaryFrame.injectInside(that.editBox);
	    }
	} else {
	    that.log("RENDER SUMMARY DISPLAY MODE");
	    var sBox = new ShiftSpace.Element ('div', {'class':'FisheyeSummary'});
	    sBox.appendText(that.summaryText);
	    sBox.injectInside (that.detailsBox);
	}
    },

    renderLinkBox: function(that, isEdit, container) {
	var criticismLinkBox = new ShiftSpace.Element('div', {
		'padding':  '0px 5px 10px 5px',
	});
	criticismLinkBox.injectInside(container);
	if (isEdit) {
	    aBox = new ShiftSpace.Element('div', {'class':'FisheyeEditableText'});
	    aBox.setStyles({ 'font-weight': 'bold', });
	    aBox.appendText(that.criticismLink);
	    aBox.addEvent('click', that.changeCriticismLink.bind(that));
	    aBox.injectInside(criticismLinkBox);
	} else {
	    aBox = new ShiftSpace.Element('div', {'class':'FisheyeDisplayItem'});
	    aBox.setStyles({ 'font-weight': 'bold', });
	    aLink = this.createLink (that.criticismLink, "[" + that.getText('read') + "]", aBox);
	    aBox.injectInside(criticismLinkBox);
	}
    },

    renderSource: function(that, target) {
	var sb = makeDisplayItem();
	name = that.criticismSourceGetName (that.sourceCode);
	//sb.appendText(that.getText('source') + ": " + name + " [" + that.getText('ignore') + "]");
	sb.appendText(that.getText('source') + ": " + name + " ");
	var ignoreButton = new ShiftSpace.Element('span', { 'class' : 'FisheyeActiveText' });
	//ignoreButton.appendText("[ignore this source]");
	ignoreButton.appendText("[" + that.getText('ignore') + that.getText('source') + "]");
	ignoreButton.addEvent('click', function(){
	    this.settings.hiddenSources[this.sourceCode] = true;
	    this.saveSettings();
	    this.rebuild();
	}.bind (that));
	ignoreButton.injectInside(sb);
	sb.injectInside(target);
    },

    getDisplaySummary: function(that) {
	return that.summaryText;
    },

    changeLinkPrompt : "Link to criticism:",

	// XXX: styles should come from class but empirically fails...
    createLink: function(aHref, text, container) {
	var aLink = new ShiftSpace.Element('a', {
	    'class' : 'FisheyeLinkItem',
	    'styles': {
		    'background-color' : '#F5FB9B',
		    'color': '#00F',
		    'font-weight': 'bold',
		    'display' : 'inline',
	    },
	    'href' : aHref
	});
	aLink.appendText(text);
	if (container)
	    aLink.injectInside(container);
	return aLink;
    },
});
var FisheyeDefaultRenderClass = new FisheyeCriticismRenderClass();


var displayTextEnglish = {
	languageKey : "en",
	languageName : "English",
	source : "source",
	submitter : "submitter",
	settings : "settings for",
	settingsCat : "Which categories are shown",
	settingsIgnoredSources : "Ignored sources",
	settingsIgnoredAuthors : "Ignored authors",
	settingsNoneIgnored : "none ignored",
	clickToRestore : "(click to restore)",
	ignore : "ignore this ",
	read : "Read",
	rangeWarning : "You need to select some page content first!",
	save : "Save",
	cancel : "Cancel",
	done : "Done",
	lockPos : "Embed after selected text",
	defaultText : "This claim is false because...",
	language : "Language",
	editLink : 'Set link to source supporting your comment:',
	editType : 'Make sure type is set correctly:',
	editSummary : 'Summarize the criticism here:',
	editEmbed : 'Embed into text: select some text and press the button below.  Shift will be set to embed after the selected text.',
};

var displayLanguages = {
	'en' : displayTextEnglish,
};


var FisheyeShift = new Class({
	Extends: ShiftSpace.Shift,

    /*
	 Categories Static Data
    */



    criticismCategories: {
    			// Hard Failure - red
		0: {'name':'Factual Error', 'color':'#F00'},
		1: {'name':'Logical Fallacy', 'color':'#F33'},
		2: {'name':'Misleading', 'color':'#F66'},
			// Soft Failure - Orange / Yellow
		3: {'name':'Unchallenged Quote', 'color':'#F90'},
		4: {'name':'Unexplained Contradiction', 'color':'#EE0'},
		5: {'name':'Bias In Presentation', 'color':'#F0F'},
		6: {'name':'Projecting Motive', 'color':'#939'},
			// Neutral - blue
		7: {'name':'Context', 'color':'#33F'},
		8: {'name':'Differing Viewpoint', 'color':'#55F'},
			// Positive - green
		9: {'name':'Supplementary Information', 'color':'#5F5'},
			// Embedded systems
    },

    criticismCategoryGetName: function(idx) {
	if (displayLanguages[this.settings.language] &&
	    displayLanguages[this.settings.language].criticismCategories &&
	    displayLanguages[this.settings.language].criticismCategories[idx])
	  return displayLanguages[this.settings.language].criticismCategories[idx];
    	else if (this.criticismCategories[idx] &&
    	         this.criticismCategories[idx].name)
	  return this.criticismCategories[idx].name;
	else
	  return "LOADING";
    },

    criticismCategoryGetColor: function(idx) {
    	if (this.criticismCategories &&
    	    this.criticismCategories[idx] &&
    	    this.criticismCategories[idx].color)
    	    return this.criticismCategories[idx].color;
	return '#AAA';
    },


    /*
	 Sources Static Data
    */

    criticismSources: {
		0: {'name' : 'Unknown'},
		1: {'name' : 'Media Matters',
		    'homepage' : 'http://mediamatters.org/'},
		2: {'name' : 'FAIR',
		    'homepage' : 'http://fair.org/'},
		3: {'name' : 'ThinkProgress',
		    'homepage' : 'http://thinkprogress.org/'},
		4: {'name' : 'NewsTrust',
		    'homepage' : 'http://newstrust.net/'},
    },

    criticismSourceGetName: function(idx) {
    	if (this.criticismSources[idx] &&
    	    this.criticismSources[idx].name)
	    return this.criticismSources[idx].name;
	else
	    return "LOADING";
    },

    criticismSourceFromLink: function(uri) {
	for (var key in this.criticismSources) {
	    if (uri.match(this.criticismSources[key].homepage)) {
		return key;
	    }
	}
    	return 0;
    },



    // Define different modes that the shift might be in: display, edit, config..
    modes: {
	0: {'name' 	: 'Display',
	    'iconNote' 	: ''},
	1: {'name' 	: 'Edit',
	    'iconNote' 	: ' (edit)',
	    onSave 	: function() {
		this.haveSaved = 1;
		this.save();
		this.setMode (this.MODE_DISPLAY);
	    },
	    onCancel 	: function() {
		if (this.haveSaved) {
		    this.loadStoredData(this.json);
		    this.setMode (this.MODE_DISPLAY);
		} else
		    if (this.anchoredIcon) {
		      this.anchoredIcon.addClass('FisheyeHidden');
		    }
		    this.hide(); // Cancel an unsaved new note
	    },
	    onRange 	: function() { 
		this.log("onRange");
		if (window.getSelection) {
		    var mySel = window.getSelection();
		    if (mySel.rangeCount > 0) {
			this.posRange = mySel.getRangeAt(0);
		// XXX: flatten only on render?  better origText....
			this.posRange.collapse(false); // flatten to endpoint
			// XXX: only on save??  need policy....
			this.posRef = ShiftSpace.RangeCoder.toRef (this.posRange);
			// Render only *AFTER* making ref, else our content will
			// be part of ref and break shift load...
			//this.renderRange(this.posRange);
		    } else {
			alert (this.getText('rangeWarning'));
		    }
		}
	    },
	    makeButtons : function(that) {
		var di = makeDisplayItem(that.editBox);
		makeButton(that.getText('save'), di, this.onSave.bind(that));
		makeButton(that.getText('cancel'), di, this.onCancel.bind(that));
		//makeButton(that.getText('lockPos'), di, this.onRange.bind(that));
	    },
	  },
	2: {'name'	: 'Settings',
	    'iconNote'	: ' (config)',
	    onSave 	: function() {
		this.saveSettings();
		this.setMode (this.MODE_DISPLAY);
	    },
	    onCancel 	: function() {
		this.loadSettings();
		this.setMode (this.MODE_DISPLAY);
	    },
	    makeButtons : function(that) {
		var di = makeDisplayItem(that.settingsBox);
		makeButton(that.getText('save'), di, this.onSave.bind(that));
		makeButton(that.getText('cancel'), di, this.onCancel.bind(that));
	    },
	    fillBody	: function(that, container) {
		if (that.settingsLayout) {
		    that.settingsBox = makeNoteBox(container);
		    wrapSetHTML(that.settingsBox, that.settingsLayout);
		    var listitems = that.settingsBox.getElementsByTagName("*");
		    for (i=0; i<listitems.length; i++) {
			el = listitems[i];
			if (el.hasAttribute('fisheyeText'))
			    el.firstChild.nodeValue = that.getText(el.getAttribute("fisheyeText"));
			else if (el.hasAttribute('fisheyeFunc'))
			    that[el.getAttribute("fisheyeFunc")](el);
			else if (el.hasAttribute('fisheyeUserName'))
			    el.firstChild.nodeValue = that.getUserName();
		    }
		} else {
		    that.settingsBox = makeNoteBox(container);
		    if (that.isProxy())
		        wrapSetHTML(that.settingsBox, "Settings disabled in proxy mode");
		    else
		        wrapSetHTML(that.settingsBox, "MISSING LAYOUT");
		}
	    },
	  },
	3: {'name'	: 'Help',
	    'iconNote'	: ' (help)',
	    onDone 	: function() { this.setMode (this.MODE_DISPLAY); },
	    makeButtons : function(that) {
		var di = makeDisplayItem(that.helpBox);
		makeButton(that.getText('done'), di, this.onDone.bind(that));
	    },
	    fillBody	: function(that, container) {
		that.helpBox = makeNoteBox(container);
		that.helpBox.appendText("."); // XXX
		var br = new ShiftSpace.Element('br');
		br.injectInside(that.helpBox);
	        aLink = that.renderClass.createLink ("http://fisheye.ffem.org/help.html", "click here to view help on website", that.helpBox);
	    },
	  },
    },


    // XXX: deprecated: remove
    loadJavascripts	: function(path, dir, callback) {
	this.log("loadJavascripts with path '" + path + "'");
	if (this.xmlhttpRequest === undefined)
	  return false;
	url=feRoot + dir + "/" + path;
	this.rebuildLock();

	this.getWebPage(url,
	  function(response) {
	    objList = eval (response.responseText);
	    for (key in objList) {
	      url = feRoot + dir + "/" + objList[key] + ".js";
	      this.rebuildLock();
	      this.getWebPage(url,
		function(response) {
		  thisObj = eval (response.responseText);
		  if (thisObj && (typeof callback == 'function'))
		    callback(thisObj, key);
		  if (!thisObj)
		    this.log("failed to create object from '" + url + "'");
		  this.rebuildUnlock();
		}.bind(this),
		function(response) { this.rebuildUnlock(); }.bind(this) );
	    }
	    this.rebuildUnlock();
	  }.bind(this),
	  function(response) { this.rebuildUnlock(); }.bind(this)
	);
    },

    modeGetName : function(key) {
	if (displayLanguages[this.settings.language] &&
	    displayLanguages[this.settings.language].modes &&
	    displayLanguages[this.settings.language].modes[key])
	    return displayLanguages[this.settings.language].modes[key];
	return this.modes[key].name;
    },

    // Get text for display, current language if possible or default to English
    getText: function(word) {
	if (displayLanguages[this.settings.language] &&
	    displayLanguages[this.settings.language][word])
	  return displayLanguages[this.settings.language][word];
	return displayTextEnglish[word];
	
    },

    // Allow shift to serve as handle to a few local funcs
    wrapSetHTML: function(el, html) { wrapSetHTML(el, html); },

    log: function(msg) {
	if (typeof console == 'object' && console.log) {
		console.log(msg);
	} else if (typeof GM_log != 'undefined') {
		GM_log(msg);
	}
    },

    dumpObj: function (someObj) {
	for (var key in someObj) {
	  this.log("" + key + " : " + someObj[key]);
	}
    },


    updatePosition: function() {
	    var pos = this.anchoredIcon.getPosition();
	    this.element.setStyles({
	      'position': 'absolute',
	      left : pos.x,
	      top : pos.y,
	    });
    },

    renderRange: function(reRange) {
	var oSpan = new ShiftSpace.Element('div');
	this.anchoredIcon = oSpan;
	this.refreshStyle(oSpan);
	this.renderClass.renderIcon(this, oSpan);
	oSpan.addEvent('mouseover', this.onMouseIn.bind(this));
	if (this.posRange) {
	  this.log("renderRange: has posRange ");
	  if (this.posRange.insertNode) {
	      oSpan.style.display = "inline";
	      this.posRange.insertNode(oSpan);
	      this.updatePosition();
	  } else {
	      this.log("tried to render invalid range");
	  }
	} else {
	  this.log("renderRange: did not have posRange ");
	    // XXX: restore
	    oSpan.setStyles({
	      'position': 'absolute',
	      left : 0, //this.json.position.x,
	      top : 0, //this.json.position.y
	    });
            oSpan.injectInside(document.body);
        }
        this.log("renderRange: done ");
    },


    loadStoredData: function(json) {

	// Load shift data from JSON
	this.haveSaved = json.haveSaved || 0;  // TODO: only on initial load?
        this.log("loadStoredData: this.haveSaved '" + this.haveSaved + "' from json.haveSaved '" + json.haveSaved + "'");
	this.criticismLink = json.criticismLink || "http://a.org/some.html";
	this.summaryText = json.summaryText || this.getText('defaultText');
	this.categoryType = json.categoryType || 0;
	this.sourceCode = json.sourceCode || 0;

	// Initialize based on loaded data
	this.renderClass = this.refreshRenderClass();
	    // XXX: does "shown" still make sense?
	this.shown = this.haveSaved ? false : true;
    },



    /*
	 Setup - when a particular annotation is created or loaded
    */

    setup: function(json) {
        this.parent(json);
        this.log("FISHEYE setup called with json: ");
	this.dumpObj(json);

	// Store initialize data in case we want to reload
	this.json = json;

	this.loadSettings();
	// XXX: then get rid of this next line once above is reinstated
        // this.gotSettings({});
    },

// XXX: use these standard hooks
//  show: function()
 // {
    //this.parent();
    //this.update();
    //this.hideEditInterface();
    //// have to remember to unpin
    //if(this.getPinRef() && !this.isPinned()) this.pin(this.element, this.getPinRef());
  //},
//
  //edit: function()
  //{
    //this.parent();
    //this.showEditInterface();
  //},

    continueInitialize: function() {

	// XXX: how to handle default language?
	if (!this.settings.language)
	    this.settings.language = 'en';

	// Static data
	this.iconText = "F";

	this.loadStoredData(this.json);

	// The we sometimes need to access these modes directly in code
	this.MODE_DISPLAY = 0;
	this.MODE_EDIT = 1;
	this.mode = this.MODE_DISPLAY;

	if (this.shouldIgnoreShift()) {
	  this.log("continueInitialize: ignoring shift");
	  // XXX: should register with the summary panel, panel should say 'N ignored'
	  return;
	} else {
	  this.log("continueInitialize: NOT ignoring shift");
	}

        this.build(this.json);

	this.rebuildLock();

	languages = this.getParentSpace().attributes().lib.lang
        //this.log("LANGUAGES:");
        //this.dumpObj(languages);
	for (var key in languages) {
	  this.log("LANGUAGE " + key);
	  //this.log("" + key + " : " + someObj[key]);
	  if (key != "languages.js") { // XXX: file is deprecated, remove
	    thisLang = eval(languages[key]);
		// TODO: stronger validation of languages
	    if (thisLang.languageKey === undefined) {
	      this.log ("BAD LANGUAGE " + key);
	      this.log ("BAD LANGUAGE " + key);
	      this.log ("BAD LANGUAGE " + key);
	    } else {
	      displayLanguages[thisLang.languageKey] = thisLang;
	      this.log ("added language " + thisLang.languageKey);
	    }
	  } else {
	    this.log ("IGNORING LANGUAGES.JS");
	  }
	}

	sources = this.getParentSpace().attributes().lib.sources
	for (var key in sources) {
	  if (key != "sources.js") { // XXX
	    this.log("source key " + key);
	    thisSource = eval(sources[key]);
	    if (thisSource) {
		this.criticismCategories[thisSource.key] = {
			'name':thisSource.name, 
			'color':thisSource.color, 
			'renderClass':thisSource.renderClass, };
		this.log("loaded source " + thisSource.key + ":" + thisSource.name);
		if (this.categoryType == thisSource.key)
		    this.renderClass = this.refreshRenderClass();
	    }
	  } else {
	    this.log("IGNORING SOURCES.JS");
	  }
	}

        // XXX: restore
	if (false) {
		this.loadJavascripts("languages.js", "lang", function(thisLang){
			if (thisLang)
			    displayLanguages[thisLang.languageKey] = thisLang;
		}.bind(this));

		this.loadJavascripts("sources.js", "sources", function(thisSource){
			if (thisSource) {
			    this.criticismCategories[thisSource.key] = {
				    'name':thisSource.name, 
				    'color':thisSource.color, 
				    'renderClass':thisSource.renderClass, };
			    this.log("loaded source " + thisSource.key + ":" + thisSource.name);
			    if (this.categoryType == thisSource.key)
				this.renderClass = this.refreshRenderClass();
			}
		}.bind(this));
        }
	this.rebuildUnlock();

        // XXX: restore
        this.log("trying to get settingsLayout...");
	this.settingsLayout = this.getParentSpace().attributes().lib.layout["settings.html"]
        //this.log("got SETTINGS LAYOUT '" + this.settingsLayout + "'");

	if (false) { // XXX: remove
		this.getWebPage(feRoot + "layout/settings.html", function(response) {
			this.settingsLayout = response.responseText;
		}.bind(this));
	}

	if (!this.haveSaved)
	    this.setMode (this.MODE_EDIT);

	this.manageElement(this.element);

	// Hidden until mouseover XXX: take edit/havesaved into account?  seems to work as is....
	if (this.posRange)
          this.element.addClass('FisheyeHidden');

	FisheyeConsole.registerShift(this);
    },



    /*
	 Functions to fill and refresh parts of GUI
    */

    fillSubmitter: function(that) {
	// Submitter
	this.submitterBox = new ShiftSpace.Element('div', {
		'class' : 'FisheyeDisplayItem',
	});
        this.submitterBox.appendText(this.getText('submitter') + ": " + this.getAuthorName());
	if (this.canIgnore()) {
	  this.submitterIgnore= new ShiftSpace.Element('div', {
		  'class' : 'FisheyeInlineActiveText',
	  });
	  this.submitterIgnore.appendText("[" + this.getText('ignore') + "]");
	  this.submitterIgnore.addEvent('click', function(){
	      this.settings.hiddenAuthors[this.shiftAuthor()] = true;
	      this.settings.hiddenAuthorNames[this.shiftAuthor()] = this.getAuthorName();
	      this.saveSettings();
	      this.rebuild();
	  }.bind (that));
	  this.submitterIgnore.injectInside(this.submitterBox);
	}
        this.submitterBox.injectInside(this.detailsBox);
    },

    refreshStyle: function(target) {
        target.setStyles({
            'font': '16px verdana, sans-serif',
	    'font-weight': 'bold',
            'padding':  '2px 2px 2px 2px',
            'color': '#FFF',
	    'background-color': this.criticismCategoryGetColor(this.categoryType),
        });
    },

    // Call this after setting category to update render func
    refreshRenderClass: function() {
	if (this.criticismCategories[this.categoryType] &&
	    this.criticismCategories[this.categoryType].renderClass)
	  return this.criticismCategories[this.categoryType].renderClass;
	return FisheyeDefaultRenderClass;
    },

    shouldIgnoreShift: function() {
	if (this.settings.hiddenAuthors[this.shiftAuthor()]) {
	    this.log("HIDING because shiftAuthor is in hidden list");
	    return true;
	} else {
	    this.log("NOT HIDING because shiftAuthor is not in hidden list");
	    return false;
	}
    },

    // Fills the main element with all the GUI content
    fillElement: function(container) {

	if (this.rebuildLockCount > 0)
	    return;

	// XXX: replace with hide/show so it doesn't leave dots
	// XXX: don't filter 'unknown' ???
	// XXX: be careful to allow creation of new shifts (don't filter before save)
/* 
	if ((this.settings.hiddenCategories[this.categoryType] && this.mode == this.MODE_DISPLAY))
	    || this.settings.hiddenSources[this.sourceCode]) 
	    return;
*/
	// XXX: deprecate
	if (this.shouldIgnoreShift())
	    return;

	this.refreshStyle(this.element);

	// Render icon into top of element
        //this.handleBar = new ShiftSpace.Element ('div', {'class':'FisheyeHandleBar'});
	//this.handleBar.appendText('yomama');
        this.handleBar = new ShiftSpace.Element ('div');
        this.handleBar.injectInside(this.element);
	this.renderClass.renderIcon(this, this.handleBar);

	// Display and edit modes are rendered in parallel,
	// relying on renderClass so that plugins (eg NewsTrust)
	// can accept and display special data
	if (this.mode == this.MODE_DISPLAY || this.mode == this.MODE_EDIT) {
	    var isEdit = (this.mode == this.MODE_EDIT) ? true : false;
	    var de = isEdit ? this.editBox : this.detailsBox;

	    if (isEdit) {
		this.editBox = makeNoteBox(container);
		this.editBox.setStyles({ width : 300, });
		var de = this.editBox;
		de.appendText(this.getText('editLink'));
		this.renderClass.renderLinkBox(this, isEdit, de);
	        new ShiftSpace.Element ('div', {'class':'FisheyeSpacer'}).injectInside(de);
		de.appendText(this.getText('editType'));
		this.renderClass.renderCategory(this, isEdit, de);
	        new ShiftSpace.Element ('div', {'class':'FisheyeSpacer'}).injectInside(de);
	        de.appendText(this.getText('editSummary'));
		this.renderClass.renderSummary(this, isEdit, de);
	        new ShiftSpace.Element ('div', {'class':'FisheyeSpacer'}).injectInside(de);
		de.appendText(this.getText('editEmbed'));
		new ShiftSpace.Element('br').injectInside(de);
		makeButton(this.getText('lockPos'), de, this.modes[this.mode].onRange.bind(this));
	        new ShiftSpace.Element ('div', {'class':'FisheyeSpacer'}).injectInside(de);
	    } else {
		this.detailsBox = makeNoteBox(container);
		if (this.mode != this.MODE_DISPLAY || !this.shown)
		    this.detailsBox.addClass('FisheyeHidden');
		var de = this.detailsBox;
		this.renderClass.renderCategory(this, isEdit, de);
		this.renderClass.renderSummary(this, isEdit, de);
		this.renderClass.renderLinkBox(this, isEdit, de);
	    }

	    this.fillSubmitter(this);
	    if (!isEdit) {
		this.renderClass.renderSource(this, de);
	    }
	}

	// Other modes don't depend on renderClass, handle generic
	else {
	    this.modes[this.mode].fillBody(this, container);
	}

	// Button Box: DISPLAY mode gets buttons for each other mode,
	// other modes make their own buttons as needed
	if (this.mode == this.MODE_DISPLAY) {
	    this.buttonBox = makeDisplayItem();
	    for (var key in this.modes) {
		if (key == this.MODE_DISPLAY) {}
		else if (key == this.MODE_EDIT && !this.myCanEdit()) {} 
		else {
		  var eb = makeButton(this.modeGetName(key), this.buttonBox);
		  eb.addEvent('click', this.setMode.bind(this, key));
		}
	    }
	    this.buttonBox.injectInside( this.detailsBox );
	} else {
	    this.modes[this.mode].makeButtons(this);
	}
    },

	// XXX: temp debug wrapper, remove
    myCanEdit: function() {
	this.log( "myCanEdit: this.shiftAuthor() " + this.shiftAuthor() + " this.getUserId() " + this.getUserId() + " this.canEdit() " + this.canEdit());
	return this.canEdit();
    },

    //canEdit: function() {
	//// XXX: restore
	//return true;
	//this.log("canEdit this.getUserName " + this.getUserName() + " shiftAuthor " + this.shiftAuthor());
	//return this.loggedIn() && (this.getUserName() == this.shiftAuthor());
    //},

    // Don't allow the user to ignore themself
    canIgnore: function() {
	// TODO: doesn't work.  dump both.
	this.log( "CAN_IGNORE shiftAuthor " + this.shiftAuthor() + " getUserId " + this.getUserId());
	return (this.shiftAuthor() != this.getUserId());
    },

    loggedIn : function() {
	return ShiftSpace.User.isLoggedIn();
    },

    shiftAuthor : function() {
      // XXX: getAuthor() doesn't work anymore?  'undefined' displayed in GUI
      return this.getAuthor();
    },

    // currently this is just used to hide settings as it seems
    // settings aren't saved in proxy mode XXX: true
    // XXX: isProxy will no longer work
    isProxy : function() {
	return false;
    },

    getUserName : function() {
        return ShiftSpace.User.getUserName();
    },


    toggleHiddencategory: function(key) {
	if (this.settings.hiddenCategories[key])
	  this.settings.hiddenCategories[key] = false;
	else
	  this.settings.hiddenCategories[key] = true;

	this.rebuild();
    },

    fillCriticismCategories: function(container) {
	for (var key in this.criticismCategories) {
	    var label = this.settings.hiddenCategories[key] ?  " [_] " : " [X] ";
	    label += this.criticismCategoryGetName(key);
	    var someBox = makeTextBox(container, label);
	    someBox.addEvent('click', function(e, key){
		this.toggleHiddencategory(key);
	    }.bindWithEvent(this, key));
	}
    },

    fillIgnoredSources: function(container) {
	var hadIgnoredSource = false;
	for (var key in this.settings.hiddenSources) {
	    if (this.settings.hiddenSources[key]) {
		var label = this.criticismSourceGetName(key);
		var someBox = makeTextBox(container, label);
		someBox.addEvent('click', function(key){
		    this.settings.hiddenSources[key] = false;  // show source
		    this.rebuild();
		}.bind (this, key));
		hadIgnoredSource = true;
	    }
	}
	if (!hadIgnoredSource)
	    makeTextBox (container, "  " + this.getText('settingsNoneIgnored') + "  ");
    },

    fillIgnoredAuthors: function(container) {
	var hadIgnoredUser = false;
	for (var key in this.settings.hiddenAuthors) {
	    if (this.settings.hiddenAuthors[key]) {
	        label = this.settings.hiddenAuthorNames[key]
		var someBox = makeTextBox (container, label);
		someBox.addEvent('click', function(key){
		    this.settings.hiddenAuthors[key] = false;  // show source
		    // Note: don't bother cleaning up authorNames
		    this.rebuild();
		}.bind (this, key));
		hadIgnoredUser = true;
	    }
	}
	if (!hadIgnoredUser)
	    makeTextBox (container, "  " + this.getText('settingsNoneIgnored') + "  ");
    },

    fillLanguages: function(container) {
	for (var key in displayLanguages) {
		var someBox = makeTextBox (container, displayLanguages[key].languageName);
		someBox.addEvent('click', function(key){
		    this.settings.language = key;
		    this.rebuild();
		}.bind (this, key));
	}
    },


    /*
	 Build the interface
    */
    
    build: function(json) {

	// Our toplevel container
        this.element = new ShiftSpace.Element('div');

	// initialize height
	this.element.style.zIndex=1;

	// XXX: restore
	//this.element.setStyles({
	  //'position': 'absolute',
	  //left : json.position.x,
	  //top : json.position.y
	//});
        // XXX: is this the correct new method?
	this.setPosition(json);

	if (json.posRef) {
	    this.posRef = json.posRef;
	    this.log("loaded posRef:");
	    //this.dumpObj (this.posRef);
	    this.posRange = ShiftSpace.RangeCoder.toRange (json.posRef);
	}

	this.log("calling renderRange from line 808");
	this.renderRange(this.posRange);

	this.fillElement(this.element);

	// Add our shift to page
        this.element.injectInside(document.body);

	// set up the mouse enter/leave events for hiding and reveal details
	// TODO: mouseenter/leave trigger "this.hasChild not a function" error... arg order?
	this.element.addEvent('mouseover', this.onMouseIn.bind(this));
	this.element.addEvent('mouseout', this.onMouseOut.bind(this));
    },

    rebuildLockCount : 0,

    rebuildLock: function() {
	this.rebuildLockCount++;
    },

    rebuildUnlock: function() {
	this.rebuildLockCount--;
	if (this.rebuildLockCount <= 0)
	    this.rebuild();
    },

    rebuild: function() {
	if (this.rebuildLockCount > 0)
	    return;
    	this.wrapSetHTML(this.element, "");
	this.fillElement(this.element);
	this.wrapSetHTML(this.anchoredIcon, "");
	this.renderClass.renderIcon(this, this.anchoredIcon);
    },

    // After calling save(), ShiftSpace engine will call back our encode()
    // Any data which needs to persist should be written to json array and
    // returned
    encode: function() {
	var pos = this.element.getPosition();

	if (this.inputArea)
	    this.summaryText = this.inputArea.value;

	this.json = {
	    summaryText : this.summaryText,
	    haveSaved 	: this.haveSaved,
	    categoryType : this.categoryType,
	    sourceCode 	: this.sourceCode,
	    criticismLink : this.criticismLink,
	    position 	: pos,
	    posRef 	: this.posRef,
	       // What gets displayed in shift list
	    summary 	: this.renderClass.getDisplaySummary(this),
	};

	return this.json;
    },


    saveSettings: function() {
	this.getParentSpace().setPreference('settings', this.settings);
    },

    gotSettings: function(settings) {
	this.settings = settings;
	if (!this.settings.hiddenCategories)
	    this.settings.hiddenCategories = {};
	if (!this.settings.hiddenSources)
	    this.settings.hiddenSources = {};
	if (!this.settings.hiddenAuthors)
	    this.settings.hiddenAuthors = {};
	if (!this.settings.hiddenAuthorNames)
	    this.settings.hiddenAuthorNames = {};
	this.continueInitialize();
    },

    loadSettings: function() {
          // XXX: use new standard this.getParentSpace().getPref('settings', {}, this.gotSettings.bind(this)); 
          this.getParentSpace().getPreference('settings', {}, this.gotSettings.bind(this)); 
    },

    setCategory: function(idx) {
	this.categoryType = idx;
	this.renderClass = this.refreshRenderClass();
	this.summaryText = this.inputArea.value; // XXX: edit merge: was this removed?
	this.rebuild();
	FisheyeConsole.updateConsole();
    },

    changeCategory: function() {
    	var txt = "Enter category code:\n";
	for (var i in this.criticismCategories)
	    txt += "  " + i + "=" + this.criticismCategoryGetName(i) + ",\n";

	var msg = prompt(txt, this.categoryType);
	if (msg)
	    this.setCategory(msg);
    },

    maybeTypeFromLink: function(link) {
	// Clean up link  TODO: strip leading whitespace
	if (link.indexOf("http://") == 0) {
	  this.log("string starts with http://");
	  link = link.substring(7);
	}
	for (var key in this.criticismCategories) {
	  var cat = this.criticismCategories[key];
	  var host = cat.host;
	  this.log("checking link " + link + " against key " + key + " host " + host);
	  //this.dumpObj(this.criticismCategories[key]);
	  if (link.indexOf(host) == 0) {
	    this.setCategory(key);
	  }
	}
    },

    changeCriticismLink: function() {
	var msg = prompt(this.renderClass.changeLinkPrompt, this.criticismLink);
	if (msg) {
	    this.criticismLink = msg;
	    this.sourceCode = this.criticismSourceFromLink(msg);
	    this.maybeTypeFromLink(msg);
	    //this.summaryText = this.inputArea.value; // XXX: editmerge: was this removed?
	    this.rebuild();
	}
    },

    setMode : function(newMode) {
	if (this.mode == newMode) return;

	if (newMode == this.MODE_EDIT && !this.loggedIn()) {
          //ShiftSpace.Console.show();
          //ShiftSpace.Console.showTab('login');
          alert('Sorry, you must be signed in to edit shifts.');
	  return;
        }

	if (newMode == this.MODE_EDIT && !this.myCanEdit()) {
	// XXX: in a perfect world this case would never occur
          alert('SoRRY, you cannot edit shift created by user ' + this.getAuthorName());
	  return;
        }

	this.mode = newMode;
	this.rebuild();
	if (this.mode == this.MODE_EDIT)
	    this.element.makeDraggable({handle: this.handleBar});
    },


	// TODO: mootools has an event which doesn't fire on subelements...
	// we could use that, although we'd likely keep the timer logic
    onMouseIn : function( e )
    {
	// we don't want the event to continue
	var evt = new Event(e);
	evt.stopPropagation();

	// Cancel any pending hide, then show
	this.hidePending = 0;

	if (this.shown)
	  return;

	// If user is mousing over placeholder (which might have changed
	// since shift creation, eg if user changes font size) then
        // make sure position matches embedded icon
        this.updatePosition();

	// Raise this Shift a little bit so it draws over the minimized icons
	this.element.style.zIndex=2;
	this.shown = true;

	// DISPLAY is the only mode that minimizes...
	if (this.mode == this.MODE_DISPLAY) {
	    this.detailsBox.removeClass('FisheyeHidden');
	    this.buttonBox.removeClass ('FisheyeHidden');
		// XXX: havesaved etc?
	    if (this.posRange)
	        this.element.removeClass ('FisheyeHidden');
	}
    },
    
    onMouseOut : function( e )
    {
      // we don't want the even to continue
      var evt = new Event(e);
      evt.stopPropagation();

      this.hidePending = 1;

      (function(){ 
	  if (this.hidePending) {    // Unless hide was cancelled...
	      this.hidePending = 0;
	      if (this.mode != this.MODE_DISPLAY)  // Only minimize display mode
		  return;
	      this.detailsBox.addClass('FisheyeHidden');
	      this.buttonBox.addClass('FisheyeHidden');
	      if (this.posRange)
	          this.element.addClass('FisheyeHidden');
	      this.element.style.zIndex=1;  // Lower to default height
	      this.shown = false;
	  } 
      }.bind(this) ).delay(500);
    },

    // XXX - might want to implement show (must call this.parent())
    // to better handle multiple toplevel elements

    /*
      Function : finishFrame
	Finishing building the iframe by including the textarea inside.
	TODO: this was taken from NOTES, unclear why this is not done inline...
	assume because it needs to be linked into document for below to work
    */
    finishFrame : function()
    {
	// Get document reference and MooToolize the body
	var doc = this.summaryFrame.contentDocument;
	this.frameBody = $(doc.body);
	this.frameBody.setProperty('id', 'FisheyeNoteShiftFrameBody');

	// create the text area
	this.inputArea = $(doc.createElement('textarea'));
	this.inputArea.setProperty('class', 'FisheyeNoteShiftTextArea');
	this.inputArea.injectInside( this.frameBody );
	this.inputArea.setProperty('value', this.summaryText);
	this.inputArea.focus();
	
	this.inputArea.addEvent('mousedown', function() {
	   this.fireEvent('onFocus', this);
	}.bind(this));
    },

    buildInputArea : function()
    {
	//this.inputArea = new ShiftSpace.Element('textarea', {
	this.inputArea = new ShiftSpace.Element('textarea', {
	    'class' : 'FisheyeNoteShiftTextAreaSimple',
	    'rows' : 8,
	    'value' : this.summaryText
	});
	this.inputArea.focus(); // XXX: necessary?  harmful?
	this.inputArea.addEvent('mousedown', function() {
	   this.fireEvent('onFocus', this);
	}.bind(this));
    },

    getWebPage: function(url, callback, onerror) {
	this.log("getWebPage with url '" + url + "'");
	if (!onerror)
	  onerror = function() {};
        this.xmlhttpRequest({
            'method': 'GET',
            'url': url,
            'onload': callback,
	    'onerror': onerror
        });
    },
});

// ?? Register our Space class, passing the Shift class definition
// platform will need to instantiatiate and hook into us
//var Fisheye = new FisheyeSpace(FisheyeShift);



var FisheyeConsoleClass = new Class({

    registeredShifts: [],

    registerShift: function(shift) {

	this.registeredShifts[this.registeredShifts.length] = shift;

	if (this.registeredShifts.length == 1)
	    this.makeConsole();
	else
	    this.updateConsole();
    },

    updateConsole: function() {
	var byType = {};
	var byTypeCount = {};

	var container = this.consoleElement;
        container.setStyles({
            'font': '16px verdana, sans-serif',
	    border : 'medium double #C4C87C' ,
        });
	wrapSetHTML(container, "");

	var summaryBox = makeNoteBox(container);
	var content = "Fisheye summary:";
        summaryBox.setStyles({ 'font': '16px verdana, sans-serif', });
	wrapSetHTML(summaryBox, content);
	summaryBox.injectInside(container);

	for (var i=0; i < this.registeredShifts.length; i++) {
		var ashift = this.registeredShifts[i];
		byType[ashift.categoryType] = ashift;
		if (byTypeCount[ashift.categoryType])
			byTypeCount[ashift.categoryType]++;
		else
			byTypeCount[ashift.categoryType] = 1;
	}

	var sortedTypes = new Array();
	for (var key in byType) {
	    sortedTypes.push(key);
	}
	sortedTypes = sortedTypes.sort();
	
	for (var i=0; i < sortedTypes.length; i++) {
		var key = sortedTypes[i];
		var shiftBox = new ShiftSpace.Element('div');
		var ashift = byType[key];
		var cat = ashift.criticismCategoryGetName(ashift.categoryType);
		shiftBox.appendText(byTypeCount[key] + " " + cat);
		ashift.refreshStyle(shiftBox);
		shiftBox.injectInside(container);
	}
    },

    makeConsole: function() {
        this.consoleElement = new ShiftSpace.Element('div');

	this.consoleElement.addEvent('click', function(){
	    this.consoleElement.addClass('FisheyeHidden');
	}.bind (this));

	this.consoleElement.setStyles({
	  'position': 'absolute',
	  left : 0,
	  top : 0,
	  zIndex : 2
	});
	this.updateConsole();
        this.consoleElement.injectInside(document.body);
    },

});

var FisheyeConsole = new FisheyeConsoleClass();




// REFERENCE BELOW

/*           var xmlobject = http_request.responseXML;
	     var root = xmlobject.getElementsByTagName('rss')[0];
	     var channels = root.getElementsByTagName("channel");
	     var items = channels[0].getElementsByTagName("item");
	     var descriptions = items[0].getElementsByTagName("description");
	     var date = items[0].getElementsByTagName("pubDate");
*/

	/* some GET formatting code that might come in handy
        var url = server + 'shiftspace.php?method=' + method;
        for (var key in parameters) {
            url += '&' + key + '=' + encodeURIComponent(parameters[key]);
        }
        url += '&v=' + version;
        loadFile(url, callback);    
	*/

/*      var rightclick = false;
	if (!e) var e = window.event;
	if (e.which) rightclick = (e.which == 3);
	else if (e.button) rightclick = (e.button == 2);
	this.log('Rightclick: ' + rightclick); // true or false
*/


/*
TODO: allow edit ONLY IF YOU OWN IT

rename variables
replace members variables with local vars in fill/build funcs
disable save button until fields have been set
decorate URI field red until it has been set (others?)
httprequest is in thread?  loads seems slow with it
firefox keeps showing load indicator even after we'ver parsed data
initialize zIndex (done but doesn't seem to work)
don't overload criticismLink for newsTrust?
make undraggable when exiting edit mode
cancel should undo any unsaved position change
ref by range as well as position, plus text.  allow for smart decision later
finish cleanup of render funcs: isEdit, target
make [ignore] user work (once user logic is functional in 0.11)
signup/login placeholder logic?
plugin settings gui hooks?
generic per-shift and per-user data storage hooks for plugins?
edit/setup icons in header? buttonbar?
gui layout in separate HTML file

summary box resets when entering type and link on new shift - atleast put it last

in general, having both embedded icon and full flying interface is wierd
  - after relocting a shift not tied to text, placeholder still at old pos
  - embedded icon doesn't change color or style after changing type

manageElement on two elements?


how to show space settings without having a shift?
  example: there is one shift on page, author is in ignore list, impossible to edit ignore list

F is bold/not bold or different font between placeholder / opened

edit -> cancel -> mouseover no longer works?

layout of edit screen: summary box size & scrolling behaviour
 mouse out events from link rollover cause shift hide (hard to hit edit button)

*/


// XXX: ignore list: store original user name

// to start server:

// sudo /opt/local/bin/couchdb 
// cd ~/Sites/shiftspace; python shifty.py runserver
