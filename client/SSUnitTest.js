// ==Builder==
// @optional
// @name              SSUnitTest
// @package           Testing
// ==/Builder==

var SSUnitTest = {};

SSUnitTest.TestCase = new Class({
  name: 'SSUnitTest',
  
  
  initialize: function(dummy)
  {
    this.tests = $H();   
    this.testCount = 0;
    
    // to skip any properties defined on base class
    if(!dummy) this.dummy = new SSUnitTest.TestCase(true);
  },
  
  
  main: function()
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
    console.log('runTests')
    this.tests.each(function(testData, testName){
      console.log(testName)
      console.log(testData)
      testData.function();
    });
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
  
  
  assertThrows: function assertThrows(exception, fn, bind)
  {
    // convert the argument list into an array
    var varargs = $A(arguments);
    // grab the remaining arguments
    var testArgs = varargs.slice(3, varargs.length);
    
    console.log('assertThrows: ' + this.nameForTest(assertThrows.caller));
      
    try
    {
      fn.apply(bind, testArgs);
    }
    catch(err)
    {
      if(err instanceof exception)
      {
        this.setTestSuccess(fn);
      }
      else
      {
        this.setTestFail(fn)
      }
    }
  },
  
  
  assertEqual: function assertEquals(a, b)
  {
    console.log('Assert equal ' + this.nameForTest(assertEquals.caller));
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
  
  
  reportResults: function()
  {
    var passed = this.tests.getValues().filter(function(x){return x.success});
    var passedTests = passed.map(function(x){return this.nameForTest(x)}.bind(this));
    var failed = this.tests.getValues().filter(function(x){return !x.success});
    var failedTests = failed.map(function(x){return this.nameForTest(x)}.bind(this));
    
    console.log(passed.length + " tests passed.");
    console.log(passedTests)
    console.log(failed.length + " test failed.");
    console.log(failedTests)
    console.log(this.tests.getLength() + " tests.");
  }
  
});


var SSTestCaseTest = new Class({
  name: 'SSTestCaseTest',
  
  Extends: SSUnitTest.TestCase,
  
  testAdd: function()
  {
    this.assertEqual(2+3, 5);
  },
  
  testDivide: function()
  {
    
  }
});
