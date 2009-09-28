var HelloWorldSpace = new Class({
  Extends: ShiftSpace.Space,
  name: "HelloWorld"
});

var HelloWorldalphonShift = new Class({
  
  Extends: ShiftSpace.Shift,
  
  setup: function(json) {
    console.log("happy0");
  },
  
  onReady: function() {
  },
  
  addEvents: function(){
    $('SSHWmain').makeDraggable({
      handle: this.element,
      onComplete: this.save.bind(this)
    });
  }
});

var HelloWorld = new HelloWorld(HelloWorldShift);