// ==Builder==
// @required         
// @dependencies      SSException
// @package           System
// ==/Builder==

var SSSandalphonError = SSException;

SSSandalphonError.NoSuchResource = new Class({
  Extends: SSSandalphonError,
  name: "SSSandalphonError.NoSuchResource"
});

/*
  Class: Sandalphon
    A singleton class that associates JavaScript controllers with DOM nodes. Also
    provides bindings from DOM nodes to JavaScript controller or even bindings
    from JavaScript controller to JavaScript controller.
*/
var SandalphonClass = new Class({

  initialize: function()
  {
    // for analyzing fragments of markup
    this.setFragment(new Element('div'));
  },
  
  /*
    Function: reset
      Reset Sandalphon. This wipes out any and all outlet
      bindings. It clears the controllers table and clears
      the object table.
  */
  reset: function()
  {
    SSClearControllersTable();
    SSClearObjects();
  },
  
  /*
    Function: convertToFragment
      Converts a markup to into an HTML fragment.
      
    Parameters:
      markup - an string of HTML markup string.
      ctxt - a context, a window object.
      
    Returns:
      a DOM element.
  */
  convertToFragment: function(markup, ctxt)
  {
    var context = ctxt || window;
    var fragment = context.$(context.document.createElement('div'));
    fragment.set('html', markup);
    // TODO: generalize to return markup that doesn't have a root node
    var markupFrag = $(fragment.getFirst().dispose());
    fragment.destroy();
    return markupFrag;
  },
  
  /*
    Function: fragment
      Returns the private fragment node.
    
    Returns:
      The fragment node.
  */
  fragment: function()
  {
    return this.__fragment;
  },
  
  /*
    Function:
      Sets the private fragment node.
  */
  setFragment: function(frag)
  {
    this.__fragment = frag;
  },
  
  /*
    Function: compileAndLoad
      *deprecated*
      Takes a path to a Sandalphon resource (a .html and .css file with the same name)
      Returns via the callback an object which has two properties, 'interface' and 'styles'.
      'styles' can be added to the document via Sandalphon.addStyle. 'interface' is
      a string which should be used with the innerHTML or the MooTools set html form.
      This also processes the HTML file with sandalphon.py.
      
    Parameters:
      path - a path to a file, do not include the .html or .css extension. Should be absolute from the ShiftSpace directory.
      callback - the callback handler to which the user interface object will get passed to.
      
    See Also:
      loadFile
  */
  compileAndLoad: function(path, callback)
  {
    var request = new Request({
      url: "../sandalphon/compile_and_load.php",
      async: false,
      method: "get",
      data: { filepath: "../" + path + ".html" },
      onComplete: function(responseText, responseXml)
      {
        if(responseText == "")
        {
          SSLog('No resource at path: ' + path, SSLogError);
          throw new SSSandalphonError.NoSuchResource(new Error(), "No resource at path:" + path);
        }
        
        var escapedUI = JSON.decode(responseText);
        callback({"interface":unescape(escapedUI['interface']), styles:unescape(escapedUI.styles)});
      },
      onFailure: function(responseText, responseXml)
      {
      }
    });
    request.send();
  },
  

  /*
    Function: load
      Loads an interface file from the speficied path, does not compile.
    
    Parameters:
      path - a file path as string. This path should be absolute from the root ShiftSpace directory.
      
    Returns:
      A promise for the html and css of the interface file.
  */
  load: function(path)
  {
    var server = (SSInfo && SSInfo().mediaPath) || '..';
    return new Promise({"interface": SSLoadFile(String.urlJoin(server, path+'.html')),
                        styles: SSLoadFile(String.urlJoin(server, path+'.css'))});
  },
  
  /*
    Function: addStyle
      Adds a style string to the document with a dynamically added style element.
      
    Parameters:
      css - a string of valid CSS.
      ctxt - a window object where the style will be added.
  */
  addStyle: function(css, ctxt) 
  {
    var context = ctxt || window;
    var contextDoc = context.document;
    
    if (context.$$('head').length != 0) 
    {
      var head = context.$$('head')[0];
    } 
    else 
    {
      var head = context.$(contextDoc.createElement('head'));
      head.injectBefore($(contextDoc.body));
    }
    
    // Add some base styles
    css += "                          \
      .SSDisplayNone                  \
      {                               \
        display: none;                \
      }                               \
      .SSUserSelectNone               \
      {                               \
        -moz-user-select: none;       \
        user-select: none;            \
        -webkit-user-select: none;    \
      }                               \
    ";
    
    if(!Browser.Engine.trident)
    {
      var style = context.$(contextDoc.createElement('style'));
      style.setProperty('type', 'text/css');
      style.appendText(css);
      style.injectInside(head);
    }
    else
    {
      var style = contextDoc.createStyleSheet();
      style.cssText = css;
    }
  },
  
  /*
    Function: activate
      Activates a context. This will find all uiclass backed DOM elements
      and instantiate any controllers with that matching DOM element. Also
      binds any outlets. Also call awake on every object.
    
    Parameters:
      ctxt - a window object or DOM element.
  */
  activate: function(ctxt)
  {
    var context = ctxt || window;
        bindings = this.generateOutletBindings(context);
    this.instantiateControllers(context);
    this.bindOutlets(bindings);
    this.awakeObjects(context);
    if(ctxt.__sscontextowner)
    {
      ctxt.__sscontextowner.onContextActivate(ctxt);
    }
  },
  
  /*
    Function: associate
      Takes a controller and valid HTML markup and creates
      a DOM element and attaches a controller.
      
    Parameters:
      controller - a Javascript controller object, generally SSView or a subclass.
      interface - a string of valid HTML markup.
  */
  associate: function(controller, interfaceMarkup)
  {
    controller.element = Sandalphon.convertToFragment(interfaceMarkup);
    SSSetControllerForNode(controller, controller.element);
    return controller.element;
  },
  
  /*
    Function: instantiateControllers
      Instantiate any backing JS view controllers for the interface.
      
    Parameters:
      ctxt - a window object or a DOM element.
  */
  instantiateControllers: function(ctxt)
  {
    var context = ctxt || window;
    var views = this.contextQuery(context, '*[uiclass]');
    views.each(function(aView) {
      var theClass = aView.getProperty('uiclass');
      new ShiftSpaceUI[theClass](aView, {
        context: context
      });
    });
    views.each(SSNotifyInstantiationListeners);
  },
  
  /*
    contextQuery:
      A function which will run the MooTools $$ function against any
      object, whether a Window object or a DOM element.
      
    Parameters:
      context - a window object or DOM element.
      sel - a valid CSS3 selector that is supported by MooTools.
      
    Returns:
      An array of DOM nodes. See the $$ in the MooTools documentation.
  */
  contextQuery: function(context, sel)
  {
    return (context.$$ && context.$$(sel)) ||
           (context.getElements && context.getElements(sel)) ||
           [];
  },
  
  /*
    generateOutletBindings:
      Creates the outlet bindings for a context. Finds all the outlet
      mappings and associates them to a target controller.
      
    Parameters:
      ctxt - a  window object or DOM element.
  */
  generateOutletBindings: function(ctxt)
  {
    // grab the right context, grab all outlets
    var context = ctxt || window,
        outlets = this.contextQuery(context, '*[outlet]');
    
    return outlets.map(function(anOutlet) {
      var outletTarget, sourceName;
      // grab the outlet parent id
      var outlet = anOutlet.getProperty('outlet').trim();
      // if not a JSON value it's just the id
      if(outlet[0] != '{')
      {
        outletTarget = outlet;
        sourceName = anOutlet.getProperty('id');
      }
      else
      {
        // otherwise JSON decode it in safe mode
        // FIXME: should be in safe mode - David
        var outletBinding = JSON.decode(outlet);
        outletTarget = outletBinding.target;
        sourceName = outletBinding.name;
      }
      return {
        sourceName: sourceName,
        source: anOutlet,
        targetName: outletTarget,
        context: context
      };
    }.bind(this));
  },
  
  /*
    bindOutlets:
      Binds all controllers and/or elements to the target controller.
  */
  bindOutlets: function(bindings)
  {
    // bind each outlet
    bindings.each(function(binding) {
      // get the real window context
      var context = ($type(binding.context) == 'window' && binding.context) ||
                    ($type(binding.context) == 'element' && binding.context.getWindow()),
          sourceName = binding.sourceName,
          source = binding.source,
          targetName = binding.targetName;
      // first check frame then check parent window    
      var target = context.$(targetName) || (context != window && $(targetName));
      if(!target) target = source.getParent(targetName);
      if(!target)
      {
        // throw an exception
        SSLog('Sandalphon bindOutlets, binding target does not exist! ' + targetName, SSLogError);
        SSLog(source, SSLogError);
        // bail
        return;
      }
      // check for a controller on the source
      if(SSControllerForNode(source)) source = SSControllerForNode(source);
      SSControllerForNode(target).addOutletWithName(sourceName, source);
    }.bind(this));
  },
  
  /*
    awakeObjects:
      Call beforeAwake, awake, and afterAwake on all instantiated controllers.
      All of an object's bindings are guaranteed to be bound by awake. If you wish
      to access the bindings of bound objects you must do this from afterAwake.
    
    Parameters:
      context - a window object or DOM element.
  */
  awakeObjects: function(context)
  {
    // set up superview relationships
    ShiftSpaceObjects.each(function(object, objectId) {
      if(object.__awake__) object.__awake__(context);
    });

    // set any delegate references
    ShiftSpaceObjects.each(function(object, objectId) {
      if(object.beforeAwake) object.beforeAwake(context);
    });

    // awake all the objects
    ShiftSpaceObjects.each(function(object, objectId) {
      if(object.awake && !object.isAwake())
      {
        object.awake(context);
        object.setIsAwake(true);
        object.fireEvent('onAwake');
      }
    });
    
    // post awake, all outlets set
    ShiftSpaceObjects.each(function(object, objectId) {
      if(object.afterAwake)
      {
        object.afterAwake(context);
      }
    });
    
    // send all notifications
    ShiftSpaceObjects.each(function(object, objectId) {
      SSFlushNotificationQueueForObject(object);
    });
  }
});
var Sandalphon = new SandalphonClass();