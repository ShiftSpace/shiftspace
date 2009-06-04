// ==Builder==
// @uiclass
// @required
// @package           ShiftSpaceCoreUI
// @dependencies      SSView
// ==/Builder==

var SSFramedView = new Class({
  
  Extends: SSView,

  name: 'SSFramedView',
  
  initialize: function(el, options)
  { 
    // Check for Sandalphon Mode
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
      SSLog('SSFramedView loading ' + this.name, SSLogForce);
      Sandalphon.load('/client/compiledViews/'+this.name, this.onInterfaceLoad.bind(this));
    }
  },
  
  
  onInterfaceLoad: function(ui) 
  {
    this.ui = ui;
    this.element = new IFrame({
      id: this.getId()
    });
    SSSetControllerForNode(this, this.element);
    this.element.injectInside(document.body);
    this.element.addEvent('load', this.buildInterface.bind(this));
  },
  
  
  buildInterface: function()
  {
    var context = this.element.contentWindow;

    // under GM not wrapped, erg - David
    if(!context.$)
    {
      context = new Window(context);
      var doc = new Document(context.document);
    }

    Sandalphon.addStyle(this.ui.styles, context);
    
    var fragment = Sandalphon.convertToFragment(this.ui['interface'], context).getFirst();
    
    $(context.document.body).setProperty('class', this.uiclass + 'FrameBody');
    $(context.document.body).grab(fragment);
    
    Sandalphon.activate(context);
  }
  
});