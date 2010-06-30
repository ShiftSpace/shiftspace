var EmbedSpace = Space({
  setup: function(options) {
    // Your space code goes here
  }
});

var EmbedShift = Shift({
  setup: function(json) {
    
    //Populate the data from the saved shift:
    if(json.inputHtml){
      this.setPosition(json.position);
      this.element.getElement('textarea.inputHtml').set('value', json.inputHtml);
    }
    
    //Make the interface draggable from the title:
    this.makeDraggable({handle: this.element.getElement('h1.drag_it')});
    
    //Setup a default title
    this.summary = "Embeded html code";
    
    //Make the html and preview tabs work
    this.element.getElement('.previewTab').addEvent('click', this.preview.bind(this));
    this.element.getElement('.htmlTab').addEvent('click', this.editHtml.bind(this));
  },
  
  render: function() {
    //Get the code into a variable:
    this.inputHtml = this.element.getElement('textarea.inputHtml').get('value');
    //Save
    this.save();
  },
  
  preview: function() {
    this.render();
    this.element.getElement('form').style.display = "none";
    this.element.getElement('.outputView').style.display = "block";
    this.element.getElement('.outputView').innerHTML = this.inputHtml;
  },
  
  editHtml: function() {
    this.element.getElement('form').style.display = "block";
    this.element.getElement('.outputView').style.display = "none";
  },
  
  encode: function() {
    //The summary, html code and position are saved into the shift:
    return {
      summary : this.summary,
      inputHtml : this.inputHtml,
      position : this.getPosition()
    };
  }
  
  
});