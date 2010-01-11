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
      path: null
    });
  },


  delayed: function()
  {
    return this.__delay;
  },
  
  
  setDelayed: function(delay)
  {
    this.__delay = delay;
  },

  
  initialize: function(el, options)
  {
    var delayed = false;
    if(el.get("tag") != "iframe")
    {
      delayed = true;
    }
    
    this.parent(el, $merge(options, {
      generateElement: false
    }));

    var url = String.urlJoin('client', this.options.location, this.name, this.name+'Frame.css'),
        p = SSLoadFile(url);
    if(!delayed)
    {
      this.onStyleLoad(p);
    }
    else
    {
      this.setDelayed(p);
    }
  },


  finish: function()
  {
    if(!this.delayed())
    {
      throw new Error("Not a delayed SSFramedView");
    }
    this.__delayediframe = new Element("iframe", {
      id: this.element.get("id"),
      "class": this.element.get("class"),
      events: {
        load: this.buildInterface.bind(this)
      }
    });
    return this.onStyleLoad(this.delayed());
  },
  

  show: function()
  {
    if(this.delayed())
    {
      this.finish();
      this.addEvent("load", this.show.bind(this));
      return false;
    }
    //SSLog("SSFramedView show", SSLogForce);
    this.parent();
    return true;
  },


  hide: function()
  {
    if(this.delayed())
    {
      return false;
    }
    else
    {
      this.parent();
      return true;
    }
  },


  isVisible: function()
  {
    if(this.delayed()) return false;
    return this.parent();
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
    
    if(this.__delayediframe)
    {
      this.__delayediframe.replaces(this.element);
      this.element = this.__delayediframe;
      SSSetControllerForNode(this, this.element);
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
    this.setDelayed(false);
  },
  
  
  subViews: function()
  {
    return this.contentWindow().$$('*[uiclass]').map(SSControllerForNode);
  }
  
});