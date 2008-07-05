var YeasAndNaysSpace = ShiftSpace.Space.extend({

    attributes: {
        name: 'YeasAndNays',
        title: 'YeasAndNays',
        icon: 'YeasAndNays.png'
    },
    
    setup: function()
    {
       console.log("YeasAndNays starting up.");
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
     console.log('setting up the shift');    
     
		 this.callserver = 'http://localhost/~xn/shiftspace_external/';
		 this.zipcode = 0;
        
         // build the DOM
   		 this.build(json);
    		
    	 // attach events
   		 this.attachEvents();
    
    	 // set the position of the shift to the mouse
   		 this.element.setStyles({
    		  left : json.position.x,
    		  top : json.position.y
   		 });
        
        this.manageElement(this.element);
        this.refresh();
        
    },
    
    build: function(json){
    
    	// create the element
    	this.element = new ShiftSpace.Element( 'div', {
      		'class' : 'SSYeasAndNaysShift',
      		'id' : 'YANmain'
   		 });
   		 
   		this.element.setStyles({
            'font': '12px verdana, sans-serif',
            'position': 'absolute',
            'padding':  '5px 10px 5px 10px',
            'color': '#FFF',
            'background-color': '#F63B02',
            'left': json.position.x,
            'top': json.position.y
        });
    	
    	this.element.injectInside( document.body );
    	
    	// create the zip text field
		this.zipInput = new ShiftSpace.Element( 'input', {
		  type : 'text',
		  value : 'Enter Zip',
		  'class' : 'SSYeasAndNaysShiftInput'
		});
		this.zipInput.focus();
		this.zipInput.injectInside( this.element );
    	
    	// create the zip submit button
		this.zipButton = new ShiftSpace.Element( 'input', {
		  type : 'button',
		  value : 'Go!',
		  'class' : 'SSYeasAndNaysShiftButton'
		});
		this.zipButton.injectInside( this.element );

    },
    
    attachEvents: function(e){
    
    	 // setup close button
   		 this.zipButton.addEvent('click', this.loadZip.bind(this));
    
    },
 
 	urlLoad: function( url, data, fn ){
 	
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
    
    loadZip: function(){
    	
    	this.zipcode = this.zipInput.value;
    	var data = "zipcode=" + this.zipInput.value + "&shift=" + this.getId();
    	this.urlLoad( 'step1_zip.php', data, this.loadRepChooser );
    
    },
    
    loadRepChooser: function(response){
          
    	$('YANmain').innerHTML = "";
    	this.element = $('YANmain');
    	
    	var reps = Json.evaluate( response.responseText, true );
    	
    	// create the representative select box
    	this.repCall_select = new ShiftSpace.Element( 'select', {
      		'class' : 'SSYeasAndNaysSelect',
      		'id' : 'YAN_Select'
   		 });
   		 
   		 this.repCall_select.setStyles({
            'font': '13px verdana, sans-serif',
            'padding':  '5px 10px 5px 10px',
            'color': '#FFF'
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
    	
    	this.repCall_select.injectInside( this.element );  
    	  
        this.phone1 = new ShiftSpace.Element( 'input', {
        	type: 'text',
        	maxlength: '3',
        	id: 'phone1'
        });
        this.phone2 = new ShiftSpace.Element( 'input', {
        	type: 'text',
        	maxlength: '3',
        	id: 'phone2'
        });
        this.phone3 = new ShiftSpace.Element( 'input', {
        	type: 'text',
        	maxlength: '4',
        	id: 'phone3'
        });
    	
    	// create the rep choice submit button
		this.repChoiceButton = new ShiftSpace.Element( 'input', {
		  type : 'button',
		  value : 'Enter',
		  'class' : 'SSYeasAndNaysShiftButton'
		});
		
		this.phone1.injectInside( this.element );
		this.phone2.injectInside( this.element );
		this.phone3.injectInside( this.element );
		this.repChoiceButton.injectInside( this.element );  
		this.repChoiceButton.addEvent('click', this.submitRepChoice.bind(this) );
		
    },
    
    submitRepChoice: function(){
    	
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
    
    verifyRepChoiceAndPhone: function( response ){
    
    	$('YANmain').innerHTML = response.responseText;
    
    }
    
});

var YeasAndNays = new YeasAndNaysSpace(YeasAndNaysShift);