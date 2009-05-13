var HelloWorldalphonSpace = new Class({
  
    Extends: ShiftSpace.Space,
    
    attributes: {
        name: 'HelloWorldalphon',
        version: 0.1,
        icon: 'HelloWorld.png',
        css:  'HelloWorldalphon.css'
    }
});

var HelloWorldalphonShift = new Class({
  
    Extends: ShiftSpace.Shift,
  
    setup: function(json) {
        this.build(json);
        this.save();
        this.manageElement(this.element);
        Sandalphon.reset();
    },
    
    build: function(json) {
      Sandalphon.compileAndLoad('spaces/HelloWorldalphon/HelloWorldalphon', function(ui) {
        Sandalphon.addStyle(ui.styles);
      });
    },
    
    changeMessage: function() {
        var msg = prompt("Please enter a new message:", this.messageValue);
        this.messageValue = msg;
        this.element.setHTML(msg);
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

var HelloWorldalphon = new HelloWorldalphonSpace(HelloWorldalphonShift);