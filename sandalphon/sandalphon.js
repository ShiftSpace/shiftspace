var SandalphonClass = new Class({

  initialize: function(attribute)
  {
    // for analyzing fragments of markup
    this.setFragment(new Element('div'));
    this.outletBindings = [];
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
    
    var server = (ShiftSpace && ShiftSpace.info && ShiftSpace.info().server) || '..';
    //console.log('load!');
    // load the interface file
    if(typeof SandalphonToolMode != 'undefined')
    {
      var interfaceCall = new Request({
        url:  server+path+'.html',
        method: 'get',
        onComplete: function(responseText, responseXML)
        {
          interface = responseText;
        }.bind(this),
        onFailure: function()
        {
          console.error('Oops could not load that interface file');
        }
      });
      
      var stylesCall = new Request({
        url:  '..'+path+'.css',
        method: 'get',
        onComplete: function(responseText, responseXML)
        {
          styles = responseText;
        }.bind(this),
        onFailure: function()
        {
          console.error('Oops could not load that interface file');
        }
      });
    
      
      // Group HTMl and CSS calls
      var loadGroup = new Group(interfaceCall, stylesCall);
      loadGroup.addEvent('complete', function() {
        //console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> load group done');
        if(callback) callback({interface:interface, styles:styles});
      });

      // fetch
      interfaceCall.send();
      stylesCall.send();
    }
    else
    {
      // just use loadFile if we're running in ShiftSpace
      loadFile(path+'.html', function(rx) {
        interface = rx.responseText;
        loadFile(path+'.css', function(rx) {
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
    var style = context.$(contextDoc.createElement('style'));
    style.setProperty('type', 'text/css');
    
    style.appendText(css);
    style.injectInside(head);
  },
  
  
  activate: function(ctxt)
  {
    var context = ctxt || window;
    
    SSLog('>>>>>>>>>>>>>>>>>> activate', SSLogSandalphon);
    
    // First generate the outlet bindings
    this.generateOutletBindings(context);
    // First instantiate all controllers
    this.instantiateControllers(context);
    // Initialize all outlets
    this.bindOutlets(context);
    this.awakeObjects(context);
  },
  
  
  /*
    Function: instantiateControllers
      Instantiate any backing JS view controllers for the interface.
  */
  instantiateControllers: function(ctxt)
  {
    var context = ctxt || window;
    
    var views = this.contextQuery(context, '*[uiclass]');
    
    // instantiate all objects
    views.each(function(aView) {
      var theClass = aView.getProperty('uiclass');
      new ShiftSpace.UI[theClass](aView);
    });
    
    // notify all listeners
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

    // TODO: need to figure out what the outlets are going to be BEFORE instantiating controllers

    outlets.each(function(anOutlet) {
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
      
      var context = binding.context,
          sourceName = binding.sourceName,
          source = binding.source,
          targetName = binding.targetName;
      
      // check the context, and the top level window    
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
    ShiftSpace.Objects.each(function(object, objectId) {
      if(object.awake) object.awake(context);
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
      if(!missingClasses) missingClasses = (ShiftSpace.ClassPaths[x] == null && ShiftSpace.UIClassPaths[x] == null && ShiftSpace.UserClassPaths[x] == null);
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
     // initialize the classpath
     this.setupClassPaths();
     // intialize the interface
     this.initInterface();
     // load localised strings
     this.loadLocalizedStrings(this.Language);
   },


   loadLocalizedStrings: function(lang)
   {
     SSLog('load localized strings ' + lang, SSLogSandalphon);
     new Request({
       url: "../client/LocalizedStrings/"+lang+".js",
       method: "get",
       onComplete: function(responseText, responseXML)
       {
         SSLog(lang + " - " + ShiftSpace.lang, SSLogSandalphon);
         if(lang != ShiftSpace.lang)
         {
           ShiftSpace.localizedStrings = JSON.decode(responseText);
           SSLog(ShiftSpace.localizedStrings, SSLogSandalphon);

           // update objects
           ShiftSpace.Objects.each(function(object, objectId) {
             if(object.localizationChanged) object.localizationChanged();
           });

           // update markup
           $$(".SSLocalized").each(function(node) {

             var originalText = node.getProperty('title');

             if(node.get('tag') == 'input' && node.getProperty('type') == 'button')
             {
               node.setProperty('value', SSLocalizedString(originalText));
             }
             else
             {
               node.set('text', SSLocalizedString(originalText));              
             }

           }.bind(this));
         }

         ShiftSpace.lang = lang;
       },
       onFailure: function(response)
       {
         console.error('Error loading localized strings ' + response);
       }
     }).send();
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
     this.storage().get('lastTestFile', function(ok, value) {
       if(ok && value) $('loadTestInput').setProperty('value', value);
     });

     this.attachEvents();    
   },

   /*
     Function: setupClassPaths
       Loads the class paths.  Doesn't really do all that much now.
   */
   setupClassPaths: function()
   {
     // initialize the UIClassPaths var
     this.storage().get('UIClassPaths', function(ok, value) {
       if(ok)
       {
         /*
         if(!value)
         {
         */
           SSLog('Initializing class paths.', SSLogSandalphon);
           this.storage().set('UIClassPaths', JSON.encode(ShiftSpace.UIClassPaths));
           this.storage().set('ClassPaths', JSON.encode(ShiftSpace.ClassPaths));
         /*}
         else
         {
           console.log('Loading class paths.');
           this.UIClassPaths = JSON.decode('('+value+')');
         }*/
         this.loadClassFiles();
       }
     }.bind(this));
   },

   /*
     Function: loadClassFiles
       Loads all of the files pointed to in the class path dictionaries.
   */
   loadClassFiles: function()
   {
     for(var className in ShiftSpace.ClassPaths)
     {
       var path = '..' + ShiftSpace.ClassPaths[className] + className;
       new Asset.javascript(path+'.js');
     }

     for(var className in ShiftSpace.UIClassPaths)
     {
       var path = '..' + ShiftSpace.UIClassPaths[className] + className;
       new Asset.css(path+'.css');
       new Asset.javascript(path+'.js');
     }

     for(var className in ShiftSpace.UserClassPaths)
     {
       var path = '..' + ShiftSpace.UserClassPaths[className] + className;
       new Asset.css(path+'.css');
       new Asset.javascript(path+'.js');
     }

     SSLog('Class files loaded.', SSLogSandalphon);
   },
   
   /*
     Function: loadTest
       Loads a test file.

     Parameters:
       path - the path to the test file as a string.  The path should be absolute from the root ShiftSpace directory.
   */
   loadTest: function(path)
   {
     SSLog('Loading test file', SSLogSandalphon);
     // save for later
     this.storage().set('lastTestFile', path);

     // load the interface file
     new Request({
       url:  '..'+path,
       method: 'get',
       onSuccess: function(responseText, responseXML)
       {
         try
         {
           SSLog('Evaluating test', SSLogSandalphon);
           eval(responseText);         
           SSLog('Running test', SSLogSandalphon);   
           this.runTest()  
         }
         catch(exc)
         {
           SSLog(exc, SSLogError);
         }
       }.bind(this),
       onFailure: function()
       {
         console.error('Oops could not load that test file.');
       }
     }).send();
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

     // attach test events
     $('loadTestInput').addEvent('keyup', function(_evt) {
       var evt = new Event(_evt);
       if(evt.key == 'enter')
       {
         this.loadTest($('loadTestInput').getProperty('value'));
       }
     }.bind(this));

     $('loadTestFile').addEvent('click', function(_evt) {
       var evt = new Event(_evt);
       this.loadTest($('loadTestInput').getProperty('value'));
     }.bind(this));

     // attach events to localization switcher
     $('localizedStrings').addEvent('change', function(_evt) {
       var evt = new Event(_evt);
       this.loadLocalizedStrings($('localizedStrings').getProperty('value'));
     }.bind(this));
   },
   
   /*
      Function: compileFile
        Tell the server to compile the file
    */
   compileFile: function()
   {
     // grab the filepath
     var filepath = $('loadFileInput').getProperty('value');
     // save for later
     this.storage().set('lastInterfaceFile', filepath);

     new Request({
       url: "compile.php",
       data: {"filepath":'..'+filepath+'.html'},
       onComplete: function(responseText, responseXml)
       {
         var filename = filepath.split('/').getLast();
         Sandalphon.load('/client/compiledViews/'+filename, this.loadUI.bind(this));
       }.bind(this),
       onFailure: function(response)
       {
         console.error(response);
       }
     }).send();
   },
});
