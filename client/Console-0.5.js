var SSConsoleClass = new Class({
  
  Extends: SSView,
  

  initialize: function()
  {
    this.parent();
    console.log('>>>>>>>>>>>>>>>>>>>>> loading Console');
    Sandalphon.load('/client/compiledViews/SSConsole', this.buildInterface.bind(this));
  },
  

  awake: function(context)
  {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>> SSConsole awake');
    console.log(this.outlets());
  },
  
  
  awakeDelayed: function(context)
  {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>> SSConsole awake delayed');
    console.log(this.outlets());
  },
  

  buildInterface: function(ui)
  {
    this.element = new IFrame({
      id: 'SSConsole'
    });
    this.element.store('__ssviewcontroller__', this);
    this.element.injectInside(document.body);
        
    this.element.addEvent('load', function() {
      var context = this.element.contentWindow;

      // add the style
      Sandalphon.addStyle(ui.styles, context);
      // grab the interface, strip the outer level
      var fragment = Sandalphon.convertToFragment(ui.interface, context).getFirst();
      // place it in the frame
      $(context.document.body).grab(fragment);
      // activate the iframe context
      Sandalphon.activate(context);
    }.bind(this));
  }
  
});

new SSConsoleClass();