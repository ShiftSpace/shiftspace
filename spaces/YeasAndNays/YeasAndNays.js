/*	SWFObject v2.0 <http://code.google.com/p/swfobject/>
	Copyright (c) 2007 Geoff Stearns, Michael Williams, and Bobby van der Sluis
	This software is released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
*/
var swfobject=function(){var Z="undefined",P="object",B="Shockwave Flash",h="ShockwaveFlash.ShockwaveFlash",W="application/x-shockwave-flash",K="SWFObjectExprInst",G=window,g=document,N=navigator,f=[],H=[],Q=null,L=null,T=null,S=false,C=false;var a=function(){var l=typeof g.getElementById!=Z&&typeof g.getElementsByTagName!=Z&&typeof g.createElement!=Z&&typeof g.appendChild!=Z&&typeof g.replaceChild!=Z&&typeof g.removeChild!=Z&&typeof g.cloneNode!=Z,t=[0,0,0],n=null;if(typeof N.plugins!=Z&&typeof N.plugins[B]==P){n=N.plugins[B].description;if(n){n=n.replace(/^.*\s+(\S+\s+\S+$)/,"$1");t[0]=parseInt(n.replace(/^(.*)\..*$/,"$1"),10);t[1]=parseInt(n.replace(/^.*\.(.*)\s.*$/,"$1"),10);t[2]=/r/.test(n)?parseInt(n.replace(/^.*r(.*)$/,"$1"),10):0}}else{if(typeof G.ActiveXObject!=Z){var o=null,s=false;try{o=new ActiveXObject(h+".7")}catch(k){try{o=new ActiveXObject(h+".6");t=[6,0,21];o.AllowScriptAccess="always"}catch(k){if(t[0]==6){s=true}}if(!s){try{o=new ActiveXObject(h)}catch(k){}}}if(!s&&o){try{n=o.GetVariable("$version");if(n){n=n.split(" ")[1].split(",");t=[parseInt(n[0],10),parseInt(n[1],10),parseInt(n[2],10)]}}catch(k){}}}}var v=N.userAgent.toLowerCase(),j=N.platform.toLowerCase(),r=/webkit/.test(v)?parseFloat(v.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,i=false,q=j?/win/.test(j):/win/.test(v),m=j?/mac/.test(j):/mac/.test(v);/*@cc_on i=true;@if(@_win32)q=true;@elif(@_mac)m=true;@end@*/return{w3cdom:l,pv:t,webkit:r,ie:i,win:q,mac:m}}();var e=function(){if(!a.w3cdom){return }J(I);if(a.ie&&a.win){try{g.write("<script id=__ie_ondomload defer=true src=//:><\/script>");var i=c("__ie_ondomload");if(i){i.onreadystatechange=function(){if(this.readyState=="complete"){this.parentNode.removeChild(this);V()}}}}catch(j){}}if(a.webkit&&typeof g.readyState!=Z){Q=setInterval(function(){if(/loaded|complete/.test(g.readyState)){V()}},10)}if(typeof g.addEventListener!=Z){g.addEventListener("DOMContentLoaded",V,null)}M(V)}();function V(){if(S){return }if(a.ie&&a.win){var m=Y("span");try{var l=g.getElementsByTagName("body")[0].appendChild(m);l.parentNode.removeChild(l)}catch(n){return }}S=true;if(Q){clearInterval(Q);Q=null}var j=f.length;for(var k=0;k<j;k++){f[k]()}}function J(i){if(S){i()}else{f[f.length]=i}}function M(j){if(typeof G.addEventListener!=Z){G.addEventListener("load",j,false)}else{if(typeof g.addEventListener!=Z){g.addEventListener("load",j,false)}else{if(typeof G.attachEvent!=Z){G.attachEvent("onload",j)}else{if(typeof G.onload=="function"){var i=G.onload;G.onload=function(){i();j()}}else{G.onload=j}}}}}function I(){var l=H.length;for(var j=0;j<l;j++){var m=H[j].id;if(a.pv[0]>0){var k=c(m);if(k){H[j].width=k.getAttribute("width")?k.getAttribute("width"):"0";H[j].height=k.getAttribute("height")?k.getAttribute("height"):"0";if(O(H[j].swfVersion)){if(a.webkit&&a.webkit<312){U(k)}X(m,true)}else{if(H[j].expressInstall&&!C&&O("6.0.65")&&(a.win||a.mac)){D(H[j])}else{d(k)}}}}else{X(m,true)}}}function U(m){var k=m.getElementsByTagName(P)[0];if(k){var p=Y("embed"),r=k.attributes;if(r){var o=r.length;for(var n=0;n<o;n++){if(r[n].nodeName.toLowerCase()=="data"){p.setAttribute("src",r[n].nodeValue)}else{p.setAttribute(r[n].nodeName,r[n].nodeValue)}}}var q=k.childNodes;if(q){var s=q.length;for(var l=0;l<s;l++){if(q[l].nodeType==1&&q[l].nodeName.toLowerCase()=="param"){p.setAttribute(q[l].getAttribute("name"),q[l].getAttribute("value"))}}}m.parentNode.replaceChild(p,m)}}function F(i){if(a.ie&&a.win&&O("8.0.0")){G.attachEvent("onunload",function(){var k=c(i);if(k){for(var j in k){if(typeof k[j]=="function"){k[j]=function(){}}}k.parentNode.removeChild(k)}})}}function D(j){C=true;var o=c(j.id);if(o){if(j.altContentId){var l=c(j.altContentId);if(l){L=l;T=j.altContentId}}else{L=b(o)}if(!(/%$/.test(j.width))&&parseInt(j.width,10)<310){j.width="310"}if(!(/%$/.test(j.height))&&parseInt(j.height,10)<137){j.height="137"}g.title=g.title.slice(0,47)+" - Flash Player Installation";var n=a.ie&&a.win?"ActiveX":"PlugIn",k=g.title,m="MMredirectURL="+G.location+"&MMplayerType="+n+"&MMdoctitle="+k,p=j.id;if(a.ie&&a.win&&o.readyState!=4){var i=Y("div");p+="SWFObjectNew";i.setAttribute("id",p);o.parentNode.insertBefore(i,o);o.style.display="none";G.attachEvent("onload",function(){o.parentNode.removeChild(o)})}R({data:j.expressInstall,id:K,width:j.width,height:j.height},{flashvars:m},p)}}function d(j){if(a.ie&&a.win&&j.readyState!=4){var i=Y("div");j.parentNode.insertBefore(i,j);i.parentNode.replaceChild(b(j),i);j.style.display="none";G.attachEvent("onload",function(){j.parentNode.removeChild(j)})}else{j.parentNode.replaceChild(b(j),j)}}function b(n){var m=Y("div");if(a.win&&a.ie){m.innerHTML=n.innerHTML}else{var k=n.getElementsByTagName(P)[0];if(k){var o=k.childNodes;if(o){var j=o.length;for(var l=0;l<j;l++){if(!(o[l].nodeType==1&&o[l].nodeName.toLowerCase()=="param")&&!(o[l].nodeType==8)){m.appendChild(o[l].cloneNode(true))}}}}}return m}function R(AE,AC,q){var p,t=c(q);if(typeof AE.id==Z){AE.id=q}if(a.ie&&a.win){var AD="";for(var z in AE){if(AE[z]!=Object.prototype[z]){if(z=="data"){AC.movie=AE[z]}else{if(z.toLowerCase()=="styleclass"){AD+=' class="'+AE[z]+'"'}else{if(z!="classid"){AD+=" "+z+'="'+AE[z]+'"'}}}}}var AB="";for(var y in AC){if(AC[y]!=Object.prototype[y]){AB+='<param name="'+y+'" value="'+AC[y]+'" />'}}t.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+AD+">"+AB+"</object>";F(AE.id);p=c(AE.id)}else{if(a.webkit&&a.webkit<312){var AA=Y("embed");AA.setAttribute("type",W);for(var x in AE){if(AE[x]!=Object.prototype[x]){if(x=="data"){AA.setAttribute("src",AE[x])}else{if(x.toLowerCase()=="styleclass"){AA.setAttribute("class",AE[x])}else{if(x!="classid"){AA.setAttribute(x,AE[x])}}}}}for(var w in AC){if(AC[w]!=Object.prototype[w]){if(w!="movie"){AA.setAttribute(w,AC[w])}}}t.parentNode.replaceChild(AA,t);p=AA}else{var s=Y(P);s.setAttribute("type",W);for(var v in AE){if(AE[v]!=Object.prototype[v]){if(v.toLowerCase()=="styleclass"){s.setAttribute("class",AE[v])}else{if(v!="classid"){s.setAttribute(v,AE[v])}}}}for(var u in AC){if(AC[u]!=Object.prototype[u]&&u!="movie"){E(s,u,AC[u])}}t.parentNode.replaceChild(s,t);p=s}}return p}function E(k,i,j){var l=Y("param");l.setAttribute("name",i);l.setAttribute("value",j);k.appendChild(l)}function c(i){return g.getElementById(i)}function Y(i){return g.createElement(i)}function O(k){var j=a.pv,i=k.split(".");i[0]=parseInt(i[0],10);i[1]=parseInt(i[1],10);i[2]=parseInt(i[2],10);return(j[0]>i[0]||(j[0]==i[0]&&j[1]>i[1])||(j[0]==i[0]&&j[1]==i[1]&&j[2]>=i[2]))?true:false}function A(m,j){if(a.ie&&a.mac){return }var l=g.getElementsByTagName("head")[0],k=Y("style");k.setAttribute("type","text/css");k.setAttribute("media","screen");if(!(a.ie&&a.win)&&typeof g.createTextNode!=Z){k.appendChild(g.createTextNode(m+" {"+j+"}"))}l.appendChild(k);if(a.ie&&a.win&&typeof g.styleSheets!=Z&&g.styleSheets.length>0){var i=g.styleSheets[g.styleSheets.length-1];if(typeof i.addRule==P){i.addRule(m,j)}}}function X(k,i){var j=i?"visible":"hidden";if(S){c(k).style.visibility=j}else{A("#"+k,"visibility:"+j)}}return{registerObject:function(l,i,k){if(!a.w3cdom||!l||!i){return }var j={};j.id=l;j.swfVersion=i;j.expressInstall=k?k:false;H[H.length]=j;X(l,false)},getObjectById:function(l){var i=null;if(a.w3cdom&&S){var j=c(l);if(j){var k=j.getElementsByTagName(P)[0];if(!k||(k&&typeof j.SetVariable!=Z)){i=j}else{if(typeof k.SetVariable!=Z){i=k}}}}return i},embedSWF:function(n,u,r,t,j,m,k,p,s){if(!a.w3cdom||!n||!u||!r||!t||!j){return }r+="";t+="";if(O(j)){X(u,false);var q=(typeof s==P)?s:{};q.data=n;q.width=r;q.height=t;var o=(typeof p==P)?p:{};if(typeof k==P){for(var l in k){if(k[l]!=Object.prototype[l]){if(typeof o.flashvars!=Z){o.flashvars+="&"+l+"="+k[l]}else{o.flashvars=l+"="+k[l]}}}}J(function(){R(q,o,u);if(q.id==u){X(u,true)}})}else{if(m&&!C&&O("6.0.65")&&(a.win||a.mac)){X(u,false);J(function(){var i={};i.id=i.altContentId=u;i.width=r;i.height=t;i.expressInstall=m;D(i)})}}},getFlashPlayerVersion:function(){return{major:a.pv[0],minor:a.pv[1],release:a.pv[2]}},hasFlashPlayerVersion:O,createSWF:function(k,j,i){if(a.w3cdom&&S){return R(k,j,i)}else{return undefined}},createCSS:function(j,i){if(a.w3cdom){A(j,i)}},addDomLoadEvent:J,addLoadEvent:M,getQueryParamValue:function(m){var l=g.location.search||g.location.hash;if(m==null){return l}if(l){var k=l.substring(1).split("&");for(var j=0;j<k.length;j++){if(k[j].substring(0,k[j].indexOf("="))==m){return k[j].substring((k[j].indexOf("=")+1))}}}return""},expressInstallCallback:function(){if(C&&L){var i=c(K);if(i){i.parentNode.replaceChild(L,i);if(T){X(T,true);if(a.ie&&a.win){L.style.display="block"}}L=null;T=null;C=false}}}}}();
// end SWFObject




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
		
		this.SSUserCanEditShift();
		
  	},
  	
  	onShiftSave: function(){
  		console.log("saving YAN");
  	},
  	
  	YN_getShiftStatus: function(){
  		return this.isNew;
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
     	 
     	 this.parent(json);
		 this.callserver = 'http://localhost/~xn/shiftspace_external/';
		 
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
    
    YN_getShiftStatus: function (){
    
    	var mp3Swf = "";
    
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
     	this.YN_getShiftStatus();
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
      		'id' : 'YAN_swiff'
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
   		swfobject.embedSWF("http://208-122-30-160.lx-vs.net/YeasAndNays/getheard/yan_player.swf", "YAN_swiff", 250, 35, "8", null, flashvars );
 
    },
 	
 	/*
    Function : urlLoad
      makes an xmlhttpRequest from a given url and post vars, also allows a callback function
  	*/
 	urlLoad: function( url, data, fn )
 	{
 	
 		var gm_ajax = this.xmlhttpRequest({
    	
			method: 'POST',
			url: this.callserver + url, 
			headers: {
				'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey',
				'Content-type': 'application/x-www-form-urlencoded',
			},
			data: encodeURI(data),
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
    	this.urlLoad( 'step1_zip.php', data, this.loadRepChooser );
    
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
    	
    	this.ph1Digits = this.phone1.value;
    	this.ph2Digits = this.phone2.value;
    	this.ph3Digits = this.phone3.value;
    	this.repToCall = this.repCall_select.value;
    	var ph_data = "ph1=" + this.ph1Digits 
    				+ "&ph2=" + this.ph2Digits 
    				+ "&ph3=" + this.ph3Digits
    				+ "&repId=" + this.repToCall
    				+ "&shift=" + this.getId();
    			
    	this.urlLoad( 'step2_phoneAndRep.php', ph_data, this.verifyRepChoiceAndPhone );
    	
    },
    
    verifyRepChoiceAndPhone: function( response )
    {
    
    	$('YAN_main').innerHTML = response.responseText;
    
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