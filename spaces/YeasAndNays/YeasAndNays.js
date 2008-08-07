

var YeasAndNaysSpace = ShiftSpace.Space.extend({

    attributes: {
        name: 'YeasAndNays',
        title: 'YeasAndNays',
        icon: 'YeasAndNays.png',
        css: 'spaces/YeasAndNays/YeasAndNays.css'
    },
    
    setup: function()
    {
       console.log("YeasAndNays starting up.");
    },
    
   /*
 onShiftCreate: function(shiftId){
    	console.log ("creating YAN");
    	this.isNew = false;
    },
    
    onShiftShow: function(shiftId)
  	{
  		console.log("showing YAN");
  		
  		//console.log( ShiftSpace.User.getUsername() );
  		
  		// IS THIS A NEW SHIFT?
		if( this.isNewShift(shiftId) )
		{
		  	this.isNew = true;
		} 
		else // IF NEW CHECK SERVER FOR CALL mp3 status
		{
		   this.isNew = false;
		   // this.YN_getShiftStatus();
		   // this.YN_SwiffInsert();
		}
		
		this.shifts[shiftId].username == ShiftSpace.User.getUsername()
		
  	},
*/
  	
  	onShiftSave: function(){
  		console.log("saving YAN");
  	}
    
});


var YeasAndNaysVars = new Class({

	options: {
		zipcode: 000000
	},
	initialize: function (options){
		
		this.setOptions( options );
		
	}

});


