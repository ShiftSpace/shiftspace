var SSTestRunner = new Class({
  
  Implements: [Events, Options],
  
  initialize: function()
  {
  },

  
  loadTest: function(path, env)
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
      url: "../builder/build_test.php?env=" + env + "&test=" + base,
      method: "get",
      onComplete: function(responseText, responseXML)
      {
        // reset the SSUnitTest
        SSUnitTest.reset();
        
        // evaluate test
        eval(responseText);
        
        // load the TestCase or TestSuite instance
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
