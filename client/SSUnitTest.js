// ==Builder==
// @optional
// @name              SSUnitTest
// @package           Testing
// @dependencies      SSException
// ==/Builder==

// =============
// = NameSpace =
// =============

var SSUnit = {};

// ========================
// = SSUnitTest Singleton =
// ========================

var SSUnitTestClass = new Class({
  
  Implements: [Events, Options],
  
  defaults:
  {
    formatter: null,
    interactive: false
  },


  initialize: function(options)
  {
    this.setOptions(this.defaults, options)
    this.setInteractive(this.options.interactive);
    this.setFormmatter(this.options.formatter);

    this.reset();
  },
  

  setInteractive: function(value)
  {
    this.__interactive = value;
  },
  

  isInteractive: function()
  {
    return this.__interactive;
  },
  

  setFormmatter: function(formatter)
  {
    this.__formatter = formatter;
  },
  

  formatter: function()
  {
    return this.__formatter;
  },
  
  /*
    Function: reset
      Resets SSUnitTest singleton. This empties the internal array of tests as well as results.
  */
  reset: function()
  {
    this.__tests = [];
    this.__results = [];
  },
  

  tests: function()
  {
    return this.__tests;
  },


  addTest: function(theTest)
  {
    // listen in on the test
    theTest.addEvent('onStart', this.onStart.bind(this));
    theTest.addEvent('onComplete', this.onComplete.bind(this));
    // add the test
    this.tests().push($H({name:theTest.name || 'UntitledTest', 'test':theTest}));
  },
  
  
  main: function(options)
  {
    if(options.formatter)
    {
      this.setFormmatter(options.formatter);
    }
    if(options.interactive)
    {
      this.setInteractive(options.interactive);
    }
    
    this.tests().each(function(caseHash) {
      caseHash.get('test').run();
    }.bind(this));
  },
  
  
  onStart: function(aTest)
  {
    if(this.isInteractive())
    {
      console.log('-onStart ' + aTest.type + ' ' + aTest.name);
    }
  },
  
  
  onComplete: function(aTest)
  {
    if(this.isInteractive())
    {
      console.log('-onComplete ' + aTest.type + ' ' + aTest.name);
    }
  },
  
  
  outputResults: function(_formatter)
  {
    var formatter = (!_formatter) ? (this.formatter() || new SSUnitTest.ResultFormatter.Console()) : _formatter;

    // throw an error if no formatter
    this.tests().each(function(aTestHash) {
      console.log('outputting results');
      console.log(aTestHash.get('test'));
      formatter.output(aTestHash.get('test').getResults());
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
SSUnitTest.AssertNotEqualError = new Class({Extends: SSUnitTest.Error});
SSUnitTest.AssertThrowsError = new Class({Extends: SSUnitTest.Error});
SSUnitTest.NoFormatter = new Class({Extends: SSUnitTest.Error});

// =======================
// = SSUnitTest.TestCase =
// =======================

SSUnitTest.TestCase = new Class({
  name: 'SSUnitTest.TestCase',
  
  Implements: [Events, Options],
  
  defaults:
  {
    dummy: false,
    autocollect: true
  },
  
  initialize: function(options)
  {
    this.setOptions(this.defaults, options);
    
    if(!this.options.dummy)
    {
      console.log('Creating test case ' + this.name);
    }
    
    this.__tests = $H();
    this.__results = $H();
    this.__results.set('count', 0);
    this.__results.set('passed', 0);
    this.__results.set('failed', 0);
    this.__results.set('tests', $H());
    
    // to skip any properties defined on base class
    // wish MooTools supported class reflection!
    if(!this.options.dummy) 
    {
      this.__dummy = new SSUnitTest.TestCase({dummy:true});
      
      // auto collect into the SSUnitTest singleton
      if(this.options.autocollect)
      {
        // add this instance to SSUnitTest
        SSUnitTest.addTest(this);
      }
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
    this.fireEvent('onStart', {type:'testcase', name:this.name, ref:this});
    // collect all the tests and build metadata
    this.__collectTests__();
    this.__runTests__();
    this.__collectResults__();
    this.fireEvent('onComplete', {type:'testcase', name:this.name, ref:this});
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
      this.fireEvent('onStart', {type:'function', name:testName});
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
        testData['function']();
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
      this.fireEvent('onComplete', {type:'function', name:testName});
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
    
    // collect data about each individual test
    this.__tests.each(function(testData, testName) {
      this.__results.get('tests').set(testName, $H({
        name: testName,
        success: testData.get('success')
      }));
    }.bind(this));
    
    // collect test case data
    this.__results.set('name', this.name);
    this.__results.set('count', this.__tests.getLength());
    this.__results.set('passed', passed.length);
    this.__results.set('failed', failed.length);
    this.__results.set('success', (failed.length == 0));
  }
  
});


// ==================================
// = SSUnitTest.ResultFormatter =
// ==================================

SSUnitTest.ResultFormatter = new Class({
  
  initialize: function() {},
  
  asString: function(testResult) 
  {
    var resultString = [];
    resultString.push(testResult.get('name') + ":");
    resultString.push((testResult.get('success') && "passed") || "failed");
    if(testResult.get('error'))
    {
      resultString.push(", error:" + testResult.get('error'));
    }
    resultString.push("...");
    return resultString.join(" ");
  },
    
  format: function(aResult, _depth) 
  {
    
  },
  
  output: function(aResult, _depth) 
  {
    // get the depth
    var depth = (_depth != null) ? _depth : 0;
    
    var subResults = aResult.get('tests');
    console.log('checking for subResults');
    console.log(subResults);
    if(subResults && subResults.getLength() > 0)
    {
      subResults.each(function(subResult, subResultName) {
        this.output(subResult, depth+1);
      }.bind(this));
    }
  }
  
});

// ==========================================
// = SSUnitTest.ResultFormatter.Console =
// ==========================================

SSUnitTest.ResultFormatter.Console = new Class({
  
  Extends: SSUnitTest.ResultFormatter,
  
  output: function(testResult, depth)
  {
    console.log(this.asString(testResult));
    // call parent
    this.parent(result, depth);
  }
  
});


// ===========================================
// = SSUnitTest.ResultFormatter.BasicDOM =
// ===========================================

SSUnitTest.ResultFormatter.BasicDOM = new Class({
  
  Extends: SSUnitTest.ResultFormatter,


  initialize: function(_container)
  {
    this.__container = ($type(_container) == 'string') ? $(_container) : _container;
  },
  

  format: function(testResult, depth)
  {
    console.log('formatting result ' + depth);
    console.log(testResult);
    
    var resultDiv = new Element('div', {
      'class': 'SSUnitTestResult'
    });
    resultDiv.setStyles({
      marginLeft: 10*depth
    });
    
    var testData = {
      testName: testResult.get('name'),
      status: (testResult.get('success') && 'passed') || 'failed',
      statusColor: (testResult.get('success') && 'green') || 'red',
    };
    
    resultDiv.set('html', ('<span>{testName}:</span> <span style="color:{statusColor};">{status}</span> ...').substitute(testData));
    
    return resultDiv;
  },


  output: function(testResult, depth)
  {
    this.__container.grab(this.format(testResult, depth));
    // call parent
    this.parent(testResult, depth);
  }
  
});


// ============================================
// = SSUnitTest.ResultFormatter.AccordionList =
// ============================================


// ========================
// = SSUnitTest.TestSuite =
// ========================

SSUnitTest.TestSuite = new Class({
  
  name: 'SSUnitTest.TestSuite',
  
  Implements: [Events, Options],
  
  defaults:
  {
    autocollect: true
  },
  
  initialize: function(options)
  {
    this.setOptions(this.defaults, options);
    this.setTests($H());
    
    // add it to the singleton unless autocollect is set to false
    if(this.options.autocollect)
    {
      SSUnitTest.addTest(this);
    }
  },


  setTests: function(tests)
  {
    this.__tests = tests;
  },
  

  tests: function()
  {
    return this.__tests;
  },

  
  addTest: function(aTest)
  {
    console.log('adding a test');

    var instance = new aTest({autocollect:false});
    
    // listen in for start and complete
    instance.addEvent('onStart', this.onStart.bind(this));
    instance.addEvent('onComplete', this.onComplete.bind(this));
    
    // add it to the internal array
    this.tests().set(instance.name, instance);
  },

  
  addTests: function(tests)
  {
    tests.each(this.addTests.bind(this));
  },
  
  
  onStart: function(testData)
  {
    // propagate subtest onStart events
    this.fireEvent('onStart', testData);
  },
  
  
  onComplete: function(testData)
  {
    // propagate subtest onComplete events
    this.fireEvent('onComplete', testData);
  },
  
  
  run: function()
  {
    this.fireEvent('onStart', {type:'testsuite', name:this.name, ref:this});
    this.tests().each(function(aTest, testName) {
      aTest.run();
    });
    this.fireEvent('onComplete', {type:'testsuite', name:this.name, ref:this});
  },
  
  
  getResults: function()
  {
    var suiteResults = $H({
      name: this.name,
      subtests: $H(),
      count: 0,
      passed: 0,
      failed: 0
    });
    
    suiteResults.set('tests', $H());
    
    this.tests().each(function(aTest, testName) {
      var results = aTest.getResults();
      
      // add this results to the master
      suiteResults.get('tests').set(testName, results);
      
      // accumulate
      suiteResults.set('count', suiteResults.get('count') + results.get('count'));
      suiteResults.set('passed', suiteResults.get('passed') + results.get('passed'));
      suiteResults.set('failed', suiteResults.get('failed') + results.get('failed'));
    });
    
    // only if everything passed do we set success to true
    if(suiteResults.get('failed').length == 0)
    {
      suiteResults.set('success', true);
    }
    
    return suiteResults;
  }
  
});