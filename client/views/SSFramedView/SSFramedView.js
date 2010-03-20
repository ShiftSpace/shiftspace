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
      path: null,
      preloaded: false
    });
  },

  /*
     Function: initialize
       Initial the framed view with a DOM element. Valid options:
         location - where the ui markup for this framed view lives.
           Defaults to 'views'.
         preloaded - the ui and styles for this framed view do not
           need to be loaded. Defaults to false.

     Parameters:
       el - a DOM element. Should be div or an iframe element.
       options - a list of options
   */
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

    if(!this.options.preloaded)
    {
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
    }
    else
    {
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
    if(this.__isFinishing) return null;
    this.__isFinishing = true;
    if(!this.delayed())
    {
      throw new Error("Not a delayed SSFramedView");
      return null;
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
  
  /*
    Function: onStyleLoad
      Called when the style for the framed view has loaded. If you
      implement this in a subclass you must call this.parent().

    Parameters:
      css - the css for this framed view. 
  */
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
  
  /*
     Function: onInterfaceLoad
       Called when the ui markup has been loaded for this framed view.
       If you implement this in a subclass you must call this.parent().

     Parameters:
       ui - the markup for the framed view.
   */
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
  
  /*
    Function: contentDocument
      Return the Document object of the framed view.

    Returns:
      A Document.
  */
  contentDocument: function()
  {
    return new Document(this.element.contentDocument);
  },
  
  /*
    Function: contentWindow
      Return the Window object of the framed view.

    Returns:
      A Window.
  */
  contentWindow: function()
  {
    return new Window(this.element.contentWindow);
  },
  
  /*
     Function: buildInterface
       Called when the markup, styles, and frame have been loaded.
       Calls Sandalphon.activate on the contents on the framed view
       instantiating all uiclasses. If you implement this method in
       a subclass you must call this.parent()
   */
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
  
  /*
     Function: subViews
       Returns an array of this framed views subviews.

     Returns:
       An array of SSView instances.
   */
  subViews: function()
  {
    return this.contentWindow().$$('*[uiclass]').map(SSControllerForNode);
  }
});