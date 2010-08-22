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
      this.lulzImg = $$('img[src=' + this.lulzImgSrc + ']')[0];
    }
    
  },
  
  show: function() {
    
    this.resetImg();
    
    this.state = "show";
    console.log('state = ' + this.state);
  
    if(!this.isNewShift()){
      //set lulzImg:
      this.lulzImg = $$('img[src=' + this.lulzImgSrc + ']')[0];
      console.log('lulzImg = ' + this.lulzImg);
      
      //create the container node:
      this.lulzContainer = new ShiftSpace.Element('span', {class: 'lulzContainer', id: this.getId()});
      //wrap the container around the image
      this.lulzContainer.wraps(this.lulzImg);
        
      //prepare texts to be presented in a paragraph
      this.lulzTextDisplay = this.lulzText.replace(/\n/g, '<br/>');
//      this.lulzTextDisplay = this.lulzText.replace('\n', '<br/>', 'g');
        
      //create the interface node
      this.lulzShow = new ShiftSpace.Element('p', {
        'class' : 'lulzShow',
        'html' : this.lulzTextDisplay
      });
      
      //inject the interface into the container
      this.lulzShow.inject(this.lulzContainer);
    }
  
  },
  
  hide: function() {
    this.resetImg();
    this.state = "hide";
    console.log('state = ' + this.state);
  },
  
  editExit: function() {
    this.show();
  },
  
  resetImg: function() {
    if($$('#' + this.getId())[0]){
      this.lulzImg.replaces(this.lulzContainer);
    }
  },
  
  edit: function() {
    
    this.resetImg();
    console.log('Start editting');
    
    //tell the page it can be lulzified:
    $(document.body).addClass('lulzifySomething');
    $$('#install').addClass('lulzifySomething');
    
    if (this.isNewShift()){
      console.log('editing new shift');
    
      //attach events to images:
      $$('img').addEvent('click',function(event) { 
        
        if(!this.lulzImg){
          //tell the page it's being lulzified:
          $(document.body).removeClass('lulzifySomething');
          
          //get the image node and store it in lulzImg
          this.lulzImg = $(event.target);
          this.lulzImgSrc = this.lulzImg.get('src');
          
          //create the container node:
          this.lulzContainer = new ShiftSpace.Element('span', {class: 'lulzContainer', id: this.getId()});
          //wrap the container around the image
          this.lulzContainer.wraps(this.lulzImg);
          
          //create the interface node
          this.lulzEdit = new ShiftSpace.Element('textarea', {
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
          
      console.log('this.lulzImg = ' + this.lulzImg );
      
      //tell the page it's being lulzified:
      $(document.body).removeClass('lulzifySomething');
      
      //create the container node:
      this.lulzContainer = new ShiftSpace.Element('span', {class: 'lulzContainer', id: this.getId()});
      //wrap the container around the image
      this.lulzContainer.wraps(this.lulzImg);
          
      console.log('this.lulzContainer = ' + this.lulzContainer );

      //create the interface node
      this.lulzEdit = new ShiftSpace.Element('textarea', {
        'class' : 'lulzEdit',
        'value' : this.lulzText
      });
      
      //inject the interface into the container
      this.lulzEdit.inject(this.lulzContainer);
      this.lulzEdit.focus();
      this.lulzEdit.select();
      
    }
    
    this.state = "edit";
    console.log('state = ' + this.state);

  },
    
  encode: function() {
    this.lulzText = this.lulzEdit.value;
  
    console.log(
      "SAVING: ",
      "summary : "+ this.summary,
      "lulzImgSrc : "+ this.lulzImgSrc,
      "lulzText : "+ this.lulzText
    );
    
    //The summary, image reference and text content are saved into the shift:
    return {
      summary : this.lulzText,
      lulzImgSrc : this.lulzImgSrc,
      lulzText : this.lulzText
    };
    
  }
  
});