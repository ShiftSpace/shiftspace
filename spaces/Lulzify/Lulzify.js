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
    
  },
  
  show: function() {
    
    //in the case you're coming from edit, do some cleanup:
    if (this.state === "edit"){
      this.lulzImg.replaces(this.lulzContainer);
    }
    
    this.state = "show";
    console.log('state = ' + this.state);
  
    if(!this.isNewShift()){
      //set lulzImg:
      this.lulzImg = $$('img[src=' + this.lulzImgSrc + ']')[0];
      
      //create the container node:
      this.lulzContainer = new Element('span', {class: 'lulzContainer'});
      //wrap the container around the image
      this.lulzContainer.wraps(this.lulzImg);
        
      //create the interface node
      this.lulzShow = new Element('p', {
        'class' : 'lulzShow',
        'html' : this.lulzText
      });
      
      //inject the interface into the container
      this.lulzShow.inject(this.lulzContainer);
    }
  
  },
  
  hide: function() {
    if(this.lulzContainer){
      this.lulzImg.replaces(this.lulzContainer);
    }
    this.state = "hide";
    console.log('state = ' + this.state);
  },
  
  edit: function() {
    
    this.hide();
    console.log('I just hid stuff before editting');
    
    if (this.isNewShift()){
      console.log('editing new shift');
    
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
            'class' : 'lulzEdit',
            'value' : 'I can Lulzify Dis!'
          });
        }
        
        //inject the interface into the container
        this.lulzEdit.inject(this.lulzContainer);
        this.lulzEdit.focus();
        this.lulzEdit.select();
        
      }.bind(this));
    
    } else {
      console.log('re-editing old shift');

      //create the interface node
      this.lulzEdit = new Element('textarea', {
        'class' : 'lulzEdit',
        'value' : this.lulzText
      });
      
      //inject the interface into the container
      this.lulzContainer.wraps(this.lulzImg);
      this.lulzEdit.inject(this.lulzContainer);
      this.lulzEdit.focus();
      this.lulzEdit.select();
      
    }
    
    this.state = "edit";
    console.log('state = ' + this.state);

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
      summary : this.lulzEdit.value,
      lulzImgSrc : this.lulzImgSrc,
      lulzText : this.lulzEdit.value
    };
    
  }
  
});