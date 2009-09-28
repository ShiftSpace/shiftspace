var HelloWorldSpace = new Class({
  Extends: ShiftSpace.Space,
  name: "HelloWorld"
});

var HelloWorldShift = new Class({
  Extends: ShiftSpace.Shift,
  
  setup: function(json) {
    // set the position
    this.addEvents();
  },
  
  // add events here
  addEvents: function(){
    this.element.makeDraggable({
      handle: this.element,
      onComplete: this.save.bind(this)
    });
  }
});

var HelloWorld = new HelloWorldSpace(HelloWorldShift);