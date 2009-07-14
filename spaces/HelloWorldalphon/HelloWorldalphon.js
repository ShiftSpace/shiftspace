var HelloWorldalphonSpace = new Class({
    Extends: ShiftSpace.Space
});

var HelloWorldalphonShift = new Class({
  
    Extends: ShiftSpace.Shift,
  
    setup: function(json) {
        //Sandalphon.reset();
        console.log("happy0");
        this.build();
       // this.addEvents();
        console.log("happy4");

    },
    
    build: function() {
      console.log("happy2");
      ShiftSpace.Sandalphon.load('spaces/HelloWorldalphon/HelloWorldalphon', function(ui) {
        document.body.grab(ShiftSpace.Sandalphon.convertToFragment(ui.interface));
        this.addEvents();
        ShiftSpace.Sandalphon.activate($('SSHWmain'));
      }.bind(this));
    },
    
    addEvents: function(){
      $('SSHWmessage').addEvent('click', this.fadeOut.bind(this)); 
      $('SSTabView1').addEvent('click', this.addFragment.bind(this)); 
      $('SSTabView2').addEvent('click', this.addFragment.bind(this)); 
      $('SSTabView3').addEvent('click', this.addFragment.bind(this)); 
      $('SSHWmain').makeDraggable({
          handle: this.top,

          onStart: function() {
            this.fireEvent('onDragStart');
          }.bind(this),

          onComplete: function() {
            this.fireEvent('onDragStop');
          }.bind(this)
        });
    },
    
    addFragment: function(e){
      console.log("addFragment");
/*
      if($('SSHWNewMessage')){
        var children = $('SSHWNewMessage').getChildren();
        $('SSHWNewMessage').removeChild(children);   
      }*/

      var ref = e.target;
      if(ref == $('SSTabView1')){ 
        var fragment = ShiftSpace.Sandalphon.convertToFragment('<div id="SSHWNewMessage"><div id="SSHWmessage1"><p>Hello world!</p></div></div>');
      }
      else if(ref == $('SSTabView2')){ 
        var fragment = ShiftSpace.Sandalphon.convertToFragment('<div id="SSHWNewMessage"><div id="SSHWmessage2"><p>Hello world!</p><br/><p>Howdy world!</p></div></div>');
      }
      else if(ref == $('SSTabView3')){ 
        var fragment = ShiftSpace.Sandalphon.convertToFragment('<div id="SSHWNewMessage"><div id="SSHWmessage3"><p>Hello world!</p><br/><p>Howdy world!</p><br/><p>Hola world!</p></div></div>');
      }
      document.body.grab(fragment);
      $('SSHWNewMessage').addEvent('domready', this.bounce.bind(this));
    },
    

    bounce: function(){
            var myEffect = new Fx.Morph($('SSHWNewMessage'), {duration: 'long', transition: Fx.Transitions.Sine.easeOut});
            for(var i = 0; i<2000; i++){
                    myEffect.start({
                    'top':  $random(0,400), 
                    'left': $random(0,400),
                    'opacity': 1 });
        }
    },
    
    fadeOut: function(){
        console.log("fadeOut");
        var myFx = new Fx.Tween($('SSHWmain'));
         myFx.start('background-color', '#FF0000');
         myFx.start('top','50px')
     }
    
});

var HelloWorldalphon = new HelloWorldalphonSpace(HelloWorldalphonShift);