var HelloWorldSpace = new Class({
  Extends: ShiftSpace.Space,
  name: "HelloWorld"
});

var HelloWorldShift = new Class({
  Extends: ShiftSpace.Shift,
  
  setup: function(json) {
    this.messageValue = json.message || "Hello World!";
    this.element.setStyles({left: json.position.x, top: json.position.y});
    this.element.set('text', this.messageValue);
    this.addEvents();
    $(document.body).grab(this.element);
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
    this.element.set('html', msg);
    this.save();
  },

  encode: function() {
    var pos = this.element.getPosition();
    return {
      summary: this.messageValue,
      message: this.messageValue,
      position: pos
    };
  }
});

var HelloWorld = new HelloWorldSpace(HelloWorldShift);