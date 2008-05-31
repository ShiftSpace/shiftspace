
// Our Space class - refs to our code, icon, and css
var FisheyeSpace = ShiftSpace.Space.extend({
	attributes: {
		name: 'Fisheye',
		icon: 'Fisheye.png',
		css : 'Fisheye.css'
	}
});

// Get the latest plugins, languages, and layout from SVN
var feRoot="http://metatron.shiftspace.org/code/trunk/spaces/Fisheye/";

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
	imageBox.setHTML('<img src="' + imguri + '" />');
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
	var someBox = new ShiftSpace.Element('div', {'class':'FisheyeCategory'});
	var categoryText = that.criticismCategoryGetName (that.categoryType);

	if (isEdit) {
	    someBox.appendText("[ " + categoryText + " ]");
	    someBox.addEvent('click', that.changeCategory.bind(that));
	}
	else
	    someBox.appendText(categoryText);

	someBox.injectInside(container);
    },

    // Render the summary, the main text body of popup
    // in edit mode, render an entry box
    renderSummary: function(that) {
	if (that.mode == that.MODE_EDIT) {
	    // create an iframe with the css already loaded
	    that.summaryFrame = new ShiftSpace.Iframe({
	      'class' : 'FisheyeNoteShiftFrame',
	      scroll : 'no',
	      rows : 4,
	      cols : 25,
	      wrap : 'hard',
	      css : that.getParentSpace().attributes.css,
	      border : 'medium double #C4C87C' ,
	      onload : that.finishFrame.bind(that)
	    });
	    that.summaryFrame.injectInside(that.editBox);
	} else {
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
	aBox = new ShiftSpace.Element('div', {'class':'FisheyeDisplayItem'});
	aBox.setStyles({ 'font-weight': 'bold', });
	if (isEdit) {
	    aBox.appendText("  [" + that.criticismLink + "]");
	    aBox.addEvent('click', that.changeCriticismLink.bind(that));
	} else {
	    aLink = this.createLink (that.criticismLink, "[" + that.getText('read') + "]", aBox);
	}
	aBox.injectInside(criticismLinkBox);
    },

    renderSource: function(that, target) {
	var sb = makeDisplayItem();
	name = that.criticismSourceGetName (that.sourceCode);
	sb.appendText(that.getText('source') + ": " + name + " [" + that.getText('ignore') + "]");
	sb.addEvent('click', function(){
	    this.settings.hiddenSources[this.sourceCode] = true;
	    this.saveSettings();
	    this.rebuild();
	}.bind (that));
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
	ignore : "ignore",
	read : "Read",
	rangeWarning : "You need to select some page content first!",
	save : "Save",
	cancel : "Cancel",
	done : "Done",
	lockPos : "Lock Pos To Sel Text",
	defaultText : "This claim is false because...",
	language : "Language",
};

var displayLanguages = {
	'en' : displayTextEnglish,
};


var FisheyeShift = ShiftSpace.Shift.extend({

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
		makeButton(that.getText('lockPos'), di, this.onRange.bind(that));
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
		    that.settingsBox.setHTML(that.settingsLayout);
		    var listitems = that.settingsBox.getElementsByTagName("*");
		    for (i=0; i<listitems.length; i++) {
			el = listitems[i];
			if (el.hasAttribute('fisheyeText'))
			    el.firstChild.nodeValue = that.getText(el.getAttribute("fisheyeText"));
			else if (el.hasAttribute('fisheyeFunc'))
			    that[el.getAttribute("fisheyeFunc")](el);
			else if (el.hasAttribute('fisheyeUserName'))
			    el.firstChild.nodeValue = that.getUsername();
		    }
		} else {
		    that.settingsBox = makeNoteBox(container);
		    if (that.isProxy())
		        that.settingsBox.setHTML("Settings disabled in proxy mode");
		    else
		        that.settingsBox.setHTML("MISSING LAYOUT");
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
		that.helpBox.appendText("This is some help text"); // XXX
	    },
	  },
    },


    loadJavascripts	: function(path, dir, callback) {
	if (ShiftSpace.xmlhttpRequest === undefined)
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

    renderRange: function(reRange) {
	var oSpan = new ShiftSpace.Element('span');
	oSpan.style.color = "red";
	oSpan.style.display = "inline";
	oSpan.appendChild(document.createTextNode("F"));
	if (reRange.insertNode) {
	    reRange.insertNode(oSpan);
	    var pos = oSpan.getPosition();
	    this.element.setStyles({
	      'position': 'absolute',
	      left : pos.x,
	      top : pos.y,
	    });
	} else {
	    this.log("tried to render invalid range");
	}
    },


    loadStoredData: function(json) {

	// Load shift data from JSON
	this.haveSaved = json.haveSaved || 0;  // TODO: only on initial load?
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
	 Initialize - when a particular annotation is created or loaded
    */

    initialize: function(json) {
        this.parent(json);

	// Store initialize data in case we want to reload
	this.json = json;

	this.loadSettings();

	// XXX: how to handle default language?
	if (!this.settings.language)
	    this.settings.language = 'en';

	// Static data
	this.iconText = "F";

	this.loadStoredData(json);

	// The we sometimes need to access these modes directly in code
	this.MODE_DISPLAY = 0;
	this.MODE_EDIT = 1;
	this.mode = this.MODE_DISPLAY;

        this.build(json);

	this.rebuildLock();
	
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
	this.rebuildUnlock();

	this.getWebPage(feRoot + "layout/settings.html", function(response) {
		this.log("GOT SETTINGS LAYOUT '" + response.responseText + "'");
		this.settingsLayout = response.responseText;
	}.bind(this));

	if (!this.haveSaved)
	    this.setMode (this.MODE_EDIT);

	this.manageElement(this.element);
    },



    /*
	 Functions to fill and refresh parts of GUI
    */

    fillSubmitter: function(that) {
	// Submitter
	this.submitterBox = new ShiftSpace.Element('div', {
		'class' : 'FisheyeDisplayItem',
	});
        this.submitterBox.appendText(this.getText('submitter') + ": " + this.shiftAuthor());
	if (this.canIgnore()) {
	  this.submitterIgnore= new ShiftSpace.Element('div', {
		  'class' : 'FisheyeInlineActiveText',
	  });
	  this.submitterIgnore.appendText("[" + this.getText('ignore') + "]");
	  this.submitterIgnore.addEvent('click', function(){
	      this.settings.hiddenAuthors[this.shiftAuthor()] = true;
	      this.saveSettings();
	      this.rebuild();
	  }.bind (that));
	  this.submitterIgnore.injectInside(this.submitterBox);
	}
        this.submitterBox.injectInside(this.detailsBox);
    },

    refreshStyle: function() {
        this.element.setStyles({
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
	if (this.settings.hiddenAuthors[this.shiftAuthor()]) 
	    return;

	this.refreshStyle();

	// Render icon into top of element
	this.renderClass.renderIcon(this, container);

	// Display and edit modes are rendered in parallel,
	// relying on renderClass so that plugins (eg NewsTrust)
	// can accept and display special data
	if (this.mode == this.MODE_DISPLAY || this.mode == this.MODE_EDIT) {
	    var isEdit = (this.mode == this.MODE_EDIT) ? true : false;

	    if (isEdit) {
		this.editBox = makeNoteBox(container);
	    } else {
		this.detailsBox = makeNoteBox();
		if (this.mode != this.MODE_DISPLAY || !this.shown)
		    this.detailsBox.addClass('FisheyeHidden');
		this.detailsBox.injectInside(container);
	    }

	    var de = isEdit ? this.editBox : this.detailsBox;
	    this.renderClass.renderCategory(this, isEdit, de);
	    this.renderClass.renderSummary(this);
	    this.renderClass.renderLinkBox(this, isEdit, de);
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
		else if (key == this.MODE_EDIT && !this.canEdit()) {} 
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

    canEdit: function() {
	return this.loggedIn() && (this.getUsername() == this.shiftAuthor());
    },

    // Don't allow the user to ignore themself
    canIgnore: function() {
	return (this.shiftAuthor() != this.getUsername());
    },

    loggedIn : function() {
	return this.getUsername();
    },

    shiftAuthor : function() {
      return this.json.username;
    },

    // currently this is just used to hide settings as it seems
    // settings aren't saved in proxy mode XXX: true
    isProxy : function() {
        if (ShiftSpace.user === undefined) {
	  return true;
        }
	return false;
    },

    getUsername : function() {
        if (ShiftSpace.user === undefined) {
	  return null; // XXX ???
        }
	if (!ShiftSpace.user.getUsername()) {
	  return null; // XXX ???
	} else {
	  return ShiftSpace.user.getUsername();
	}
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
		var someBox = makeTextBox (container, key);
		someBox.addEvent('click', function(key){
		    this.settings.hiddenAuthors[key] = false;  // show source
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

	this.element.setStyles({
	  'position': 'absolute',
	  left : json.position.x,
	  top : json.position.y
	});

	if (json.posRef) {
	    this.posRef = json.posRef;
	    this.log("loaded posRef:");
	    //this.dumpObj (this.posRef);
	    this.posRange = ShiftSpace.RangeCoder.toRange (json.posRef);
	    if (this.posRange) {
		this.renderRange(this.posRange);
	    }
	}

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
	this.element.setHTML("");
	this.fillElement(this.element);
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
	if (ShiftSpace.getUser === undefined) return;
	user = ShiftSpace.getUser(); // returns User object
	user.setPref('settings', this.settings);
    },

    loadSettings: function() {
	if (!(ShiftSpace.getUser === undefined)) {
	  var user = ShiftSpace.getUser();
		// XXX: what is namespace?  do i need to prepend with my 
		// shift name to tokens?
          this.settings = user.getPref('settings');
	}
	if (!this.settings)
	    this.settings = {};
	if (!this.settings.hiddenCategories)
	    this.settings.hiddenCategories = {};
	if (!this.settings.hiddenSources)
	    this.settings.hiddenSources = {};
	if (!this.settings.hiddenAuthors)
	    this.settings.hiddenAuthors = {};
    },

    setCategory: function(idx) {
	this.categoryType = idx;
	this.renderClass = this.refreshRenderClass();
	this.rebuild();
    },

    changeCategory: function() {
    	var txt = "Enter category code:\n";
	for (var i in this.criticismCategories)
	    txt += "  " + i + "=" + this.criticismCategoryGetName(i) + ",\n";

	var msg = prompt(txt, this.categoryType);
	if (msg)
	    this.setCategory(msg);
    },

    changeCriticismLink: function() {
	var msg = prompt(this.renderClass.changeLinkPrompt, this.criticismLink);
	if (msg) {
	    this.criticismLink = msg;
	    this.sourceCode = this.criticismSourceFromLink(msg);
	    this.rebuild();
	}
    },

    setMode : function(newMode) {
	if (this.mode == newMode) return;

	if (newMode == this.MODE_EDIT && !this.loggedIn()) {
          ShiftSpace.Console.show();
          ShiftSpace.Console.showTab('login');
          alert('Sorry, you must be signed in to edit shifts.');
	  return;
        }

	if (newMode == this.MODE_EDIT && !this.canEdit()) {
          alert('Sorry, you cannot edit shift created by user ' + this.shiftAuthor());
	  return;
        }

	this.mode = newMode;
	this.rebuild();
	if (this.mode == this.MODE_EDIT)
	    this.element.makeDraggable();
    },


	// TODO: mootools has an event which doesn't fire on subelements...
	// we could use that, although we'd likely keep the timer logic
    onMouseIn : function( e )
    {
	// we don't want the event to continue
	var evt = new Event(e);
	evt.stopPropagation();

	// Raise this Shift a little bit so it draws over the minimized icons
	this.element.style.zIndex=2;
	this.shown = true;

	// Cancel any pending hide, then show
	this.hidePending = 0;

	// DISPLAY is the only mode that minimizes...
	if (this.mode == this.MODE_DISPLAY) {
	    this.detailsBox.removeClass('FisheyeHidden');
	    this.buttonBox.removeClass ('FisheyeHidden');
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
	      this.element.style.zIndex=1;  // Lower to default height
	      this.shown = false;
	  } 
      }.bind(this) ).delay(500);
    },

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

    getWebPage: function(url, callback, onerror) {
	if (!onerror)
	  onerror = function() {};
        ShiftSpace.xmlhttpRequest({
            'method': 'GET',
            'url': url,
            'onload': callback,
	    'onerror': onerror
        });
    },
});

// ?? Register our Space class, passing the Shift class definition
// platform will need to instantiatiate and hook into us
var Fisheye = new FisheyeSpace(FisheyeShift);



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

*/
