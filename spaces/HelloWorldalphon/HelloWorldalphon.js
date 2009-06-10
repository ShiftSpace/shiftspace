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
        this.addEvents();
        console.log("happy4");

    },
    
    build: function() {
      console.log("happy2");
      ShiftSpace.Sandalphon.load('spaces/HelloWorldalphon/HelloWorldalphon', function(ui) {
        document.body.grab(ShiftSpace.Sandalphon.convertToFragment(ui.interface));
        ShiftSpace.Sandalphon.activate($('SSHWmain'));
      }.bind(this));
    },
    
    fadeOut: function(){
      var myFx = new Fx.Tween($('SSHWmain'));
         myFx.start('background-color', '#000', '#f00');
         myFx.start('background-color', '#00f');
         myFx.start('top','50')
    },
    
    addFragment: function(){
      
      
    },
    
    addEvents: function(){
      $('SSHWmain').addEvent('click', this.fadeOut.bind(this)); 
      $('SSTabView1').addEvent('click', this.addFragment.bind(this)); 
    }
    }
});

var HelloWorldalphon = new HelloWorldalphonSpace(HelloWorldalphonShift);