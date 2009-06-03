var HelloWorldalphonSpace = new Class({
  
    Extends: ShiftSpace.Space,
    
    attributes: {
        name: 'HelloWorldalphon',
        version: 0.1,
        icon: 'HelloWorldalphon.png',
        css:  'HelloWorldalphon.css'
    }
});

var HelloWorldalphonShift = new Class({
  
    Extends: ShiftSpace.Shift,
  
    setup: function(json) {
        //Sandalphon.reset();
        console.log("happy0");
        this.build();
        console.log("happy4");

    },
    
    build: function() {
      console.log("happy2");
      ShiftSpace.Sandalphon.load('spaces/HelloWorldalphon/HelloWorldalphon', function(ui) {
        console.log("happy3");
        Sandalphon.activate($('SSHWmain'));
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