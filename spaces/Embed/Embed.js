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
    
    //Call the Bespin lib (link should be made relative):
    //this.addBespin('http://localhost:8080/spaces/Embed/BespinEmbedded.js');
    eval(this.attribute().lib.BespinEmbedded);
  },
  
  addBespin: function(file) {
    var NewScript = document.createElement('script');
    NewScript.src = file;
    NewScript.type = 'text/javascript';
    document.getElementsByTagName("head")[0].appendChild(NewScript);
    
    //Use the Bespin interface on our textarea:
    var node = this.element.getElement('.bespin');
    bespin.useBespin(node);
  },
  
  render: function() {
    //Get the code into a variable:
    this.inputHtml = this.element.getElement('textarea.inputHtml').get('value');
    //Save
    this.save();
  },
  
  preview: function() {
    this.render();
    this.element.getElement('.htmlView').style.display = "none";
    this.element.getElement('.outputView').style.display = "block";
    this.element.getElement('.outputView').innerHTML = this.inputHtml;
  },
  
  editHtml: function() {
    this.element.getElement('.htmlView').style.display = "block";
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

//Bespin code:
