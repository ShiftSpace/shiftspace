var EmbedSpace = Space({
  setup: function(options) {
    // Your space code goes here
  }
});

var EmbedShift = Shift({
  setup: function(json) {
    
    //Populate the data from the saved shift:
    if(json.inputHtml){
      this.element.getElement('textarea.inputHtml').set('value', json.inputHtml);
    }
    
    //Setup a default title
    this.summary = "I did it for the LULZ";
    
    //attach events to images:
    document.element.getElement('img').addEvent('click', this.addLulzText.bind(this));
  },
  
  addLulzText: function() {
    //wrap the image in a div
    
    
    //add the lulz input box pointers at the bottom of the image
    
    
    //show preview (hide the input box)
  },
    
  encode: function() {
    //The summary, html code and position are saved into the shift:
    return {
      summary : this.summary,
      lulzImg : this.lulzImg,
      lulzText : this.lulzText
    };
  }
  
});