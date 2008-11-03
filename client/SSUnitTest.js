// ==Builder==
// @optional
// @name              SSUnitTest
// @package           Testing
// @dependencies      SSException
// ==/Builder==

// ==============
// = Utilities =
// ==============

Array.implement({
  copy: function()
  {
    var results = [];
    for(var i = 0, l = this.length; i < l; i++) results[i] = this[i];
    return results;
  }
});

String.implement({
  repeat: function(times) 
  {
    var result = "";
    for(var i = 0; i < times; i++) result += this;
    return result;
  }
});

// =============
// = NameSpace =
// =============

var SSUnit = {};

// ===================
// = SSUnitTest.Base =
// ===================

SSUnit.Base = new Class({

  Implements: [Events, Options],

  name: "SSUnit.Base",

  /*
    Function: doc
      Sets the documentation for a fixture.  This takes effect at the test run time.
      This function should be run before anything else in the fixture.
  */
  doc: function(string)
  {
    var docs = this.__getDocs__();
    var caller = arguments.callee.caller;
    this.__setDocForFunction__(caller, string);
  },
  
  
  __getDocs__: function()
  {
    if(!this.__docs) 
    {
      this.__docs = $H();
    }
    return this.__docs;
  },
  
  
  __setDocForFunction__: function(fn, doc)
  {
    this.__getDocs__().set($H(this).keyOf(fn), doc);
  },
  

  __docForFunction__: function(fnName)
  {
    return this.__getDocs__().get(fnName);
  },
  
  
  __nameForFunction__: function(fn)
  {
    return fn.ssname;
  },
  
  
  __setNameForFunction__: function(fn, name)
  {
    fn.ssname = name;
  }

});

/*
  Class: SSUnit.TestIterator
    Methods for iterating over tests.  Tests must fire 'onComplete' events for this class to work.
    The SSUnitTest singleton, and SSUnitTest.TestSuite implement this.
*/
SSUnit.TestIterator = new Class({
  
  Implements: [Events, Options],
  
  setType: function(type)
  {
    this.__type = type;
  },
  
  
  type: function()
  {
    return this.__type || 'test';
  },
  
  
  setTests: function(tests)
  {
    this.__tests = tests;
  },
  
  /*
    Function: tests
      Returns all collected tests.
  */
  tests: function()
  {
    if(!this.__tests) this.setTests([]);
    return this.__tests;
  },
  
  /*
    Functions: reset
      Resets the internal array of collected tests.
  */
  reset: function()
  {
    this.setTests([]);
    delete this.__runningTests;
  },
  
  /*
    Function: addTest
      Adds a test to the internal array
      
    Parameters:
      _aTest - SSUnitTest.TestSuite/TestCase instance.
  */
  addTest: function(_aTest)
  {
    // interesting class is a type
    var aTest = ($type(_aTest) == 'class') ? new _aTest({autocollect:false}) : _aTest;
    
    // otherwise just add it
    this.tests().push(aTest);
  },
  
  
  addTests: function(tests)
  {
    tests.each(this.addTests.bind(this));
  },
  

  runTest: function(aTest)
  {
    aTest.addEvent('onComplete', this.nextTest.bind(this));
    aTest.run();
  },
  

  nextTest: function(aTest)
  {
    var nextTest = this.runningTests().shift();
    if(nextTest)
    {
      this.runTest(nextTest);
    }
    else
    {
      if(this.finish) this.finish();
      this.fireEvent('onComplete', {type:this.type(), name:this.name, ref:this});
    }
  },
  
  
  runningTests: function()
  {
    if(!this.__runningTests)
    {
      this.__runningTests = this.tests().copy();
    }
    return this.__runningTests;
  }, 
  
  /*
    Function: run
      Runs all of the tests in the internal tests array.
  */
  run: function()
  {
    this.fireEvent('onStart', {type:this.type(), name:this.name, ref:this});
    var first = this.runningTests().shift();
    if(first != null) 
    {
      this.runTest(first);
    }
    else
    {
      throw new SSUnitTest.Error(new Error(), "No tests to run");
    }
  }
  
});


// ========================
// = SSUnitTest Singleton =
// ========================

