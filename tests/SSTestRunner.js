var SSTestRunner = new Class({
  
  Implements: [Events, Options],
  
  initialize: function()
  {
    this.loadPackages();
  },

  
  setPackages: function(packages)
  {
    this.__packages = packages;
  },
  
  
  packages: function()
  {
    return this.__packages;
  },
    
  
  loadPackages: function()
  {
    // load the package json
    new Request({
      url: "../config/packages.json",
      method: "get",
      onComplete: function(responseText, responseXML)
      {
        this.setPackages(JSON.decode(responseText));
      }.bind(this),
      onFailure: function(responseText, responseXML)
      {
        console.error("Error: could not load packages.json file");
      }.bind(this)
    }).send();
  },
  
  
  loadTest: function(path)
  {
    // split the path components
    var components = path.split("/");
    var testname = components.getLast();
    var base = testname.split('.')[0];
    
    new Request({
      url: path,
      method: "get",
      onComplete: function(responseText, responseXML)
      {
        eval(responseText);
        var testInstance = eval(base);
        new testInstance();
        
        // run all the tests
        SSUnitTest.main();
      }.bind(this),
      onFailure: function(responseText, responseXML)
      {
        
      }.bind(this)
    }).send();
  },
  
  
  run: function()
  {
    
  }
  
});