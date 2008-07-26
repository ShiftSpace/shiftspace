window.addEvent('domready', function() {
  new Sandalphon();
});

var Sandalphon = new Class({

  initialize: function()
  {
    console.log('Sandalphon, sister of Metatron, starting up.');

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
    
  },


  loadFile: function(fileName)
  {
    var path = '../' + fileName;

    // load the interface file
    new Request({
      url: path + '.html',
      method: 'get',
      onSuccess: function(responseText, responseXML)
      {
        // load the CSS file
        new Asset.css(path+'.css');
        console.log(responseText);
      },
      onFailure: function()
      {
        console.error('Oops could not load that file');
      }
    }).send();
  },


  compile: function(fileName)
  {
    // ask the server to compile the file
    // they will be generated and added to a folder called views
    // the class will implement the interface as a new method
  },
  

  toggledCompiled: function()
  {
    
  }
});
