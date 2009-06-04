// ==Builder==
// @uiclass
// @required
// @package           ShiftSpaceCoreUI
// @dependencies      SSView
// ==/Builder==

var SSFramedView = new Class({
  
  name: 'SSFramedView',
  
  Extends: SSView,
  
  initialize: function(el, options)
  {
    // only really relevant under Sandalphon
    if(typeof SandalphonToolMode == 'undefined')
    {
      this.parent(el, options);
    }
    else
    {
      this.parent(el, $merge(options, {
        generateElement: false
      }));
    }

    if(typeof SandalphonToolMode == 'undefined')
    {
      Sandalphon.load('/client/compiledViews/'+this.name, this.buildInterface.bind(this));
    }
  },


  buildInterface: function(ui)
  {
    // create the iframe where the console will live
    this.element = new IFrame({
      id: this.getId()
    });
    
    SSSetControllerForNode(this, this.element);
    this.element.injectInside(document.body);

    // finish initialization after iframe load
    this.element.addEvent('load', function() {
      var context = this.element.contentWindow;

      // under GM not wrapped, erg - David
      if(!context.$)
      {
        context = new Window(context);
        var doc = new Document(context.document);
      }

      // add the styles into the iframe
      Sandalphon.addStyle(ui.styles, context);
      
      // grab the interface, strip the outer level, we're putting the console into an iframe
      var fragment = Sandalphon.convertToFragment(ui['interface'], context).getFirst();
      
      // place it in the frame
      $(context.document.body).setProperty('class', this.name + 'FrameBody');
      $(context.document.body).grab(fragment);
      
      // activate the iframe context: create controllers hook up outlets
      Sandalphon.activate(context);
      
      // create the resizer
      this.initResizer();
    }.bind(this));
  },
  
});