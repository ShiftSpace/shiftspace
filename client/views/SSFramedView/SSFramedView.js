// ==Builder==
// @uiclass
// @package           ShiftSpaceCoreUI
// @dependencies      SSView
// ==/Builder==

var SSFramedView = new Class({
  
  Extends: SSView,
  name: 'SSFramedView',
  
  
  defaults: function()
  {
    return $merge(this.parent(), {
      location: 'views',
      path: null,
      delayed: false
    });
  },
  
  
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
      var url = String.urlJoin('client', this.options.location, this.name, this.name+'Frame.css'),
          p = SSLoadFile(url);
      this.onStyleLoad(p);
    }
  },
  
  
  onStyleLoad: function(css)
  {
    if(css) Sandalphon.addStyle(css);
    var url;
    if(this.options.path)
    {
      url = String.urlJoin(this.options.path, this.name+'Main');
    }
    else
    {
      url = String.urlJoin('client', this.options.location, this.name, this.name);      
    }
    var p = Sandalphon.load(url);
    this.onInterfaceLoad(p);
  }.asPromise(),
  
  
  onInterfaceLoad: function(ui) 
  {
    var generateElement = false;
    this.ui = ui;

    if(!this.element)
    {
      generateElement = true;
      this.element = new IFrame({
        'class': this.name+'Frame',
        events: {
          load: this.buildInterface.bind(this)
        }
      });
    }
    
    var frag = Sandalphon.convertToFragment(this.ui['interface']),
        id = frag.getProperty('id');
    
    if(id)
    {
      this.element.setProperty('id', id);
    }

    if(generateElement)
    {
      SSSetControllerForNode(this, this.element);
      this.element.injectInside(document.body);
    }
    else
    {
      this.buildInterface();
    }
  }.asPromise(),
  
  
  contentDocument: function()
  {
    return new Document(this.element.contentDocument);
  },
  
  
  contentWindow: function()
  {
    return new Window(this.element.contentWindow);
  },
  
  
  buildInterface: function()
  {
    var context = this.contentWindow(),
        doc = this.contentDocument();
    
    // forward key up and down events to parent window
    context.addEvent('keyup', function(evt) {
      evt = new Event(evt);
      SSFireEvent('keyup', evt);
    });

    context.addEvent('keydown', function(evt) {
      evt = new Event(evt);
      SSFireEvent('keydown', evt); 
    });
    
    this.element.getElement = function(sel) {
      return this.contentWindow().$$(sel)[0];
    }.bind(this);
    
    this.element.getElements = function(sel) {
      return this.contentWindow().$$(sel);
    }.bind(this);
    
    // store the name on the window for debugging
    context.__ssname = this.element.getProperty('id');
    context.__sscontextowner = this;
    
    Sandalphon.addStyle(this.ui.styles, context);
    
    var children = Sandalphon.convertToFragment(this.ui['interface'], context).getChildren();
    
    $(doc.body).setProperty('class', this.name + 'FrameBody');
    $(doc.body).adopt.apply($(doc.body), children);
    
    Sandalphon.activate(context);
  },
  
  
  subViews: function()
  {
    return this.contentWindow().$$('*[uiclass]').map(SSControllerForNode);
  }
  
});