var YeasAndNaysShift = ShiftSpace.Shift.extend({
	
	 setup: function(json) {
     	 console.log('setting up YAN shift');   
     
     	 this.swfObject = YeasAndNaysCreateSWF();
     	 console.log('========================================================');
     	 console.log(this.swfObject);
     	 
     	 this.parent(json);
		// this.callserver = 'http://localhost/~xn/shiftspace_external/';
		 this.callserver = 'http://208-122-30-160.lx-vs.net/YeasAndNays/secure/';
		 
		 this.YAN_space = this.getParentSpace();
		 
		 this.zipcode = 0;
        
         // build the DOM
   		 this.build(json);
    		
    	 // attach events
   		 this.attachEvents();
    
    	 // set the position of the shift to the mouse
   		 this.view_element.setStyles({
    		  left : json.position.x,
    		  top : json.position.y
   		 });
        
        this.manageElement(this.view_element);
        this.refresh();
        
    },
    
    
    build: function(json){
    
    	// create container element
    	this.yan_container = new ShiftSpace.Element( 'div', {
      		'class' : 'SSYeasAndNaysShift',
      		'id' : 'YAN_allContainer'
   		 });
   		 
   		this.yan_container.setStyles({
            'position': 'absolute',
            'left': json.position.x,
            'top': json.position.y
        });
    	this.yan_container.injectInside( document.body );
    	
    	this.buildHandle(); // build top handle onto container
    	
    	// create the view_element
    	this.view_element = new ShiftSpace.Element( 'div', {
      		'id' : 'YAN_main'
   		 });
   		 
   		this.view_element.injectInside( this.yan_container );
    	
    	// create the zip text field
		this.zipInput = new ShiftSpace.Element( 'input', {
		  type : 'text',
		  maxLength: '5',
		  size: '6',
		  value : 'Enter Zip',
		  'class' : 'SSYeasAndNaysShiftInput'
		});
		this.zipInput.focus();
		this.zipInput.injectInside( this.view_element );
    	
    	// create the zip submit button
		this.zipButton = new ShiftSpace.Element( 'input', {
		  type : 'button',
		  value : 'Go!',
		  'class' : 'SSYeasAndNaysShiftButton'
		});
		this.zipButton.injectInside( this.view_element );
		
		console.log("Inserting SWIFF");
		this.YN_SwiffInsert();

    },
    
    buildHandle : function()
  	{
		// create the handle area
		this.handleArea = new ShiftSpace.Element('div', {
		  'id': "SSYeasAndNaysHandleArea"
		});
		this.handle = new ShiftSpace.Element('div', {
		  'id': "SSYeasAndNaysHandle"
		});
		
		// build the window buttons
		this.windowButtons = new ShiftSpace.Element('div', {
		  'class': "SSYeasAndNaysWindowButtons"
		});
		this.closeButton = new ShiftSpace.Element('div', {
		  'class': 'YN_closeButton'
		});
		this.closeButton.injectInside(this.windowButtons);
		
		this.handle.injectInside(this.handleArea);
		this.windowButtons.injectInside(this.handleArea);
	
		this.handleArea.injectInside(this.yan_container);
		$('SSYeasAndNaysHandle').innerHTML = "YEAS & NAYS";
		
  	},
    
    focusInput: function (e){
    	//alert ( "in focusInput" );
    	this.zipInput.value = "";
    },
    
    attachEvents: function(e){
    
    	// setup close button
   		this.zipButton.addEvent('click', this.loadZip.bind(this));
    	
    	// setup form focus
    	this.zipInput.addEvent( 'focus', this.focusInput.bind(this) );
    		
    	// make the YAN widget draggable
		this.dragRef = this.yan_container.makeDraggable({ 
		  	handle : this.handleArea,
		  	onStart : function() {
				this.fireEvent('onDragStart');
		  	}.bind(this),
		  	onComplete : function() {
				this.fireEvent('onDragStop');
      		}.bind(this)
    	});
    	
    	// setup close button
   		this.closeButton.addEvent('click', this.cancel.bind(this));
    
    	// set up the mouse enter/leave events for hiding and reveal controls
    	this.yan_container.addEvent('mouseover', this.revealControls.bind(this) );
    	this.yan_container.addEvent('mouseout', this.hideControls.bind(this) );
    },
    
    onFocus: function(){
     	//this.YN_getShiftStatus();
     	// this.YN_SwiffInsert();
    },
    
    
    /*
    Function : YN_SwiffInsert
      Assign flashvars and embed flash .swf object
  	*/
    YN_SwiffInsert: function()
    {
    	// create the view_element
    	this.swiffContainer = new ShiftSpace.Element( 'div', {
      		'id' : 'YAN_swiff_' + this.getId()
   		 });
   		this.swiffContainer.setStyles({
            'padding':  '0px 0px 0px 0px',
            'height': '35px',
            'color': '#FFF',
            'background-color': '#F63B02',
            'left': 0,
            'top': 0
        });
        
        this.swiffContainer.injectInside( this.view_element );
   		
   		var flashvars = {
		  callerName: "Christian",
		  repName: "HelloRep",
		  play_width: 150,
		  play_height: 100,
		  file: encodeURIComponent( "http://208-122-30-160.lx-vs.net/YeasAndNays/yan_mp3/yan_1_10_27581a9725cb8259f06a6abd64959b0f.wav.mp3" )
		};
		var params = {};
		var attributes = { id:"myCom", name:"myCom" };

		
		console.log("EMBEDDING");
		
		var targetDiv = "YAN_swiff_"+this.getId();
   		this.swfObject.embedSWF("http://208-122-30-160.lx-vs.net/YeasAndNays/getheard/yan_player.swf", 
   								targetDiv, 250, 35, "9.0.115", "expressInstall.swf", flashvars, params, attributes );
		
		var swfObj = $("myCom");
		console.log (swfObj.type);
		
		// setTimeout( this.sendTextToFlashNow.bind(this), 3000 );
 
    },
    
    sendTextToFlashNow: function( ) {
		
		var swfObj = $("myCom");
		swfObj.sendTextToFlash( "send this to flash" );
		
	},
	
 	
 	/*
    Function : urlLoad
      makes an xmlhttpRequest from a given url and post vars, also allows a callback function
  	*/
 	urlLoad: function( url, data, fn )
 	{
 	
 		var gm_ajax = this.xmlhttpRequest({
    	
			method: 'POST',
			url: url, 
			headers: {
				'Content-type': 'application/x-www-form-urlencoded'
			},
			data: data,
			onload: fn.bind(this)
			
		});
 	
 	},
    
    loadZip: function()
    {
    	this.zipcode = this.zipInput.value;
    	this.yan_status = "zip";
    	this.phone1 = 0;
    	this.phone2 = 0;
    	this.phone3 = 0;
    	this.representative = "";
    	this.save();
    	var data = "zipcode=" + this.zipInput.value + "&shift=" + this.getId();
    	
    	var URL = this.callserver+'step1_zip.php';
    	this.urlLoad( URL, data, this.loadRepChooser );
    
    },
    
    loadRepChooser: function(response)
    {
          
    	$('YAN_main').innerHTML = "";
    	this.view_element = $('YAN_main');
    	
    	var reps = Json.evaluate( response.responseText, true );
    	
    	// create the representative select box
    	this.repCall_select = new ShiftSpace.Element( 'select', {
      		'class' : 'SSYeasAndNaysSelect',
      		'id' : 'YAN_Select'
   		 });
        
        for ( var i=0; i < reps.length; i++){
        	
        	this.rep_option = new ShiftSpace.Element( 'option', 
        		{
      			'class' : 'SSYeasAndNaysOption',
      			'id' : 'YAN_Option' + i,
      			'value': reps[i].optionValue
   		 		});
   		 	this.rep_option.injectInside( this.repCall_select );
        	this.rep_option.innerHTML = reps[i].optionText;
        	
        }
    	
    	this.repCall_select.injectInside( this.view_element );  
    	  
        this.phone1 = new ShiftSpace.Element( 'input', {
        	type: 'text',
        	maxlength: '3',
        	size: '2',
        	id: 'phone1',
        	'class' : 'SSYeasAndNaysShiftInput'
        });
        this.phone2 = new ShiftSpace.Element( 'input', {
        	type: 'text',
        	maxlength: '3',
        	size: '2',
        	id: 'phone2',
        	'class' : 'SSYeasAndNaysShiftInput'
        });
        this.phone3 = new ShiftSpace.Element( 'input', {
        	type: 'text',
        	maxlength: '4',
        	size: '3',
        	id: 'phone3',
        	'class' : 'SSYeasAndNaysShiftInput'
        });
    	
    	// create the rep choice submit button
		this.repChoiceButton = new ShiftSpace.Element( 'input', {
		  type : 'button',
		  value : 'Enter',
		  'class' : 'SSYeasAndNaysShiftButton'
		});
		
		this.phone1.injectInside( this.view_element );
		this.phone2.injectInside( this.view_element );
		this.phone3.injectInside( this.view_element );
		this.repChoiceButton.injectInside( this.view_element );  
		this.repChoiceButton.addEvent('click', this.submitRepChoice.bind(this) );
		
    },
    
    submitRepChoice: function()
    {
    	
    	this.phone1 = this.phone1.value;
    	this.phone2 = this.phone2.value;
    	this.phone3 = this.phone3.value;
    	this.repToCall = this.repCall_select.value;
    	var ph_data = "ph1=" + this.phone1 
    				+ "&ph2=" + this.phone2 
    				+ "&ph3=" + this.phone3
    				+ "&repId=" + this.repToCall
    				+ "&shift=" + this.getId();
    			
    	var URL = this.callserver+'step2_phoneAndRep.php'
    	this.urlLoad( URL, ph_data, this.verifyRepChoiceAndPhone );
    	
    },
    
    verifyRepChoiceAndPhone: function( response )
    {
    
    	$('YAN_main').innerHTML = response.responseText;
    	
    	// create the zip submit button
		this.verifyRepButton = new ShiftSpace.Element( 'input', {
		  type : 'button',
		  value : 'Make the call',
		  'class' : 'SSYeasAndNaysShiftButton'
		});
		this.verifyRepButton.injectInside( this.view_element );
   		this.verifyRepButton.addEvent('click', this.makeCall.bind(this));
    
    },
    
    makeCall: function(){
    
    	var dial = "dial=" + this.phone1 + this.phone2 + this.phone3 
    			   + "&repId=" + this.repToCall
    			   + "&shift=" + this.getId();
    			   			
    	this.callserver="";
    	this.urlLoad( 'http://208-122-30-160.lx-vs.net/gencall.php', dial, this.showDialing );
    
    },
    
    showDialing: function(){
    
    },
    
    encode: function (){
    	
    	var pos = this.yan_container.getPosition();
    	return{
    		status: this.yan_status,
    		zipcode: this.zipcode,
    		phone: this.phone1,
    		phone2: this.phone2,
    		phone3: this.phone3,
    		representative: this.representative,
    		position: pos
    	};
    
    },
    
     /*
		Function : handleMouseEnter
		  Reveal the Note controls.
	  */
	  revealControls : function( e )
	  {
		// we don't want the event to continue
		var evt = new Event(e);
		evt.stopPropagation();
		
		
		this.closeButton.removeClass('SSYeasAndNaysHidden');
		this.handleArea.removeClass('SSYeasAndNaysHidden');
		//this.resizeControl.removeClass('SSHidden');
	  },
	  
	  
	  /*
		Function : handleMouseLeave
		  Hide the Note controls.
	  */
	  hideControls : function( e )
	  {
		// we don't want the event to continue
		var evt = new Event(e);
		evt.stopPropagation();
	
		this.closeButton.addClass('SSYeasAndNaysHidden');
		this.handleArea.addClass('SSYeasAndNaysHidden');
		//this.resizeControl.addClass('SSHidden');
	  },

    /*
    Function : cancel
      Handle user cancel operation.
	*/
	cancel : function()
	{
		this.hide();
		this.destroy();
	}
    
});

