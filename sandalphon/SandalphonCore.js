// ==Builder==
// @required
// @package           System
// ==/Builder==

var SandalphonClass = new Class({

  initialize: function(attribute)
  {
    // for analyzing fragments of markup
    this.setFragment(new Element('div'));
    this.outletBindings = [];
    this.contextHash = $H();
  },
  
  
  reset: function()
  {
    this.outletBindings = [];
    this.contextHash = $H();
    SSClearControllersTable();
    SSClearObjects();
  },
  
  /*
    Function: _genId
      Generate an object id.  Used for debugging.  The instance is indentified by this in the global
      ShiftSpaceObjects hash.
  */
  _genContextId: function()
  {
    return ('ctxtid_'+(Math.round(Math.random()*1000000+(new Date()).getMilliseconds())));
  },
  
  
  getContextId: function(ctxt)
  {
    if(!ctxt.ssctxtid)
    {
      ctxt.ssctxtid = this._genContextId();
    }
    return ctxt.ssctxtid;
  },
  

  contextForId: function(id)
  {
    return this.contextHash.get(id).context;
  },
  
  
  internContext: function(ctxt)
  {
    var ctxtId = this.getContextId(ctxt);
    if(!this.contextHash.get(ctxtId))
    {
      // default isReady to true, because some contexts aren't activated
      this.contextHash.set(ctxtId, {isReady:true, context:ctxt});
    }
    return ctxtId;
  },
  
  
  contextIsReady: function(ctxt)
  {
    // intern the context just in case
    this.internContext(ctxt);
    return this.contextHash.get(this.getContextId(ctxt)).isReady;
  },
  
  
  setContextIsReady: function(ctxtid, val)
  {
    this.contextForId(ctxtid).isReady = val;
  },
  
  
  convertToFragment: function(markup, ctxt)
  {
    var context = ctxt || window;
    
    // generate the fragment in the context
    var fragment = context.$(context.document.createElement('div'));
    fragment.set('html', markup);
    
    // TODO: generalize to return markup that doesn't have a root node
    var markupFrag = $(fragment.getFirst().dispose());

    //console.log('convertToFragment');
    //console.log(markupFrag.getProperty('id'));
    
    // destroy the temporary fragment
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
    return this.__fragment__;
  },
  
  /*
    Function:
      Sets the private fragment node.
  */
  setFragment: function(frag)
  {
    this.__fragment__ = frag;
  },
  
  
  compileAndLoad: function(path, callback)
  {
    var request = new Request({
      url: "../sandalphon/compile_and_load.php",
      async: false,
      method: "get",
      data: { filepath: "../" + path + ".html" },
      onComplete: function(responseText, responseXml)
      {
        var escapedUI = JSON.decode(responseText);
        callback({interface:unescape(escapedUI.interface), styles:unescape(escapedUI.styles)});
      },
      onFailure: function(responseText, responseXml)
      {
        
      }
    });
    request.send();
  },
  

  /*
    Function: loadFile
      Loads an interface file from the speficied path.
    
    Parameters:
      path - a file path as string.  This path should be absolute from the root ShiftSpace directory.
  */
  load: function(path, callback)
  {
    var interface;
    var styles;
    
    SSLog("Sandalphon LOAD " + path, SSLogSandalphon);
    
    var server = (SSInfo && SSInfo().server) || '..';
    //console.log('load!');
    // load the interface file
    if(typeof SandalphonToolMode != 'undefined')
    {
      var interfaceCall = new Request({
        url: server+path+'.html',
        method: 'get',
        onComplete: function(responseText, responseXML)
        {
          SSLog("Sandalphon interface call complete");
          interface = responseText;
        }.bind(this),
        onFailure: function()
        {
          console.error('Oops could not load that interface file');
        }
      });
      
      var stylesCall = new Request({
        url:  server+path+'.css',
        method: 'get',
        onComplete: function(responseText, responseXML)
        {
          SSLog("Sandalphon styles call complete");
          styles = responseText;
        }.bind(this),
        onFailure: function()
        {
          // we don't care if the interface file is missing
          stylesCall.fireEvent('complete');
        }
      });
      
      // Group HTMl and CSS calls
      var loadGroup = new Group(interfaceCall, stylesCall);
      loadGroup.addEvent('complete', function() {
        SSLog('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Sandalphon interface loda complete');
        if(callback) callback({interface:interface, styles:styles});
      });
      
      // fetch
      interfaceCall.send();
      stylesCall.send();
    }
    else
    {
      // just use loadFile if we're running in ShiftSpace
      SSLoadFile(path+'.html', function(rx) {
        interface = rx.responseText;
        SSLoadFile(path+'.css', function(rx) {
          styles = rx.responseText;
          if(callback) callback({interface:interface, styles:styles});
        });
      });
    }
  },
  
  
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
    /*
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
    */
    
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
  
  
  activate: function(ctxt)
  {
    var context = ctxt || window;
    
    // internalize this context
    var ctxtid = this.internContext(context);
    this.setContextIsReady(ctxtid, false);
    
    SSLog('>>>>>>>>>>>>>>>>>> activate', SSLogSandalphon);
    
    // First generate the outlet bindings
    this.generateOutletBindings(context);
    // First instantiate all controllers
    this.instantiateControllers(context);
    // Initialize all outlets
    this.bindOutlets(context);
    this.awakeObjects(context);
    
    // the context is ready now
    this.setContextIsReady(ctxtid, true);
  },
  
  
  associate: function(controller, interface)
  {
    controller.element = Sandalphon.convertToFragment(interface);
    SSSetControllerForNode(controller, controller.element);
    return controller.element;
  },
  
  
  /*
    Function: instantiateControllers
      Instantiate any backing JS view controllers for the interface.
  */
  instantiateControllers: function(ctxt)
  {
    SSLog('instantiateControllers', SSLogSandalphon);
    var context = ctxt || window;
    
    var views = this.contextQuery(context, '*[uiclass]');
    
    SSLog(views, SSLogSandalphon);  

    // instantiate all objects
    views.each(function(aView) {
      var theClass = aView.getProperty('uiclass');
      SSLog('=========================================');
      SSLog('instantiating ' + theClass, SSLogSandalphon);
      new ShiftSpaceUI[theClass](aView, {
        context: context
      });
      SSLog('instantation complete');
    });
    
    // notify all listeners
    SSLog('Notifying all listeners');
    views.each(SSNotifyInstantiationListeners);
  },
  
  
  contextQuery: function(context, sel)
  {
    return (context.$$ && context.$$(sel)) ||
           (context.getElements && context.getElements(sel)) ||
           [];
  },
  
  
  generateOutletBindings: function(ctxt)
  {
    // grab the right context, grab all outlets
    var context = ctxt || window;
    var outlets = this.contextQuery(context, '*[outlet]');
    
    outlets.each(function(anOutlet) {
      var outletTarget, sourceName;
      
      // grab the outlet parent id
      var outlet = anOutlet.getProperty('outlet').trim();
      
      SSLog(outlet, SSLogForce);
      
      // if not a JSON value it's just the id
      if(outlet[0] != '{')
      {
        outletTarget = outlet;
        sourceName = anOutlet.getProperty('id');
      }
      else
      {
        // otherwise JSON decode it in safe mode
        var outletBinding = JSON.decode(outlet);
        outletTarget = outletBinding.target;
        sourceName = outletBinding.name;
      }
      
      this.outletBindings.push({
        sourceName: sourceName,
        source: anOutlet,
        targetName: outletTarget,
        context: context
      });
      
    }.bind(this));
  },
  
  
  bindOutlets: function()
  {
    // bind each outlet
    this.outletBindings.each(function(binding) {
      
      // get the real window context
      var context = ($type(binding.context) == 'window' && binding.context) ||
                    ($type(binding.context) == 'element' && binding.context.getWindow()),
          sourceName = binding.sourceName,
          source = binding.source,
          targetName = binding.targetName;
      
      // first check frame then check parent window    
      var target = context.$(targetName) || (context != window && $(targetName));
        
      if(!target)
      {
        // check for parent with matching css selector
        target = source.getParent(targetName);
      } 
      
      if(!target)
      {
        // throw an exception
        console.error('Error: Sandalphon bindOutlets, binding target does not exist! ' + targetName);
        console.error(source);
        // bail
        return;
      }
      
      // check for a controller on the source
      if(SSControllerForNode(source))
      {
        source = SSControllerForNode(source);
      }
      
      SSControllerForNode(target).addOutletWithName(sourceName, source);
    }.bind(this));
    
    SSLog(this.outletBindings, SSLogSandalphon);
  },
  
  
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
  },
  
  
  /*
    Function: analyze
      Determine if all the required classes for the interface are available.
    
    Parameters:
      html - the interface markup as a string.
  */
  analyze: function(html)
  {
    this.fragment().set('html', html);
    
    var allNodes = this.fragment().getElements('*[uiclass]');
    
    var classes = allNodes.map(function(x){return x.getProperty('uiclass')});
    
    // First verify that we have a real path for each class
    var missingClasses = false;
    classes.each(function(x) {
      if(!missingClasses) missingClasses = (ShiftSpaceClassPaths[x] == null && ShiftSpaceUIClassPaths[x] == null && ShiftSpaceUserClassPaths[x] == null);
    }.bind(this));
    
    if(missingClasses) console.error('Error missing uiclasses.');
    
    if(missingClasses)
    {
      return false;
    }
    else
    {
      return true;
    }
  }
  
});
var Sandalphon = new SandalphonClass();


