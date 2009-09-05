var SSTestRunnerClass = new Class({
  
  Implements: [Events, Options],
  
  initialize: function()
  {
  },
  
  
  createMouseEventForNode: function(eventType, node)
  {
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    node.dispatchEvent(evt);
  },

  
  loadTest: function(path)
  {
    var components = path.split("/");
    var testname = components.getLast();
    var base = testname.split('.')[0];
    
    new Request({
      url: "../builder/build_test.php?test=" + base,
      method: "get",
      onComplete: function(responseText, responseXML)
      {
        // reset the SSUnitTest
        SSUnitTest.reset();

        // evaluate test
        try
        {
          var result = eval(responseText);
        }
        catch(err)
        {
          console.error(err, "could not load test.");
          return;
        }

        if(result && result.error)
        {
          alert(result.error);
          return;
        }

        // load the TestCase or TestSuite instance
        var testInstance = eval(base);
        new testInstance(); // the initialize method in SSUnitTest.TestCase adds itself to the list of testcases
        $('SSTestRunnerOutput').empty();

        // run all the tests
        var f = new SSUnitTest.ResultFormatter.BasicDOM({container:$('SSTestRunnerOutput')});
        SSUnitTest.main({formatter:f});

      }.bind(this),
      onFailure: function(responseText, responseXML)
      {
        
      }.bind(this)
    }).send();
  }
});

var SSTestRunner = new SSTestRunnerClass();