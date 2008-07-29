var Sandalphon;

window.addEvent('domready', function() {
  // load the local store
  Sandalphon = new SandalphonClass(new Persist.Store('Sandalphon'));
});

var SandalphonClass = new Class({
  
  ClassPaths:
  {
    'SSTableViewDatasource': '/client/'
  },
  
  UIClassPaths:
  { 
    'SSTabView': '/client/views/SSTabView/',
    'SSTableView': '/client/views/SSTableView/',
    'SSTableRow': '/client/views/SSTableRow/'
  },
  
  UserClassPaths:
  {
    'SSCustomTableRow': '/client/'
  },


  initialize: function(storage)
  { 
    console.log('Sandalphon, sister of Metatron, starting up.');
    this.setStorage(storage);
    this.setupClassPaths();
    // for analyzing fragments
    this.setFragment(new Element('div'));
    this.initInterface();
  },
  
  
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
  
  
  storage: function()
  {
    return this.__storage__;
  },
  
  
  setStorage: function(storage)
  {
    this.__storage__ = storage;
  },
  
  
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
  
  
  fragment: function()
  {
    return this.__fragment__;
  },
  
  
  setFragment: function(frag)
  {
    this.__fragment__ = frag;
  },


  loadFile: function(path)
  {
    // save for later
    this.storage().set('lastInterfaceFile', path);
    
    // load the interface file
    new Request({
      url:  '..'+path,
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


  compile: function(className)
  {
    // ask the server to compile the file
    // they will be generated and added to a folder called views
    // the class will implement the interface as a new method
  },
  

  toggledCompiled: function()
  {
    
  },
  
  
  searchForClass: function()
  {
    
  },
  
  
  instantiateControllers: function()
  {
    console.log('Instantiating controllers for views.');
    var views = $('SSSandalphonContainer').getElements('*[uiclass]');
    views.each(function(aView) {
      new ShiftSpace.UI[aView.getProperty('uiclass')](aView);
    });
  },
  
  
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
