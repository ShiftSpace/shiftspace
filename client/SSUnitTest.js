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
  
  Implements: Options,
  
  defaults:
  {
    formatter: null
  },

  initialize: function(options)
  {
    this.setOptions(this.defaults, options)

    this.__tests = [];
    this.__results = [];
  },
  

  tests: function()
  {
    return this.__tests;
  },


  addTest: function(caseName, theCase)
  {
    console.log('Adding ' + caseName)
    this.tests().push($H({name:caseName || 'UntitledTest', 'test':theCase}));
  },
  
  
  addResults: function(results)
  {
    this.__results.push(results);
  },
  
  
  main: function()
  {
    this.tests().each(function(caseHash) {
      caseHash.get('test').run();
      this.addResults(caseHash.get('test').getResults());
    }.bind(this));
  },
  
  
  outputResults: function(formatter)
  {
    if(!formatter) 
    {
      console.log('throwing error!')
      throw new SSUnitTest.NoFormatter(new Error());
    }
    
    // throw an error if no formatter
    this.__results.each(function(results) {
      var individualTests = results.get('tests');
      individualTests.each(formatter.output.bind(formatter));
    }.bind(this));
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
SSUnitTest.AssertNotEqualError = new Class({Extends: SSUnitTest.Error});
SSUnitTest.AssertThrowsError = new Class({Extends: SSUnitTest.Error});
SSUnitTest.NoFormatter = new Class({Extends: SSUnitTest.Error});

// =======================
// = SSUnitTest.TestCase =
// =======================

SSUnitTest.TestCase = new Class({
  name: 'SSUnitTest.TestCase',
  
  
  initialize: function(dummy)
  {
    this.__tests = $H();
    this.__results = $H();
    this.__results.set('count', 0);
    this.__results.set('passed', 0);
    this.__results.set('failed', 0);
    this.__results.set('tests', []);
    
    // to skip any properties defined on base class
    if(!dummy) 
    {
      this.__dummy = new SSUnitTest.TestCase(true);
      // add this instance to SSUnitTest
      SSUnitTest.addTest(this.name, this);
    }
  },
  
  /*
    Function: setup (abstract)
      Called before each test.  Do any initialization here.
  */
  setup: function() 
  {
  },
  
  /*
    Function: tearDown (abstract)
      Called after each test. Do any cleanup here.
  */
  tearDown: function() 
  {
  },
  
  
  getResults: function()
  {
    // returns a SSUnitTest.TestResult object
    return this.__results;
  },

  /*
    Function: run
      Runs the teset case.
  */
  run: function()
  {
    // collect all the tests and build metadata
    this.__collectTests__();
    this.__runTests__();
    this.__collectResults__();
  },
  
  /*
    Function: assertThrows
      Assert that a particular exception is throw.  This function is named
      so that we can access its caller property.
       
    Parameters:
      exception - an exception class.
      fn - a function to call. Remember to bind if passing in a method of an object.
      
    Example:
      testSomeMethod: function()
      {
        this.assertThrows(MyException, this.someMethod.bind(this), arg1, arg2, ...)
      }
  */
  assertThrows: function assertThrows(exception, fn)
  {
    if(arguments.length < 2) throw new SSUnitTest.AssertThrowsError(new Error(), 'assertThrows expects 2 arguments.');
    
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
        this.__setTestSuccess__(caller);
      }
      else
      {
        this.__setTestFail__(caller);
        throw err;
      }
    }
  },

  /*
    Function: assert
      Assert that a value is truthy.  This function is named so that we can access its
      caller property.
      
    Parameters:
      value - a value.
      
    Example:
      testSomeMethod: function()
      {
        this.assert(aFunction());
      }
  */
  assert: function assert(value)
  {
    if(arguments.length < 1) throw new SSUnitTest.AssertError(new Error(), 'assert expects 1 arguments.');

    var caller = assert.caller;
    
    if(value == true)
    {
      this.__setTestSuccess__(caller);
    }
    else
    {
      this.__setTestFail__(caller);
    }
  },  
  
  /*
    Function: assertEqual
      Assert that two value match. This method is named so that we can
      access the caller property inside the method.
      
    Parameters:
      a - a value.
      b - a value.
      
    Example:
      testSomeMethod: function()
      {
        var correctValue = x;
        this.assertEqual(correctValue, this.someMethod());
      }
      
    See Also:
        assertNotEqual
  */
  assertEqual: function assertEqual(a, b)
  {
    if(arguments.length < 2) throw new SSUnitTest.AssertEqualError(new Error(), 'assertEqual expects 2 arguments.');

    var caller = assertEqual.caller;
    
    if(a == b)
    {
      this.__setTestSuccess__(caller);
    }
    else
    {
      this.__setTestFail__(caller);
    }
  },
  
  /*
    Function: assertNotEqual
      Assert that two value match. This method is named so we can called the
      caller property inside the method.
      
    Parameters:
      a - a value.
      b - a value.
      
    Example:
      testSomeMethod: function()
      {
        var aValue = x;
        this.assertNotEqual(correctValue, this.someMethod());
      }
      
    See Also:
        assertEqual
  */
  assertNotEqual: function assertNotEqual(a, b)
  {
    if(arguments.length < 2) throw new SSUnitTest.AssertNotEqualError(new Error(), 'assertNotEqual expects 2 arguments.');

    var caller = assertNotEqual.caller;
    
    if(a != b)
    {
      this.__setTestSuccess__(caller);
    }
    else
    {
      this.__setTestFail__(caller);
    }
  },
  
  
  __nameForTest__: function(fn)
  {
    return fn.name
  },
  
  
  __setNameForTest__: function(fn, name)
  {
    fn.name = name;
  },
  
  
  __collectTests__: function()
  {
    // collect all object properties that have 'test' as the first four characters
    for(var propertyName in this)
    {
      // don't consider any methods that are a part of SSUnitTest.TestCase
      if(!this.__dummy[propertyName])
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
          this.__tests.set(testName, testData);
          // set the name of the original function
          this.__setNameForTest__(theTest, testName);
          // set a bound function with the name set
          var boundTest = theTest.bind(this);
          this.__setNameForTest__(boundTest, testName);
          testData.set('function', boundTest);
        }
      }
    }
  },
  
  
  __runTests__: function()
  {
    this.__tests.each(function(testData, testName) {
      // catch errors in setup, bail if there are any
      try
      {
        this.setup();
      }
      catch(err)
      {
        throw new SSUnitTest.Error(err, "Uncaught exception in setup.");
      }
      
      // run the function, catch any exceptions that are not caught
      try
      {
        testData.function();
      }
      catch(err)
      {
        throw new SSUnitTest.Error(err, "Uncaught exception in test.");
      }
      
      // default to success, if the test failed this won't do anything
      this.__setTestSuccess__(testData.function);
      
      // catch an errors in tearDown, bail if there are any
      try
      {
        this.tearDown();
      }
      catch(err)
      {
        throw new SSUnitTest.Error(err, "Uncaught exception in tearDwon.");
      }
    }.bind(this));
  },
  
  
  __dataForTest__: function(aTest)
  {
    return this.__tests.get(this.__nameForTest__(aTest));
  },
  
  
  __setTestSuccess__: function(aTest)
  {
    var data = this.__dataForTest__(aTest);
    var success = data.get('success');
    
    // only set success if there isn't an existing value
    if(success == null)
    {
      data.set('success', true)
    }
  },
  
  
  __setTestFail__: function(aTest)
  {
    this.__dataForTest__(aTest).set('success', false);
  },
  
  
  __collectResults__: function()
  {
    var passed = this.__tests.getValues().filter(function(x){return x.success});
    var passedTests = passed.map(function(x){return this.__nameForTest__(x.function)}.bind(this));
    var failed = this.__tests.getValues().filter(function(x){return !x.success});
    var failedTests = failed.map(function(x){return this.__nameForTest__(x.function)}.bind(this));
    
    this.__tests.each(function(testData, testName) {
      this.__results.get('tests').push(new SSUnitTest.TestResult({
        testName: testName,
        success: testData.get('success')
      }));
    }.bind(this));
    
    this.__results.set('count', this.__tests.getLength());
    this.__results.set('passed', passed.length);
    this.__results.set('failed', failed.length);
  }
  
});


