// ==Builder==
// @uiclass
// @package           ShiftSpaceCoreUI
// @dependencies      SSView
// ==/Builder==


// this is a work around for framed views
// so that they don't create their iframes
// until they are actually shown for the
// very first time

function ssfv_ensure(fn) {
  return function decorator() {
    var args = arguments;
    if(this.delayed())
    {
      this.addEvent("load", function() {
        var temp = this._current;
        this._current = decorator._wrapper;
        fn.apply(this, args);
        this._current = temp;
      }.bind(this));
      this.finish();
    }
    else
    {
      var temp = this._current;
      this._current = decorator._wrapper;
      fn.apply(this, args);
      this._current = temp;
    }
  };
};


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

  /*
    Function: delayed
      Getter for the delayed property.
  */
  delayed: function()
  {
    return this.__delay;
  },
  
  /*
    Function: setDelayed
      *private*
      Private setter for the delayed property.

    See Also:
      finish, delayed
  */
  setDelayed: function(delay)
  {
    this.__delay = delay;
  },

  /*
    Function: finish
      Triggers a delayd SSFramedView to actually load
      it's content.

    Returns:
      A promise.
  */
  finish: function()
  {
    if(this.__isFinishing) return;
    this.__isFinishing = true;
    if(!this.delayed())
    {
      throw new Error("Not a delayed SSFramedView");
    }
    return this.onStyleLoad(this.delayed());
  },
  

  show: function()
  {
    this.parent();
  },


  hide: function()
  {
    this.parent();
  },


  isVisible: function()
  {
    return this.parent() && this.isLoaded();
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

    if(!this.element || this.delayed())
    {
      generateElement = true;
      if(this.delayed()) this.oldElement = this.element;
      this.element = new IFrame({
        'class': this.name+'Frame',
        events: {
          load: this.buildInterface.bind(this)
        }
      });
      if(this.delayed()) this.element.set("id", this.oldElement.get("id"));
    }
    
    var frag = Sandalphon.convertToFragment(this.ui['interface']),
        id = frag.getProperty('id');
    
    if(id && !this.delayed())
    {
      this.element.setProperty('id', id);
    }

    if(generateElement)
    {
      if(!this.delayed())
      {
        this.element.injectInside(document.body);
      }
      else
      {
        this.element.replaces(this.oldElement);
        delete this.oldElement;
      }
      SSSetControllerForNode(this, this.element);
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