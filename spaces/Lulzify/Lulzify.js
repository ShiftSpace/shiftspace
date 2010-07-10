var LulzifySpace = Space({
  setup: function(options) {
    // Your space code goes here
  }
});

var LulzifyShift = Shift({
  setup: function(json) {
    
    console.log(
      "LOADING: ",
      "summary : "+ json.summary,
      "lulzImgSrc : "+ json.lulzImgSrc,
      "lulzText : "+ json.lulzText
    );
    
    //setup our variables:
    if(json.lulzImgSrc){
      this.summary = json.summary;
      this.lulzImgSrc = json.lulzImgSrc;
      this.lulzText = json.lulzText;
    }
    
/*
    //Populate the data from the saved shift:
    if(json.lulzImgSrc){
      
      //test
      //console.log("got lolText: " + json);
      
      //set lulzImg:
      this.lulzImg = $$('img[src=' + json.lulzImgSrc + ']')[0];
      
      //create the container node:
      this.lulzContainer = new Element('span', {class: 'lulzContainer'});
      //wrap the container around the image
      this.lulzContainer.wraps(this.lulzImg);
        
      //create the interface node
      this.lulzInterface = new Element('textarea', {
        'class' : 'lulzInterface',
        'value' : json.lulzText
      });
      
      //inject the interface into the container
        this.lulzInterface.inject(this.lulzContainer);
        $$('.lulzInterface')[0].focus();
        $$('.lulzInterface')[0].select();
    
    } else {
      
      //Setup a default title
      this.summary = "I did it for the LULZ";
      
      //attach events to images:
      $$('img').addEvent('click',function(event) { 
        
        if(!this.lulzImg){
          //get the image node and store it in lulzImg
          this.lulzImg = $(event.target);
          this.lulzImgSrc = this.lulzImg.get('src');
          
          //create the container node:
          this.lulzContainer = new Element('span', {class: 'lulzContainer'});
          //wrap the container around the image
          this.lulzContainer.wraps(this.lulzImg);
          
          //create the interface node
          this.lulzInterface = new Element('textarea', {
            'class' : 'lulzInterface',
            'value' : 'I can Lulzify Dis!'
          });
        }
        
        //inject the interface into the container
        this.lulzInterface.inject(this.lulzContainer);
        $$('.lulzInterface')[0].focus();
        $$('.lulzInterface')[0].select();
      }.bind(this));
           
    }  
*/  
    
  },
  
  show: function() {
    
    //in the case you're coming from edit, do some cleanup:
    if (this.state === "edit"){
      this.lulzImg.replaces(this.lulzContainer);
    }
    
    this.state = "show";
  
    if(!this.isNewShift()){
      //set lulzImg:
      this.lulzImg = $$('img[src=' + this.lulzImgSrc + ']')[0];
      
      //create the container node:
      this.lulzContainer = new Element('span', {class: 'lulzContainer'});
      //wrap the container around the image
      this.lulzContainer.wraps(this.lulzImg);
        
      //create the interface node
      this.lulzInterface = new Element('p', {
        'class' : 'lulzInterface',
        'html' : this.lulzText
      });
      
      //inject the interface into the container
      this.lulzInterface.inject(this.lulzContainer);
    }
  
  },
  
  hide: function() {
    this.lulzImg.replaces(this.lulzContainer);
    this.state = "hide";
  },
  
  edit: function() {
    
    if (this.isNewShift()){
    
      //attach events to images:
      $$('img').addEvent('click',function(event) { 
        
        if(!this.lulzImg){
          //get the image node and store it in lulzImg
          this.lulzImg = $(event.target);
          this.lulzImgSrc = this.lulzImg.get('src');
          
          //create the container node:
          this.lulzContainer = new Element('span', {class: 'lulzContainer'});
          //wrap the container around the image
          this.lulzContainer.wraps(this.lulzImg);
          
          //create the interface node
          this.lulzInterface = new Element('textarea', {
            'class' : 'lulzInterface',
            'value' : 'I can Lulzify Dis!'
          });
        }
        
        //inject the interface into the container
        this.lulzInterface.inject(this.lulzContainer);
        this.lulzInterface.focus();
        this.lulzInterface.select();
        
      }.bind(this));
    
    } else {
    
      //Remove the existing container:
      if (this.lulzInterface.getElement('p')){
        
        this.lulzImg.replaces(this.lulzContainer);
      }
      
      //create the interface node
      this.lulzInterface = new Element('textarea', {
        'class' : 'lulzInterface',
        'value' : this.lulzText
      });
      
      //inject the interface into the container
      this.lulzInterface.inject(this.lulzContainer);
      this.lulzInterface.focus();
      this.lulzInterface.select();
      
    }
    
    this.state = "edit";

  },
    
  encode: function() {
    console.log(
      "SAVING: ",
      "summary : "+ this.summary,
      "lulzImgSrc : "+ this.lulzImgSrc,
      "lulzText : "+ this.lulzText
    );
    
    //The summary, image reference and text content are saved into the shift:
    return {
      summary : this.lulzInterface.value,
      lulzImgSrc : this.lulzImgSrc,
      lulzText : this.lulzInterface.value
    };
    
  }
  
});