var SSConsoleClass = new Class({
  
  Extends: SSView,
  
  initialize: function()
  {
    //this.ui = Sandalphon.load('SSConsole');
    //this.createFrame();
  },
  
  createFrame: function()
  {
    this.frame = new Iframe({
      id: 'SSConsole'
    });
    this.frame.injectInside(document.body);
        
    this.frame.addEvent('load', function(_evt) {
      var evt = new Event(_evt);
      // inject the css into the iframe
      //var context = this.frame.contentWindow.document;
      //SSInjectStyle(this.ui.styles, context);
      //grab the proper part of the UI
      //var fragment = Sandalphon.convertToFragment(this.ui.interface).getFirst();
      //place it inside the frame body
      //$(context.body).grab(fragment);
      //Sandalphon.activate(fragment);
    }.bind(this));
  }
  
});