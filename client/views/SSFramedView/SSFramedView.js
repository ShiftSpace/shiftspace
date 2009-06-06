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
      SSLoadFile('client/customViews/'+this.name+'/'+this.name+'Frame.css', this.onStyleLoad.bind(this));
    }
  },
  
  
  onStyleLoad: function(response)
  {
    var style = response.responseText;
    if(style) Sandalphon.addStyle(style);
    Sandalphon.load('/client/customViews/'+this.name+'/'+this.name, this.onInterfaceLoad.bind(this))
  },
  
  
  onInterfaceLoad: function(ui) 
  {
    this.ui = ui;
    this.element = new IFrame({
      'class': this.name+'Frame'
    });
    
    var frag = Sandalphon.convertToFragment(this.ui['interface']);
    var id = frag.getProperty('id');
    if(id)
    {
      this.element.setProperty('id', id);
    }
    
    SSSetControllerForNode(this, this.element);
    this.element.injectInside(document.body);
    this.element.addEvent('load', this.buildInterface.bind(this));
  },
  
  
  document: function()
  {
    return this.element.contentDocument;
  },
  
  
  window: function()
  {
    return this.element.contentWindow;
  },
  
  
  buildInterface: function()
  {
    SSLog('buildInterface SSFramedView', SSLogForce);
    
    var context = this.element.contentWindow;
    var doc = context.document;
    
    // store the name on the window for debugging
    context.__ssname = this.element.getProperty('id');
    context.__sscontextowner = this;
    
    // under GM not wrapped, erg - David
    if(!context.$)
    {
      context = new Window(context);
      doc = new Document(context.document);
    }
    
    Sandalphon.addStyle(this.ui.styles, context);
    
    var children = Sandalphon.convertToFragment(this.ui['interface'], context).getChildren();
    
    $(context.document.body).setProperty('class', this.name + 'FrameBody');
    $(context.document.body).adopt.apply($(context.document.body), children);
    
    Sandalphon.activate(context);
  }
  
});