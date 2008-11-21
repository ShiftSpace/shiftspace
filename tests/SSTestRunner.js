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
    // first look for the file in the package json
    
    // notify if we don't find it
    
    // if we do find it, we need to first load any dependencies
    
    // look for the file in the local directory

    // split the path components
    var components = path.split("/");
    var testname = components.getLast();
    var base = testname.split('.')[0];
    
    new Request({
      url: path,
      method: "get",
      onComplete: function(responseText, responseXML)
      {
        // reset the SSUnitTest
        SSUnitTest.reset();
        
        // evaluate test
        eval(responseText);
        
        // load the class
        var testInstance = eval(base);
        
        // david, you are such a hacker.
        // the initialize method in SSUnitTest.TestCase adds itself to the list of testcases
        new testInstance();
        
        $('SSSandalphonContainer').empty();
        
        // run all the tests

        SSUnitTest.setFormatter(new SSUnitTest.ResultFormatter.BasicDOM($('SSSandalphonContainer')));
        SSUnitTest.main({interactive:true});
        
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
