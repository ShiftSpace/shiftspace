var LulzifySpace = Space({
  setup: function(options) {
    // Your space code goes here
  }
});

var LulzifyShift = Shift({
  setup: function(json) {
    
    //Populate the data from the saved shift:
    if(json.inputHtml){
      //this.element.getElement('textarea.inputHtml').set('value', json.inputHtml);
    }
    
    //Setup a default title
    this.summary = "I did it for the LULZ";
    
    //attach events to images:
    $$('img').addEvent('click',function(event) { 
      
      if(!this.lulzImg){
        //get the image node and store it in lulzImg
        this.lulzImg = event.target;
        
        //create the container node:
        this.lulzContainer = new Element('span', {class: 'lulzContainer'});
        //wrap the container around the image
        this.lulzContainer.wraps(this.lulzImg);
        
        //create the interface node
        this.lulzInterface = new Element('textarea', {
          'class' : 'lulzInterface',
          //'type' : 'text',
          'value' : 'I can Lulzify Dis!'
        });
      }
      
      //inject the interface into the container
      this.lulzInterface.inject(this.lulzContainer);
      $$('.lulzInterface')[0].focus();
      $$('.lulzInterface')[0].select();
      
    }.bind(this));
    
    
    // this.addLulzText.bind(this));
  },
  
  addLulzText: function() {
    //wrap the image in a div
    
    
    //add the lulz input box pointers at the bottom of the image
    
    
    //show preview (hide the input box)
  },
    
  encode: function() {
    //get the current value of the text field
    this.lulzText = this.lulzInterface.value;
    //The summary, html code and position are saved into the shift:
    return {
      summary : this.lulzText,
      lulzImg : this.lulzImg,
      lulzText : this.lulzText
    };
  }
  
});