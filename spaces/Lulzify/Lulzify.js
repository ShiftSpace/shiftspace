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
    //console.log("just started: " + json);
    
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
    
  },
  
  hide: function() {
    this.lulzImg.replaces(this.lulzContainer);
    this.lulzImg = null;
    this.lulzInterface = null;
    this.lulzContainer = null;
  },
    
  encode: function() {
    console.log(
      "SAVING: ",
      "summary : "+ json.summary,
      "lulzImgSrc : "+ json.lulzImgSrc,
      "lulzText : "+ json.lulzText
    );
    
    //The summary, image reference and text content are saved into the shift:
    return {
      summary : this.lulzInterface.value,
      lulzImgSrc : this.lulzImgSrc,
      lulzText : this.lulzInterface.value
    };
    
  }
  
});