// =========================
// = SSUnitTest.TestResult =
// =========================

SSUnitTest.TestResult = new Class({
  
  Implements: Options,
  
  defaults: 
  {
    testName: 'UntitledTest',
    success: true,
    error: null,
    message: ''
  },
  
  initialize: function(options)
  {
    this.setOptions(this.defaults, options);
    
    this.__testName = options.testName;
    this.__success = options.success;
    this.__error = options.error;
  },
  
  
  testName: function()
  {
    return this.__testName;
  },
  
  
  successOrFail: function()
  {
    return this.__success;
  },
  
  
  error: function()
  {
    return this.__error;
  }
  
});


// ==================================
// = SSUnitTest.TestResultFormatter =
// ==================================

SSUnitTest.TestResultFormatter = new Class({
  
  initialize: function() {},
  
  stringResult: function(testResult) 
  {
    var resultString = [];
    resultString.push(testResult.testName() + ":");
    resultString.push((testResult.successOrFail() && "passed") || "failed");
    if(testResult.error())
    {
      resultString.push(", error:" + testResult.error);
    }
    resultString.push("...");
    return resultString.join(" ");
  },
    
  domResult: function() {}
  
});

SSUnitTest.TestResultFormatter.Console = new Class({
  
  Extends: SSUnitTest.TestResultFormatter,
  
  output: function(testResult)
  {
    console.log(this.stringResult(testResult));
  }
  
});