var YeasAndNays = new YeasAndNaysSpace(YeasAndNaysShift);





/*! SWFObject v2.1 <http://code.google.com/p/swfobject/>
	Copyright (c) 2007-2008 Geoff Stearns, Michael Williams, and Bobby van der Sluis
	This software is released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
*/
var YeasAndNaysCreateSWF = function(){
 return function() {
	
	var UNDEF = "undefined",
		OBJECT = "object",
		SHOCKWAVE_FLASH = "Shockwave Flash",
		SHOCKWAVE_FLASH_AX = "ShockwaveFlash.ShockwaveFlash",
		FLASH_MIME_TYPE = "application/x-shockwave-flash",
		EXPRESS_INSTALL_ID = "SWFObjectExprInst",
		
		win = window,
		doc = document,
		nav = navigator,
		
		domLoadFnArr = [],
		regObjArr = [],
		objIdArr = [],
		listenersArr = [],
		script,
		timer = null,
		storedAltContent = null,
		storedAltContentId = null,
		isDomLoaded = false,
		isExpressInstallActive = false;
	
	/* Centralized function for browser feature detection
		- Proprietary feature detection (conditional compiling) is used to detect Internet Explorer's features
		- User agent string detection is only used when no alternative is possible
		- Is executed directly for optimal performance
	*/	
	var ua = function() {
		var w3cdom = typeof doc.getElementById != UNDEF && typeof doc.getElementsByTagName != UNDEF && typeof doc.createElement != UNDEF,
			playerVersion = [0,0,0],
			d = null;
		if (typeof nav.plugins != UNDEF && typeof nav.plugins[SHOCKWAVE_FLASH] == OBJECT) {
			d = nav.plugins[SHOCKWAVE_FLASH].description;
			if (d && !(typeof nav.mimeTypes != UNDEF && nav.mimeTypes[FLASH_MIME_TYPE] && !nav.mimeTypes[FLASH_MIME_TYPE].enabledPlugin)) { // navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin indicates whether plug-ins are enabled or disabled in Safari 3+
				d = d.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
				playerVersion[0] = parseInt(d.replace(/^(.*)\..*$/, "$1"), 10);
				playerVersion[1] = parseInt(d.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
				playerVersion[2] = /r/.test(d) ? parseInt(d.replace(/^.*r(.*)$/, "$1"), 10) : 0;
			}
		}
		else if (typeof win.ActiveXObject != UNDEF) {
			var a = null, fp6Crash = false;
			try {
				a = new ActiveXObject(SHOCKWAVE_FLASH_AX + ".7");
			}
			catch(e) {
				try { 
					a = new ActiveXObject(SHOCKWAVE_FLASH_AX + ".6");
					playerVersion = [6,0,21];
					a.AllowScriptAccess = "always";	 // Introduced in fp6.0.47
				}
				catch(e) {
					if (playerVersion[0] == 6) {
						fp6Crash = true;
					}
				}
				if (!fp6Crash) {
					try {
						a = new ActiveXObject(SHOCKWAVE_FLASH_AX);
					}
					catch(e) {}
				}
			}
			if (!fp6Crash && a) { // a will return null when ActiveX is disabled
				try {
					d = a.GetVariable("$version");	// Will crash fp6.0.21/23/29
					if (d) {
						d = d.split(" ")[1].split(",");
						playerVersion = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
					}
				}
				catch(e) {}
			}
		}
		var u = nav.userAgent.toLowerCase(),
			p = nav.platform.toLowerCase(),
			webkit = /webkit/.test(u) ? parseFloat(u.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false, // returns either the webkit version or false if not webkit
			ie = false,
			windows = p ? /win/.test(p) : /win/.test(u),
			mac = p ? /mac/.test(p) : /mac/.test(u);
		/*@cc_on
			ie = true;
			@if (@_win32)
				windows = true;
			@elif (@_mac)
				mac = true;
			@end
		@*/
		return { w3cdom:w3cdom, pv:playerVersion, webkit:webkit, ie:ie, win:windows, mac:mac };
	}();

	/* Cross-browser onDomLoad
		- Based on Dean Edwards' solution: http://dean.edwards.name/weblog/2006/06/again/
		- Will fire an event as soon as the DOM of a page is loaded (supported by Gecko based browsers - like Firefox -, IE, Opera9+, Safari)
	*/ 
	var onDomLoad = function() {
		if (!ua.w3cdom) {
			return;
		}
		main();
		if (ua.ie && ua.win) {
			try {	 // Avoid a possible Operation Aborted error
				doc.write("<scr" + "ipt id=__ie_ondomload defer=true src=//:></scr" + "ipt>"); // String is split into pieces to avoid Norton AV to add code that can cause errors 
				script = getElementById("__ie_ondomload");
				if (script) {
					addListener(script, "onreadystatechange", checkReadyState);
				}
			}
			catch(e) {}
		}
		if (ua.webkit && typeof doc.readyState != UNDEF) {
			timer = setInterval(function() { if (/loaded|complete/.test(doc.readyState)) { callDomLoadFunctions(); }}, 10);
		}
		if (typeof doc.addEventListener != UNDEF) {
			doc.addEventListener("DOMContentLoaded", callDomLoadFunctions, null);
		}
		addLoadEvent(callDomLoadFunctions);
	}();
	
	function checkReadyState() {
		if (script.readyState == "complete") {
			script.parentNode.removeChild(script);
			callDomLoadFunctions();
		}
	}
	
	function callDomLoadFunctions() {
		if (isDomLoaded) {
			return;
		}
		if (ua.ie && ua.win) { // Test if we can really add elements to the DOM; we don't want to fire it too early
			var s = createElement("span");
			try { // Avoid a possible Operation Aborted error
				var t = doc.getElementsByTagName("body")[0].appendChild(s);
				t.parentNode.removeChild(t);
			}
			catch (e) {
				return;
			}
		}
		isDomLoaded = true;
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
		var dl = domLoadFnArr.length;
		for (var i = 0; i < dl; i++) {
			domLoadFnArr[i]();
		}
	}
	
	function addDomLoadEvent(fn) {
		if (isDomLoaded) {
			fn();
		}
		else { 
			domLoadFnArr[domLoadFnArr.length] = fn; // Array.push() is only available in IE5.5+
		}
	}
	
	/* Cross-browser onload
		- Based on James Edwards' solution: http://brothercake.com/site/resources/scripts/onload/
		- Will fire an event as soon as a web page including all of its assets are loaded 
	 */
	function addLoadEvent(fn) {
		if (typeof win.addEventListener != UNDEF) {
			win.addEventListener("load", fn, false);
		}
		else if (typeof doc.addEventListener != UNDEF) {
			doc.addEventListener("load", fn, false);
		}
		else if (typeof win.attachEvent != UNDEF) {
			addListener(win, "onload", fn);
		}
		else if (typeof win.onload == "function") {
			var fnOld = win.onload;
			win.onload = function() {
				fnOld();
				fn();
			};
		}
		else {
			win.onload = fn;
		}
	}
	
	/* Main function
		- Will preferably execute onDomLoad, otherwise onload (as a fallback)
	*/
	function main() { // Static publishing only
		var rl = regObjArr.length;
		for (var i = 0; i < rl; i++) { // For each registered object element
			var id = regObjArr[i].id;
			if (ua.pv[0] > 0) {
				var obj = getElementById(id);
				if (obj) {
					regObjArr[i].width = obj.getAttribute("width") ? obj.getAttribute("width") : "0";
					regObjArr[i].height = obj.getAttribute("height") ? obj.getAttribute("height") : "0";
					if (hasPlayerVersion(regObjArr[i].swfVersion)) { // Flash plug-in version >= Flash content version: Houston, we have a match!
						if (ua.webkit && ua.webkit < 312) { // Older webkit engines ignore the object element's nested param elements
							fixParams(obj);
						}
						setVisibility(id, true);
					}
					else if (regObjArr[i].expressInstall && !isExpressInstallActive && hasPlayerVersion("6.0.65") && (ua.win || ua.mac)) { // Show the Adobe Express Install dialog if set by the web page author and if supported (fp6.0.65+ on Win/Mac OS only)
						showExpressInstall(regObjArr[i]);
					}
					else { // Flash plug-in and Flash content version mismatch: display alternative content instead of Flash content
						displayAltContent(obj);
					}
				}
			}
			else {	// If no fp is installed, we let the object element do its job (show alternative content)
				setVisibility(id, true);
			}
		}
	}
	
	/* Fix nested param elements, which are ignored by older webkit engines
		- This includes Safari up to and including version 1.2.2 on Mac OS 10.3
		- Fall back to the proprietary embed element
	*/
	function fixParams(obj) {
		var nestedObj = obj.getElementsByTagName(OBJECT)[0];
		if (nestedObj) {
			var e = createElement("embed"), a = nestedObj.attributes;
			if (a) {
				var al = a.length;
				for (var i = 0; i < al; i++) {
					if (a[i].nodeName == "DATA") {
						e.setAttribute("src", a[i].nodeValue);
					}
					else {
						e.setAttribute(a[i].nodeName, a[i].nodeValue);
					}
				}
			}
			var c = nestedObj.childNodes;
			if (c) {
				var cl = c.length;
				for (var j = 0; j < cl; j++) {
					if (c[j].nodeType == 1 && c[j].nodeName == "PARAM") {
						e.setAttribute(c[j].getAttribute("name"), c[j].getAttribute("value"));
					}
				}
			}
			obj.parentNode.replaceChild(e, obj);
		}
	}
	
	/* Show the Adobe Express Install dialog
		- Reference: http://www.adobe.com/cfusion/knowledgebase/index.cfm?id=6a253b75
	*/
	function showExpressInstall(regObj) {
		isExpressInstallActive = true;
		var obj = getElementById(regObj.id);
		if (obj) {
			if (regObj.altContentId) {
				var ac = getElementById(regObj.altContentId);
				if (ac) {
					storedAltContent = ac;
					storedAltContentId = regObj.altContentId;
				}
			}
			else {
				storedAltContent = abstractAltContent(obj);
			}
			if (!(/%$/.test(regObj.width)) && parseInt(regObj.width, 10) < 310) {
				regObj.width = "310";
			}
			if (!(/%$/.test(regObj.height)) && parseInt(regObj.height, 10) < 137) {
				regObj.height = "137";
			}
			doc.title = doc.title.slice(0, 47) + " - Flash Player Installation";
			var pt = ua.ie && ua.win ? "ActiveX" : "PlugIn",
				dt = doc.title,
				fv = "MMredirectURL=" + win.location + "&MMplayerType=" + pt + "&MMdoctitle=" + dt,
				replaceId = regObj.id;
			// For IE when a SWF is loading (AND: not available in cache) wait for the onload event to fire to remove the original object element
			// In IE you cannot properly cancel a loading SWF file without breaking browser load references, also obj.onreadystatechange doesn't work
			if (ua.ie && ua.win && obj.readyState != 4) {
				var newObj = createElement("div");
				replaceId += "SWFObjectNew";
				newObj.setAttribute("id", replaceId);
				obj.parentNode.insertBefore(newObj, obj); // Insert placeholder div that will be replaced by the object element that loads expressinstall.swf
				obj.style.display = "none";
				var fn = function() {
					obj.parentNode.removeChild(obj);
				};
				addListener(win, "onload", fn);
			}
			createSWF({ data:regObj.expressInstall, id:EXPRESS_INSTALL_ID, width:regObj.width, height:regObj.height }, { flashvars:fv }, replaceId);
		}
	}
	
	/* Functions to abstract and display alternative content
	*/
	function displayAltContent(obj) {
		if (ua.ie && ua.win && obj.readyState != 4) {
			// For IE when a SWF is loading (AND: not available in cache) wait for the onload event to fire to remove the original object element
			// In IE you cannot properly cancel a loading SWF file without breaking browser load references, also obj.onreadystatechange doesn't work
			var el = createElement("div");
			obj.parentNode.insertBefore(el, obj); // Insert placeholder div that will be replaced by the alternative content
			el.parentNode.replaceChild(abstractAltContent(obj), el);
			obj.style.display = "none";
			var fn = function() {
				obj.parentNode.removeChild(obj);
			};
			addListener(win, "onload", fn);
		}
		else {
			obj.parentNode.replaceChild(abstractAltContent(obj), obj);
		}
	} 

	function abstractAltContent(obj) {
		var ac = createElement("div");
		if (ua.win && ua.ie) {
			ac.innerHTML = obj.innerHTML;
		}
		else {
			var nestedObj = obj.getElementsByTagName(OBJECT)[0];
			if (nestedObj) {
				var c = nestedObj.childNodes;
				if (c) {
					var cl = c.length;
					for (var i = 0; i < cl; i++) {
						if (!(c[i].nodeType == 1 && c[i].nodeName == "PARAM") && !(c[i].nodeType == 8)) {
							ac.appendChild(c[i].cloneNode(true));
						}
					}
				}
			}
		}
		return ac;
	}
	
	/* Cross-browser dynamic SWF creation
	*/
	function createSWF(attObj, parObj, id) {
		var r, el = getElementById(id);
		if (el) {
			if (typeof attObj.id == UNDEF) { // if no 'id' is defined for the object element, it will inherit the 'id' from the alternative content
				attObj.id = id;
			}
			if (ua.ie && ua.win) { // IE, the object element and W3C DOM methods do not combine: fall back to outerHTML
				var att = "";
				for (var i in attObj) {
					if (attObj[i] != Object.prototype[i]) { // Filter out prototype additions from other potential libraries, like Object.prototype.toJSONString = function() {}
						if (i.toLowerCase() == "data") {
							parObj.movie = attObj[i];
						}
						else if (i.toLowerCase() == "styleclass") { // 'class' is an ECMA4 reserved keyword
							att += ' class="' + attObj[i] + '"';
						}
						else if (i.toLowerCase() != "classid") {
							att += ' ' + i + '="' + attObj[i] + '"';
						}
					}
				}
				var par = "";
				for (var j in parObj) {
					if (parObj[j] != Object.prototype[j]) { // Filter out prototype additions from other potential libraries
						par += '<param name="' + j + '" value="' + parObj[j] + '" />';
					}
				}
				el.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + att + '>' + par + '</object>';
				objIdArr[objIdArr.length] = attObj.id; // Stored to fix object 'leaks' on unload (dynamic publishing only)
				r = getElementById(attObj.id);	
			}
			else if (ua.webkit && ua.webkit < 312) { // Older webkit engines ignore the object element's nested param elements: fall back to the proprietary embed element
				var e = createElement("embed");
				e.setAttribute("type", FLASH_MIME_TYPE);
				for (var k in attObj) {
					if (attObj[k] != Object.prototype[k]) { // Filter out prototype additions from other potential libraries
						if (k.toLowerCase() == "data") {
							e.setAttribute("src", attObj[k]);
						}
						else if (k.toLowerCase() == "styleclass") { // 'class' is an ECMA4 reserved keyword
							e.setAttribute("class", attObj[k]);
						}
						else if (k.toLowerCase() != "classid") { // Filter out IE specific attribute
							e.setAttribute(k, attObj[k]);
						}
					}
				}
				for (var l in parObj) {
					if (parObj[l] != Object.prototype[l]) { // Filter out prototype additions from other potential libraries
						if (l.toLowerCase() != "movie") { // Filter out IE specific param element
							e.setAttribute(l, parObj[l]);
						}
					}
				}
				el.parentNode.replaceChild(e, el);
				r = e;
			}
			else { // Well-behaving browsers
				var o = createElement(OBJECT);
				o.setAttribute("type", FLASH_MIME_TYPE);
				for (var m in attObj) {
					if (attObj[m] != Object.prototype[m]) { // Filter out prototype additions from other potential libraries
						if (m.toLowerCase() == "styleclass") { // 'class' is an ECMA4 reserved keyword
							o.setAttribute("class", attObj[m]);
						}
						else if (m.toLowerCase() != "classid") { // Filter out IE specific attribute
							o.setAttribute(m, attObj[m]);
						}
					}
				}
				for (var n in parObj) {
					if (parObj[n] != Object.prototype[n] && n.toLowerCase() != "movie") { // Filter out prototype additions from other potential libraries and IE specific param element
						createObjParam(o, n, parObj[n]);
					}
				}
				el.parentNode.replaceChild(o, el);
				r = o;
			}
		}
		return r;
	}
	
	function createObjParam(el, pName, pValue) {
		var p = createElement("param");
		p.setAttribute("name", pName);	
		p.setAttribute("value", pValue);
		el.appendChild(p);
	}
	
	/* Cross-browser SWF removal
		- Especially needed to safely and completely remove a SWF in Internet Explorer
	*/
	function removeSWF(id) {
		var obj = getElementById(id);
		if (obj && (obj.nodeName == "OBJECT" || obj.nodeName == "EMBED")) {
			if (ua.ie && ua.win) {
				if (obj.readyState == 4) {
					removeObjectInIE(id);
				}
				else {
					win.attachEvent("onload", function() {
						removeObjectInIE(id);
					});
				}
			}
			else {
				obj.parentNode.removeChild(obj);
			}
		}
	}
	
	function removeObjectInIE(id) {
		var obj = getElementById(id);
		if (obj) {
			for (var i in obj) {
				if (typeof obj[i] == "function") {
					obj[i] = null;
				}
			}
			obj.parentNode.removeChild(obj);
		}
	}
	
	/* Functions to optimize JavaScript compression
	*/
	function getElementById(id) {
		var el = null;
		try {
			el = doc.getElementById(id);
		}
		catch (e) {}
		return el;
	}
	
	function createElement(el) {
		return doc.createElement(el);
	}
	
	/* Updated attachEvent function for Internet Explorer
		- Stores attachEvent information in an Array, so on unload the detachEvent functions can be called to avoid memory leaks
	*/	
	function addListener(target, eventType, fn) {
		target.attachEvent(eventType, fn);
		listenersArr[listenersArr.length] = [target, eventType, fn];
	}
	
	/* Flash Player and SWF content version matching
	*/
	function hasPlayerVersion(rv) {
		var pv = ua.pv, v = rv.split(".");
		v[0] = parseInt(v[0], 10);
		v[1] = parseInt(v[1], 10) || 0; // supports short notation, e.g. "9" instead of "9.0.0"
		v[2] = parseInt(v[2], 10) || 0;
		return (pv[0] > v[0] || (pv[0] == v[0] && pv[1] > v[1]) || (pv[0] == v[0] && pv[1] == v[1] && pv[2] >= v[2])) ? true : false;
	}
	
	/* Cross-browser dynamic CSS creation
		- Based on Bobby van der Sluis' solution: http://www.bobbyvandersluis.com/articles/dynamicCSS.php
	*/	
	function createCSS(sel, decl) {
		if (ua.ie && ua.mac) {
			return;
		}
		var h = doc.getElementsByTagName("head")[0], s = createElement("style");
		s.setAttribute("type", "text/css");
		s.setAttribute("media", "screen");
		if (!(ua.ie && ua.win) && typeof doc.createTextNode != UNDEF) {
			s.appendChild(doc.createTextNode(sel + " {" + decl + "}"));
		}
		h.appendChild(s);
		if (ua.ie && ua.win && typeof doc.styleSheets != UNDEF && doc.styleSheets.length > 0) {
			var ls = doc.styleSheets[doc.styleSheets.length - 1];
			if (typeof ls.addRule == OBJECT) {
				ls.addRule(sel, decl);
			}
		}
	}
	
	function setVisibility(id, isVisible) {
		var v = isVisible ? "visible" : "hidden";
		if (isDomLoaded && getElementById(id)) {
			getElementById(id).style.visibility = v;
		}
		else {
			createCSS("#" + id, "visibility:" + v);
		}
	}

	/* Filter to avoid XSS attacks 
	*/
	function urlEncodeIfNecessary(s) {
		var regex = /[\\\"<>\.;]/;
		var hasBadChars = regex.exec(s) != null;
		return hasBadChars ? encodeURIComponent(s) : s;
	}
	
	/* Release memory to avoid memory leaks caused by closures, fix hanging audio/video threads and force open sockets/NetConnections to disconnect (Internet Explorer only)
	*/
	var cleanup = function() {
		if (ua.ie && ua.win) {
			window.attachEvent("onunload", function() {
				// remove listeners to avoid memory leaks
				var ll = listenersArr.length;
				for (var i = 0; i < ll; i++) {
					listenersArr[i][0].detachEvent(listenersArr[i][1], listenersArr[i][2]);
				}
				// cleanup dynamically embedded objects to fix audio/video threads and force open sockets and NetConnections to disconnect
				var il = objIdArr.length;
				for (var j = 0; j < il; j++) {
					removeSWF(objIdArr[j]);
				}
				// cleanup library's main closures to avoid memory leaks
				for (var k in ua) {
					ua[k] = null;
				}
				ua = null;
				for (var l in swfobject) {
					swfobject[l] = null;
				}
				swfobject = null;
			});
		}
	}();
	
	
	return {
		/* Public API
			- Reference: http://code.google.com/p/swfobject/wiki/SWFObject_2_0_documentation
		*/ 
		registerObject: function(objectIdStr, swfVersionStr, xiSwfUrlStr) {
			if (!ua.w3cdom || !objectIdStr || !swfVersionStr) {
				return;
			}
			var regObj = {};
			regObj.id = objectIdStr;
			regObj.swfVersion = swfVersionStr;
			regObj.expressInstall = xiSwfUrlStr ? xiSwfUrlStr : false;
			regObjArr[regObjArr.length] = regObj;
			setVisibility(objectIdStr, false);
		},
		
		getObjectById: function(objectIdStr) {
			var r = null;
			if (ua.w3cdom) {
				var o = getElementById(objectIdStr);
				if (o) {
					var n = o.getElementsByTagName(OBJECT)[0];
					if (!n || (n && typeof o.SetVariable != UNDEF)) {
							r = o;
					}
					else if (typeof n.SetVariable != UNDEF) {
						r = n;
					}
				}
			}
			return r;
		},
		
		embedSWF: function(swfUrlStr, replaceElemIdStr, widthStr, heightStr, swfVersionStr, xiSwfUrlStr, flashvarsObj, parObj, attObj) {
			
			console.log( "IN swfObject >>>> EMBEDSWF" );
			if (!ua.w3cdom){
				console.log("w3cdom false");
			}
			if (!swfUrlStr){
				console.log("swfUrlStr false");
			}
			if (!replaceElemIdStr){
				console.log("replaceElemIdStr false");
			}
			if (!widthStr){
				console.log("widthStr false");
			}
			if (!heightStr){
				console.log("heightStr false");
			}
			if (!swfVersionStr){
				console.log("swfVersionStr false");
			}
			
			
			
			if (!ua.w3cdom || !swfUrlStr || !replaceElemIdStr || !widthStr || !heightStr || !swfVersionStr) {
				return;
			}
			widthStr += ""; // Auto-convert to string
			heightStr += "";
			if (hasPlayerVersion(swfVersionStr)) {
				setVisibility(replaceElemIdStr, false);
				var att = {};
				if (attObj && typeof attObj === OBJECT) {
					for (var i in attObj) {
						if (attObj[i] != Object.prototype[i]) { // Filter out prototype additions from other potential libraries
							att[i] = attObj[i];
						}
					}
				}
				att.data = swfUrlStr;
				att.width = widthStr;
				att.height = heightStr;
				var par = {}; 
				if (parObj && typeof parObj === OBJECT) {
					for (var j in parObj) {
						if (parObj[j] != Object.prototype[j]) { // Filter out prototype additions from other potential libraries
							par[j] = parObj[j];
						}
					}
				}
				if (flashvarsObj && typeof flashvarsObj === OBJECT) {
					for (var k in flashvarsObj) {
						if (flashvarsObj[k] != Object.prototype[k]) { // Filter out prototype additions from other potential libraries
							if (typeof par.flashvars != UNDEF) {
								par.flashvars += "&" + k + "=" + flashvarsObj[k];
							}
							else {
								par.flashvars = k + "=" + flashvarsObj[k];
							}
						}
					}
				}
				
				createSWF(att, par, replaceElemIdStr);
				if (att.id == replaceElemIdStr) {
					setVisibility(replaceElemIdStr, true);
				}
				
			}
			else if (xiSwfUrlStr && !isExpressInstallActive && hasPlayerVersion("6.0.65") && (ua.win || ua.mac)) {
				isExpressInstallActive = true; // deferred execution
				setVisibility(replaceElemIdStr, false);
				
					var regObj = {};
					regObj.id = regObj.altContentId = replaceElemIdStr;
					regObj.width = widthStr;
					regObj.height = heightStr;
					regObj.expressInstall = xiSwfUrlStr;
					showExpressInstall(regObj);
				
			}
			
			console.log( "exiting EMBEDSWF>>>>>" );
		},
		
		getFlashPlayerVersion: function() {
			return { major:ua.pv[0], minor:ua.pv[1], release:ua.pv[2] };
		},
		
		hasFlashPlayerVersion: hasPlayerVersion,
		
		createSWF: function(attObj, parObj, replaceElemIdStr) {
			if (ua.w3cdom) {
				return createSWF(attObj, parObj, replaceElemIdStr);
			}
			else {
				return undefined;
			}
		},
		
		removeSWF: function(objElemIdStr) {
			if (ua.w3cdom) {
				removeSWF(objElemIdStr);
			}
		},
		
		createCSS: function(sel, decl) {
			if (ua.w3cdom) {
				createCSS(sel, decl);
			}
		},
		
		addDomLoadEvent: addDomLoadEvent,
		
		addLoadEvent: addLoadEvent,
		
		getQueryParamValue: function(param) {
			var q = doc.location.search || doc.location.hash;
			if (param == null) {
				return urlEncodeIfNecessary(q);
			}
			if (q) {
				var pairs = q.substring(1).split("&");
				for (var i = 0; i < pairs.length; i++) {
					if (pairs[i].substring(0, pairs[i].indexOf("=")) == param) {
						return urlEncodeIfNecessary(pairs[i].substring((pairs[i].indexOf("=") + 1)));
					}
				}
			}
			return "";
		},
		
		// For internal usage only
		expressInstallCallback: function() {
			if (isExpressInstallActive && storedAltContent) {
				var obj = getElementById(EXPRESS_INSTALL_ID);
				if (obj) {
					obj.parentNode.replaceChild(storedAltContent, obj);
					if (storedAltContentId) {
						setVisibility(storedAltContentId, true);
						if (ua.ie && ua.win) {
							storedAltContent.style.display = "block";
						}
					}
					storedAltContent = null;
					storedAltContentId = null;
					isExpressInstallActive = false;
				}
			} 
		}
	};
 }();
};