var SandalphonToolClass = new Class({
   Language: 'en',

   initialize: function(storage)
   { 
     SSLog('Sandalphon, sister of Metatron, starting up.', SSLogSandalphon);
     // setup the persistent storage
     this.setStorage(storage);
     this.initInterface();
   },

   /*
     Function: initInterface
       Loads the last used input paths as a convenience.
   */
   initInterface: function()
   {
     SSLog('Initializing interface', SSLogSandalphon);

     this.storage().get('lastInterfaceFile', function(ok, value) {
       if(ok && value) $('loadFileInput').setProperty('value', value);
     });

     this.attachEvents();    
   },

   
   /*
     Function: storage
       Accessor method.

     Returns:
       The persistent storage object.
   */
   storage: function()
   {
     return this.__storage__;
   },

   /*
     Function: setStorage
       Set the persistent storage object.

     Parameters:
       storage - A persistent storage object, provided by persist.js
   */
   setStorage: function(storage)
   {
     this.__storage__ = storage;
   },

   
   loadUI: function(ui)
   {
     //console.log(ui);
     // empty it out first
     $('SSSandalphonContainer').empty();
     // Add the style
     Sandalphon.addStyle(ui.styles);
     // load the new file
     $('SSSandalphonContainer').set('html', ui.interface);
     // activate the interface
     Sandalphon.activate();
   },

   /*
     Function: attachEvents
       Attach the gui events for the interface.
   */
   attachEvents: function()
   {
     // attach file loading events
     $('loadFileInput').addEvent('keyup', function(_evt) {
       var evt = new Event(_evt);
       if(evt.key == 'enter')
       {
         Sandalphon.load($('loadFileInput').getProperty('value'), this.loadUI.bind(this));
       }
     }.bind(this));

     // attach the compile events
     $('compileFile').addEvent('click', this.compileFile.bind(this));

     // attach events to localization switcher
     $('localizedStrings').addEvent('change', function(_evt) {
       var evt = new Event(_evt);
       SSLoadLocalizedStrings($('localizedStrings').getProperty('value'));
     }.bind(this));
   },
   
   /*
      Function: compileFile
        Tell the server to compile the file
    */
   compileFile: function()
   {
     // clear out all existing system data

     // grab the filepath
     var filepath = $('loadFileInput').getProperty('value');
     // save for later
     this.storage().set('lastInterfaceFile', filepath);

     new Request({
       url: "compile.php",
       data: {"filepath":'../'+filepath+'.html'},
       onComplete: function(responseText, responseXml)
       {
         var filename = filepath.split('/').getLast();
         Sandalphon.load('client/compiledViews/'+filename, this.loadUI.bind(this));
       }.bind(this),
       onFailure: function(response)
       {
         console.error(response);
       }
     }).send();
   }
});
