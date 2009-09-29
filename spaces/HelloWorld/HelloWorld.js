var HelloWorldShift = Shift({
  setup: function(json) {
    this.messageValue = json.message || "Hello World!";
    this.setPosition(json.position);
    this.element.set('text', this.messageValue);
    this.addEvents();
    this.save();
  },
  
  addEvents: function(){
    this.element.makeDraggable({
      handle: this.element,
      onComplete: this.save.bind(this)
    });
    this.element.addEvent('dblclick', this.changeMessage.bind(this));
  },

  changeMessage: function() {
    var msg = prompt("Please enter a new message:", this.messageValue);
    this.messageValue = msg;
    this.element.set('text', msg);
    this.save();
  },

  encode: function() {
    return {
      summary: this.messageValue,
      message: this.messageValue,
      position: this.getPosition()
    };
  }
});