SSUnitTest.TestResultFormatter.BasicDOM = new Class({
  
  Extends: SSUnitTest.TestResultFormatter,


  initialize: function(_container)
  {
    this.__container = ($type(_container) == 'string') ? $(_container) : _container;
  },
  

  domForResult: function(testResult)
  {
    var resultDiv = new Element('div', {
      'class': 'SSUnitTestResult'
    });
    
    var testData = {
      testName: testResult.testName(),
      status: (testResult.successOrFail() && 'passed') || 'failed',
      statusColor: (testResult.successOrFail() && 'green') || 'red'
    };
    
    resultDiv.set('html', ('<span>{testName}:</span> <span style="color:{statusColor};">{status}</span> ...').substitute(testData));
    
    return resultDiv;
  },


  output: function(testResult)
  {
    console.log('outputting')
    this.__container.grab(this.domForResult(testResult));
  }
  
});


// ========================
// = SSUnitTest.TestSuite =
// ========================

SSUnitTest.TestSuite = new Class({
  
  initialize: function()
  {
    this.__tests =[];
  },

  
  tests: function()
  {
    return this.__tests();
  },

  
  addTest: function(aTest)
  {
    this.tests().push(aTest);
  },

  
  addTests: function(tests)
  {
    this.tests().extend(tests);
  },
  
  
  run: function()
  {
    this.tests().each(function(aTest) {
      aTest.run();
    });
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
  },
  
  testSubstract: function()
  {
    var x = 5;
    this.assertNotEqual(x-2, 5);
  },
  
  testShouldFail: function()
  {
    var x = 5;
    this.assertNotEqual(x, 5);
  },
  
  testMultiply: function()
  {
    this.assert((3*3) == 9);
  }
});

function go()
{
  new SSTestCaseTest();
  SSUnitTest.main();
  SSUnitTest.outputResults(new SSUnitTest.TestResultFormatter.Console());
}
