// ==Builder==
// @optional
// @name              SSUnitTest
// @package           Testing
// @dependencies      SSException
// ==/Builder==

// =============
// = NameSpace =
// =============

var SSUnitTestClass = new Class({

  initialize: function()
  {
    this.__testCases__ = [];
  },
  

  testCases: function()
  {
    return this.__testCases__;
  },


  addTestCase: function(caseName, theCase)
  {
    console.log('Adding ' + caseName)
    this.testCases().push($H({name:caseName || 'UntitledTestCase', testCase:theCase}));
  },
  
  
  main: function()
  {
    this.testCases().each(function(caseHash) {
      console.log(caseHash)
      caseHash.get('testCase').run();
    });
  }
  
});
var SSUnitTest = new SSUnitTestClass()

// ==============
// = Exceptions =
// ==============

SSUnitTest.Error = new Class({
  Extends: SSException,
  
  initialize: function(_error, message)
  {
    this.parent(_error);
    this.setMessage(message);
  }
});

SSUnitTest.AssertError = new Class({Extends: SSUnitTest.Error});
SSUnitTest.AssertEqualError = new Class({Extends: SSUnitTest.Error});
SSUnitTest.AssertNotEqualError = new Class({Extends: SSUnitTest.Extends});

// =======================
// = SSUnitTest.TestCase =
// =======================

SSUnitTest.TestCase = new Class({
  name: 'SSUnitTest.TestCase',
  
  
  initialize: function(dummy)
  {
    this.tests = $H();   
    this.testCount = 0;
    
    // to skip any properties defined on base class
    if(!dummy) 
    {
      this.dummy = new SSUnitTest.TestCase(true);
      // add this instance to SSUnitTest
      SSUnitTest.addTestCase(this.name, this);
    }
  },
  

  setup: function() 
  {
  },
  
  tearDown: function() 
  {
  },

  
  run: function()
  {
    // collect all the tests and build metadata
    this.collectTests();
    this.runTests();
    this.reportResults();
  },
  
  
  nameForTest: function(fn)
  {
    return fn.name
  },
  
  
  setNameForTest: function(fn, name)
  {
    fn.name = name;
  },
  
  
  collectTests: function()
  {
    // collect all object properties that have 'test' as the first four characters
    for(var propertyName in this)
    {
      if(!this.dummy[propertyName])
      {
        var property = this[propertyName];
      
        if(propertyName.search("test") == 0 && 
           $type(property) == 'function') 
        {
          var theTest = property,
              testName = propertyName;
                    
          // add it to the testing data
          var testData = $H();
          // add a new hash for this test
          this.tests.set(testName, testData);
          // set the name of the original function
          this.setNameForTest(theTest, testName);
          // set a bound function with the name set
          var boundTest = theTest.bind(this);
          this.setNameForTest(boundTest, testName);
          testData.set('function', boundTest);
        }
      }
    }
  },
  
  
  runTests: function()
  {
    this.tests.each(function(testData, testName){
      try
      {
        this.setup();
      }
      catch(err)
      {
        throw SSUnitTest.Error(err, "Uncaught exception in setup.");
      }
      
      try
      {
        testData.function();
      }
      catch(err)
      {
        throw SSUnitTest.Error(err, "Uncaught exception in test.");
      }
      
      // default to success, if the test failed this won't do anything
      this.setTestSuccess(testData.function);
      
      try
      {
        this.tearDown();
      }
      catch(err)
      {
        throw SSUnitTest.Error(err, "Uncaught exception in tearDwon.");
      }
    }.bind(this));
  },
  
  
  dataForTest: function(aTest)
  {
    return this.tests.get(this.nameForTest(aTest));
  },
  
  
  setTestSuccess: function(aTest)
  {
    var data = this.dataForTest(aTest);
    var success = data.get('success');
    
    // only set success if there isn't an existing value
    if(success == null)
    {
      data.set('success', true)
    }
  },
  
  
  setTestFail: function(aTest)
  {
    this.dataForTest(aTest).set('success', false);
  },
  
  
  assertThrows: function assertThrows(exception, fn)
  {
    // convert the argument list into an array
    var varargs = $A(arguments);
    // grab the remaining arguments
    var testArgs = varargs.slice(2, varargs.length);
    var caller = assertThrows.caller;
    
    try
    {
      fn.apply(null, testArgs);
    }
    catch(err)
    {
      if(err instanceof exception)
      {
        this.setTestSuccess(caller);
      }
      else
      {
        this.setTestFail(caller);
        throw err;
      }
    }
  },

  assert: function assertEquals(value)
  {
    if(arguments.length < 1) throw SSUnitTest.AssertError(new Error(), 'assert expects 1 arguments.')

    var caller = assertEquals.caller;
    
    if(value == true)
    {
      this.setTestSuccess(caller);
    }
    else
    {
      this.setTestFail(caller);
    }
  },  
  
  assertEqual: function assertEquals(a, b)
  {
    if(arguments.length < 2) throw SSUnitTest.AssertEqualError(new Error(), 'assertEqual expects 2 arguments.')

    var caller = assertEquals.caller;
    
    if(a == b)
    {
      this.setTestSuccess(caller);
    }
    else
    {
      this.setTestFail(caller);
    }
  },
  
  
  assertNotEqual: function assertEquals(a, b)
  {
    if(arguments.length < 2) throw SSUnitTest.AssertNotEqualError(new Error(), 'assertNotEqual expects 2 arguments.')

    var caller = assertEquals.caller;
    
    if(a != b)
    {
      this.setTestSuccess(caller);
    }
    else
    {
      this.setTestFail(caller);
    }
  },
  
  
  reportResults: function()
  {
    var passed = this.tests.getValues().filter(function(x){return x.success});
    var passedTests = passed.map(function(x){return this.nameForTest(x.function)}.bind(this));
    var failed = this.tests.getValues().filter(function(x){return !x.success});
    var failedTests = failed.map(function(x){return this.nameForTest(x.function)}.bind(this));
    
    // create a report json object
    
    console.log(passed.length + " tests passed.");
    console.log(passedTests)
    console.log(failed.length + " tests failed.");
    console.log(failedTests)
    console.log(this.tests.getLength() + " tests.");
  }
  
});

var TestCaseTestDivideByZeroException = new Class({
  Extends: SSException
});

function TestCaseDivide(x, y)
{
  if(y == 0) throw new TestCaseTestDivideByZeroException(new Error());
}

var SSTestCaseTest = new Class({
  name: 'SSTestCaseTest',
  
  Extends: SSUnitTest.TestCase,
  
  testAdd: function()
  {
    this.assertEqual(2+3, 5);
  },
  
  testDivide: function()
  {
    this.assertThrows(TestCaseTestDivideByZeroException, TestCaseDivide, 5, 0);
  }
});

function go()
{
  new SSTestCaseTest();
  SSUnitTest.main();
}
