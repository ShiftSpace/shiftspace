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
        try
        {
          var testInstance = eval(base);
        }
        catch(err)
        {
          console.error(err, "could not instantiate test.");
          return;
        }
        var test = new testInstance(); // the initialize method in SSUnitTest.TestCase/TestSuite adds itself to the list of testcases
        console.log('test instance', test.name);
        $('SSTestRunnerOutput').empty();

        // run all the tests
        var f = new SSUnitTest.ResultFormatter.BasicDOM({container:$('SSTestRunnerOutput')});
        console.log('running tests');
        SSUnitTest.main({formatter:f});
        console.log('done');

      }.bind(this),
      onFailure: function(responseText, responseXML)
      {
        
      }.bind(this)
    }).send();
  }
});

var SSTestRunner = new SSTestRunnerClass();