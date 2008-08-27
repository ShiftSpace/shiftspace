var SandalphonClass = new Class({

  initialize: function(attribute)
  {
    // for analyzing fragments of markup
    this.setFragment(new Element('div'));
  },
  
  
  convertToFragment: function(markup, ctxt)
  {
    var context = ctxt || window;
    
    // generate the fragment in the context
    var fragment = context.$(context.document.createElement('div'));
    fragment.set('html', markup);
    
    // TODO: generalize to return markup that doesn't have a root node
    var markupFrag = $(fragment.getFirst().dispose());

    console.log('convertToFragment');
    console.log(markupFrag.getProperty('id'));
    
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
    var ui = {};
    
    var server = (ShiftSpace && ShiftSpace.info && ShiftSpace.info().server) || '..';
    console.log('load!');
    // load the interface file
    if(typeof SandalphonToolMode != 'undefined')
    {
      var interface = new Request({
        url:  server+path+'.html',
        method: 'get',
        onSuccess: function(responseText, responseXML)
        {
          ui.interface = responseText
          if(this.analyze(responseText))
          {
          }
          else
          {
            console.error('Error loading interface.');
          }
        }.bind(this),
        onFailure: function()
        {
          console.error('Oops could not load that interface file');
        }
      });
    
      var styles = new Request({
        url:  '..'+path+'.css',
        method: 'get',
        onSuccess: function(responseText, responseXML)
        {
          ui.styles = responseText;
        }.bind(this),
        onFailure: function()
        {
          console.error('Oops could not load that interface file');
        }
      });
      
      // Group HTMl and CSS calls
      var loadGroup = new Group(interface, styles);
      loadGroup.addEvent('complete', function() {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> load group done');
        console.log(ui);
        if(callback) callback(ui);
      });

      // fetch
      interface.send();
      styles.send();
    }
    else
    {
      loadFile(path+'.html', function(rx) {
        ui.interface = rx.responseText;
        loadFile(path+'.css', function(rx) {
          ui.styles = rx.responseText;
          if(callback) callback(ui);
        });
      });
    }

  },
  
  
  addStyle: function(css, ctxt) 
  {
    var context = ctxt || window;
    var contextDoc = context.document;
    
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> grabbing head');
    console.log(contextDoc.getElements);

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
    
    console.log('>>>>>>>>>>>>>>>>>> activate');
    console.log(context);
    
    // First instantiate all controllers
    this.instantiateControllers(context);
    // Initialize all outlets
    this.initializeOutlets(context);
    // Awake all objects
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

    views.each(function(aView) {
      var theClass = aView.getProperty('uiclass');
      console.log('Instantiating ' + theClass);
      new ShiftSpace.UI[theClass](aView);
      // notify any instantiation listeners
      SSNotifyInstantiationListeners(aView);
    });
    
  },
  
  
  contextQuery: function(context, sel)
  {
    console.log('contextQuery');
    return (context.$$ && context.$$(sel)) ||
           (context.getElements && context.getElements(sel)) ||
           [];
  },
  
  
  initializeOutlets: function(ctxt)
  {
    console.log('initializing outlets');
    var context = ctxt || window;
    
    var outlets = this.contextQuery(context, '*[outlet]');
    console.log(context);
    outlets.each(function(anOutlet) {
      // grab the outlet parent id
      var outletParentObject = anOutlet.getProperty('outlet');
      // grab the main view controller from the matching context
      if(context.$(outletParentObject))
      {
        var controller = context.$(outletParentObject).retrieve('__ssviewcontroller__');
        controller.addOutlet(anOutlet);
      }
      else if(context != window && $(outletParentObject))
      {
        // check if there's a match in the top window
        var controller = $(outletParentObject).retrieve('__ssviewcontroller__');
        controller.addOutlet(anOutlet);
      }
    });
    
    // if iframe context let all object know via their awakeDelayed method
    if(context != window)
    {
      this.awakeObjectsDelayed(context);
    }
  },
  
  
  awakeObjects: function(context)
  {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>> awake objects');
    ShiftSpace.Objects.each(function(object, objectId) {
      if(object.awake) object.awake(context);
    });
  },
  
  
  awakeObjectsDelayed: function(context)
  {
    ShiftSpace.Objects.each(function(object, objectId) {
      if(object.awakeDelayed) object.awakeDelayed(context);
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
     console.log('Sandalphon, sister of Metatron, starting up.');
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
     console.log('load localized strings ' + lang);
     new Request({
       url: "../client/LocalizedStrings/"+lang+".js",
       method: "get",
       onComplete: function(responseText, responseXML)
       {
         console.log(lang + " - " + ShiftSpace.lang);
         if(lang != ShiftSpace.lang)
         {
           ShiftSpace.localizedStrings = JSON.decode(responseText);
           console.log(ShiftSpace.localizedStrings);

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
     console.log('Initializing interface');

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
           console.log('Initializing class paths.');
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

     console.log('Class files loaded.');
   },
   
   /*
     Function: loadTest
       Loads a test file.

     Parameters:
       path - the path to the test file as a string.  The path should be absolute from the root ShiftSpace directory.
   */
   loadTest: function(path)
   {
     console.log('Loading test file');
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
           console.log('Evaluating test');
           eval(responseText);         
           console.log('Running test');   
           this.runTest()  
         }
         catch(exc)
         {
           console.log(exc);
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
