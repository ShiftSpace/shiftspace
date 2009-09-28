var HelloWorldSpace = new Class({
  Extends: ShiftSpace.Space,
  name: "HelloWorld"
});

var HelloWorldShift = new Class({
  Extends: ShiftSpace.Shift,
  
  setup: function(json) {
    // set the position
    this.element.setStyles({
      left: json.position.x,
      top: json.position.y
    });
    // add your custom events
    this.addEvents();
    // add your interface to the page
    $(document.body).grab(this.element);
  },
  
  addEvents: function(){
    this.element.makeDraggable({
      handle: this.element,
      onComplete: this.save.bind(this)
    });
  }
});

var HelloWorld = new HelloWorldSpace(HelloWorldShift);