var SSUnitTestClass = new Class({
  
  name: "SSUnitTest",
  
  Implements: [Events, Options, SSUnit.TestIterator], 

  defaults:
  {
    formatter: null,
    interactive: false
  },


  initialize: function(options)
  {
    this.setOptions(this.defaults, options)
    this.setInteractive(this.options.interactive);
    this.setFormatter(this.options.formatter);
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
  

  setFormatter: function(formatter)
  {
    this.__formatter = formatter;
  },
  

  formatter: function()
  {
    return this.__formatter;
  },
  
  
  main: function(options)
  {
    // set a formatter
    if(options != null)
    {
      if(options.formatter)
      {
        this.setFormatter(options.formatter);
      }

      // output results on the fly don't wait till the end
      if(options.interactive)
      {
        this.setInteractive(options.interactive);
      }
    }
    
    this.run();
  },
  
  
  finish: function()
  {
    this.outputResults();
  },
  
  
  onStart: function(aTest)
  {
    if(this.isInteractive())
    {
      //console.log('-onStart ' + aTest.type + ' ' + aTest.name);
    }
  },
  
  
  onComplete: function(aTest)
  {
    if(this.isInteractive())
    {
      //console.log('-onComplete ' + aTest.type + ' ' + aTest.name);
    }
  },
  
  
  outputResults: function(_formatter)
  {
    var formatter = (!_formatter) ? (this.formatter() || new SSUnitTest.ResultFormatter.Console()) : _formatter;
    
    // throw an error if no formatter
    this.tests().each(function(aTest) {
      var results = aTest.getResults();
      formatter.output(results);
      formatter.totals(results);
    });
  }
  
});
var SSUnitTest = new SSUnitTestClass()

// ==============
// = Exceptions =
// ==============

SSUnitTest.Error = new Class({
  name: 'SSUnitTest.Error',
  Extends: SSException,
  Implements: SSExceptionPrinter,
  initialize: function(_error, message)
  {
    this.parent(_error);
    this.setMessage(message);
  }
});

SSUnitTest.AssertError = new Class({
  name:'SSUnitTest.AssertError', 
  Extends: SSUnitTest.Error,
  Implements: SSExceptionPrinter
});

SSUnitTest.AssertEqualError = new Class({
  name:'SSUnitTest.AssertEqualError', 
  Extends: SSUnitTest.Error,
  Implements: SSExceptionPrinter
});

SSUnitTest.AssertNotEqualError = new Class({
  name:'SSUnitTest.AssertNotEqualError', 
  Extends: SSUnitTest.Error,
  Implements: SSExceptionPrinter
});

SSUnitTest.AssertThrowsError = new Class({
  name:'SSUnitTest.AssertThrowsError', 
  Extends: SSUnitTest.Error,
  Implements: SSExceptionPrinter
});

SSUnitTest.NoFormatter = new Class({
  name:'SSUnitTest.NoFormatter', 
  Extends: SSUnitTest.Error,
  Implements: SSExceptionPrinter
});

// =======================
// = SSUnitTest.TestCase =
// =======================

SSUnitTest.TestCase = new Class({
  name: 'SSUnitTest.TestCase',
  
  Extends: SSUnit.Base,
  
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
      //console.log('Creating test case ' + this.name);
    }
    
    this.__tests = $H();
    this.__results = $H();
    this.__results.set('count', 0);
    this.__results.set('passed', 0);
    this.__results.set('failed', 0);
    this.__results.set('tests', $H());
    this.__runningTests = [];
    
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
  },
  
  
  /*
    Function: assertThrows
      Assert that a particular exception is throw.
       
    Parameters:
      exception - an exception class.
      fn - a function to call. Remember to bind if passing in a method of an object.
      args - a single parameter or an array of parameter.
      hook - for asynchronous calls.
      
    Example:
      (start code)
      testSomeMethod: function()
      {
        this.assertThrows(MyException, this.someMethod.bind(this), arg1, arg2, ...)
      }
      (end)
  */
  assertThrows: function(exception, fn, args, hook)
  {
    if(arguments.length < 2) throw new SSUnitTest.AssertThrowsError(new Error(), 'assertThrows expects at least 2 arguments.');
    
    // grab the remaining arguments
    var testArgs = $splat(args);
    var caller = $pick(hook, arguments.callee.caller);
    
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
      Assert that a value is truthy.
      
    Parameters:
      value - a value.
      hook - for async calls.
      
    Example:
      (start code)
      testSomeMethod: function()
      {
        this.assert(aFunction());
      }
      (end)
  */
  assert: function(value, hook)
  {
    if(arguments.length < 1) throw new SSUnitTest.AssertError(new Error(), 'assert expects 1 arguments.');

    var caller = $pick(hook, arguments.callee.caller);
    
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
      hook - for async calls.
      
    Example:
      (start code)
      testSomeMethod: function()
      {
        var correctValue = x;
        this.assertEqual(correctValue, this.someMethod());
      }
      (end)
      
    See Also:
        assertNotEqual
  */
  assertEqual: function(a, b, hook)
  {
    if(arguments.length < 2) throw new SSUnitTest.AssertEqualError(new Error(), 'assertEqual expects 2 arguments.');

    var caller = $pick(hook, arguments.callee.caller);
    
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
      hook - for async calls.
      
    Example:
      (start code)
      testSomeMethod: function()
      {
        var aValue = x;
        this.assertNotEqual(correctValue, this.someMethod());
      }
      (end)
      
    See Also:
        assertEqual
  */
  assertNotEqual: function(a, b, hook)
  {
    if(arguments.length < 2) throw new SSUnitTest.AssertNotEqualError(new Error(), 'assertNotEqual expects 2 arguments.');

    var caller = $pick(hook, arguments.callee.caller);
    
    if(a != b)
    {
      this.__setTestSuccess__(caller);
    }
    else
    {
      this.__setTestFail__(caller);
    }
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
          this.__setNameForFunction__(theTest, testName);
          // set a bound function with the name set
          var boundTest = theTest.bind(this);
          this.__setNameForFunction__(boundTest, testName);
          // set function reference to bound test
          testData.set('function', boundTest);
          // set complete status
          testData.set('complete', false);
        }
      }
    }
  },
  
  
  __runTests__: function()
  {
    this.__tests.each(function(testData, testName) {
      this.__onStart__(testData.get('function'));
      
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
        testData.get('function')();
      }
      catch(err)
      {
        console.error("Uncaught exception in test " + testName + " in testcase " + this.name + '.');
        console.error(err);
      }
      
      // default to success, if the test failed this won't do anything
      this.__setTestSuccess__(testData['function']);
      
      // catch an errors in tearDown, bail if there are any
      try
      {
        this.tearDown();
      }
      catch(err)
      {
        throw new SSUnitTest.Error(err, "Uncaught exception in tearDwon.");
      }
      
      if(!testData.get('async'))
      {
        this.__onComplete__(testData);
      }
    }.bind(this));
  },
  
  
  __onStart__: function(fn)
  {
    // do some special interactive reporting stuff here?
  },
  
  
  __onComplete__: function(testData)
  {
    testData.set('complete', true);
    
    var complete = this.__tests.every(function(data, testName) {
      return data.get('complete');
    });
    
    if(complete)
    {
      this.__wrapup__();
    }
  },
  
  
  __wrapup__: function()
  {
    // collect test results
    this.__collectResults__();
    // fire onComplete event
    this.fireEvent('onComplete', {type:'testcase', name:this.name, ref:this});
  },
  

  __dataForTest__: function(aTest)
  {
    return this.__tests.get(this.__nameForFunction__(aTest));
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
  
  
  startAsync: function()
  {
    var data = this.__dataForTest__(arguments.callee.caller);
    data.set('async', true);
    return data.get('function');
  },
  
  
  endAsync: function(ref)
  {
    this.__onComplete__(this.__dataForTest__(ref));
  },
  
  
  __setTestFail__: function(aTest)
  {
    this.__dataForTest__(aTest).set('success', false);
  },
  
  
  __collectResults__: function()
  {
    var passed = this.__tests.getValues().filter(function(x){return x.success});
    var passedTests = passed.map(function(x){return this.__nameForFunction__(x['function'])}.bind(this));
    var failed = this.__tests.getValues().filter(function(x){return !x.success});
    var failedTests = failed.map(function(x){return this.__nameForFunction__(x['function'])}.bind(this));
    
    // collect data about each individual test
    this.__tests.each(function(testData, testName) {
      this.__results.get('tests').set(testName, $H({
        name: testName,
        success: testData.get('success'),
        doc: this.__docForFunction__(this.__nameForFunction__(testData.get('function')))
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
  
  name: 'SSUnitTest.ResultFormatter',
  
  initialize: function() {},
  
  asString: function(testResult) 
  {
    var resultString = [];
    resultString.push(testResult.get('name') + ":");
    resultString.push(testResult.get('doc') || '');
    resultString.push((testResult.get('success') && "PASS") || "FAIL");
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
  
  /*
    Function: output
      Takes a test result and depth.  Depth is used for formatting. Output recurses
      on test result Hash objects.
      
    Parameters:
      aResult - a Hash object.  You should get one from a test that has been run.
      _depth - used for formatting.
  */
  output: function(aResult, _depth)
  {
    // get the depth
    var depth = (_depth != null) ? _depth : 0;
    var subResults = aResult.get('tests');
    
    if(subResults && subResults.getLength() > 0)
    {
      subResults.each(function(subResult, subResultName) {
        this.output(subResult, depth+1);
      }.bind(this));
    }
  },
  
  /*
    Function: totals
      Reports the totals for a test, does not recurse on a test result.
  */
  totals: function(aResult)
  {
    
  }
  
});

/*
  Class: SSUnitTest.ResultFormatter.Console
    Formats test results to the JavaScript console.  Requires Firefox, Safari, IE 8.
*/
SSUnitTest.ResultFormatter.Console = new Class({
  
  namae: 'SSUnitTest.ResultFormatter.Console',
  
  Extends: SSUnitTest.ResultFormatter,
  
  output: function(testResult, depth)
  {
    console.log("  ".repeat(depth) + this.asString(testResult));
    // call parent, required for relaying depth of test
    this.parent(testResult, depth);
  },
  
  totals: function(testResult)
  {
    var totals = {
      count: testResult.get('count'),
      passed: testResult.get('passed'),
      failed: testResult.get('failed')
    };
    
    console.log('------------------------------------------');
    console.log('{count} tests, {passed} passed, {failed} failed.'.substitute(totals));
  }
  
});

/*
  Class: SSUnitTest.ResultFormatter.BasicDOM
    Formats test results to the DOM.
*/
SSUnitTest.ResultFormatter.BasicDOM = new Class({

  name: 'SSUnitTest.ResultFormatter.BasicDOM',
  
  Extends: SSUnitTest.ResultFormatter,

  initialize: function(_container)
  {
    this.__container = ($type(_container) == 'string') ? $(_container) : _container;
  },
  
  
  setContainer: function(aContainer)
  {
    this.__container = aContainer;
  },
  
  
  container: function()
  {
    return this.__container;
  },
  

  format: function(testResult, depth)
  {
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
      doc: (testResult.get('doc')) || ''
    };
    
    resultDiv.set('html', ('<span><b>{testName}:</b></span> <span>{doc}</span> <span style="color:{statusColor};">{status}</span> ...').substitute(testData));
    
    return resultDiv;
  },


  output: function(testResult, depth)
  {
    this.container().grab(this.format(testResult, depth));
    // call parent
    this.parent(testResult, depth);
  },
  
  
  totals: function(testResult)
  {
    var totals = {
      count: testResult.get('count'),
      passed: testResult.get('passed'),
      failed: testResult.get('failed')
    };
    
    var totalsDiv = new Element('div', {
      'class': "SSTestResultTotals"
    });
    totalsDiv.setStyles({
      borderTop: '1px dashed black'
    });
    
    totalsDiv.set('text', ("Total test: {count}, Passed: {passed}, Failed: {failed}").substitute(totals));
    
    this.container().grab(totalsDiv);
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
  
  Implements: SSUnit.TestIterator,
  
  Extends: SSUnit.Base,
  
  defaults:
  {
    autocollect: true
  },
  
  initialize: function(options)
  {
    this.setOptions(this.defaults, options);
    
    // add it to the singleton unless autocollect is set to false
    if(this.options.autocollect)
    {
      SSUnitTest.addTest(this);
    }
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
    
    this.tests().each(function(aTest) {
      var results = aTest.getResults();
      
      // add this results to the master
      suiteResults.get('tests').set(aTest.name, results);
      
      // accumulate
      suiteResults.set('count', suiteResults.get('count') + results.get('count'));
      suiteResults.set('passed', suiteResults.get('passed') + results.get('passed'));
      suiteResults.set('failed', suiteResults.get('failed') + results.get('failed'));
    });
    
    // only if everything passed do we set success to true
    
    if(suiteResults.get('failed') == 0)
    {
      suiteResults.set('success', true);
    }
    
    return suiteResults;
  }
  
});