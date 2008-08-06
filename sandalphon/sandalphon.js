var Sandalphon;

window.addEvent('domready', function() {
  waitForConsole();
});

function waitForConsole()
{
  if(!window.console || !window.console.log)
  {
    setTimeout(waitForConsole, 1000);
  }
  else
  {
    // load the local store
    Sandalphon = new SandalphonClass(new Persist.Store('Sandalphon'));
  }
}

var SandalphonClass = new Class({
  
  // paths to required ShiftSpace files
  ClassPaths:
  {
    'SSTableViewDatasource': '/client/'
  },
  
  // paths to view controllers
  UIClassPaths:
  { 
    'SSTabView': '/client/views/SSTabView/',
    'SSTableView': '/client/views/SSTableView/',
    'SSTableRow': '/client/views/SSTableRow/'
  },
  
  // path to user defined view controllers
  UserClassPaths:
  {
    'SSCustomTableRow': '/client/'
  },


  initialize: function(storage)
  { 
    console.log('Sandalphon, sister of Metatron, starting up.');
    // setup the persistent storage
    this.setStorage(storage);
    // initialize the classpath
    this.setupClassPaths();
    // for analyzing fragments of markup
    this.setFragment(new Element('div'));
    // intialize the interface
    this.initInterface();
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
          this.storage().set('UIClassPaths', JSON.encode(this.UIClassPaths));
          this.storage().set('ClassPaths', JSON.encode(this.UIClassPaths));
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
    for(var className in this.ClassPaths)
    {
      var path = '..' + this.ClassPaths[className] + className;
      new Asset.javascript(path+'.js');
    }

    for(var className in this.UIClassPaths)
    {
      var path = '..' + this.UIClassPaths[className] + className;
      new Asset.css(path+'.css');
      new Asset.javascript(path+'.js');
    }
    
    for(var className in this.UserClassPaths)
    {
      var path = '..' + this.UserClassPaths[className] + className;
      new Asset.css(path+'.css');
      new Asset.javascript(path+'.js');
    }
    
    console.log('Class files loaded.');
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
        this.loadFile($('loadFileInput').getProperty('value'));
      }
    }.bind(this));
    
    $('loadFile').addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      this.loadFile($('loadFileInput').getProperty('value'));
    }.bind(this));
    
    // attach test events
    $('loadTestInput').addEvent('keyup', function(_evt) {
      var evt = new Event(_evt);
      if(evt.key == 'enter')
      {
        this.loadFile($('loadTestInput').getProperty('value'));
      }
    }.bind(this));
    
    $('loadTestFile').addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      this.loadTest($('loadTestInput').getProperty('value'));
    }.bind(this));
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
  loadFile: function(path)
  {
    // save for later
    this.storage().set('lastInterfaceFile', path);
    
    new Asset.css('..'+path+'.css');

    // load the interface file
    new Request({
      url:  '..'+path+'.html',
      method: 'get',
      onSuccess: function(responseText, responseXML)
      {
        if(this.analyze(responseText))
        {
          // empty it out first
          $('SSSandalphonContainer').empty();
          // load the new file
          $('SSSandalphonContainer').set('html', responseText);
          this.instantiateControllers();
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
    }).send();
  },
  
  /*
    Function: loadTest
      Loads a test file.
    
    Parameters:
      path - the path to the test file as a string.  The path should be absolute from the root ShiftSpace directory.
  */
  loadTest: function(path)
  {
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
          eval(responseText);            
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

  // Not implemented yet
  compile: function(className)
  {
    // ask the server to compile the file
    // they will be generated and added to a folder called views
    // the class will implement the interface as a new method
  },
  
  // Not implemented yet.
  toggledCompiled: function()
  {
    
  },
  
  // Not implemented yet.
  searchForClass: function()
  {
    
  },
  
  /*
    Function: instantiateControllers
      Instantiate any backing JS view controllers for the interface.
  */
  instantiateControllers: function()
  {
    console.log('Instantiating controllers for views.');
    var views = $('SSSandalphonContainer').getElements('*[uiclass]');
    views.each(function(aView) {
      new ShiftSpace.UI[aView.getProperty('uiclass')](aView);
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
      missingClasses = (this.ClassPaths[x] == null && this.UIClassPaths[x] == null && this.UserClassPaths[x] == null);
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
