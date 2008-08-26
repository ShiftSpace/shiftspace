var SSConsoleClass = new Class({
  
  Extends: SSView,
  
  initialize: function()
  {
    console.log('>>>>>>>>>>>>>>>>>>>>> loading Console');
    Sandalphon.load('/client/compiledViews/SSConsole', this.buildInterface.bind(this));
  },
  
  
  buildInterface: function(ui)
  {
    this.frame = new Iframe({
      id: 'SSConsole'
    });
    this.frame.injectInside(document.body);
        
    this.frame.addEvent('load', function(_evt) {
      var evt = new Event(_evt);
      var context = this.frame.contentWindow;

      // add the style
      Sandalphon.addStyle(ui.styles, context);
      // grab the interface, strip the outer level
      var fragment = Sandalphon.convertToFragment(ui.interface, context).getFirst();
      // place it in the frame
      $(context.body).grab(fragment);
      // activate the frament
      Sandalphon.activate(fragment);
    }.bind(this));
  }
  
});

new SSConsoleClass();