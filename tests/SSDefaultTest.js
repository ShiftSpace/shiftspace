// ==Builder==
// @test
// @suite           SSDefaultTestSuite
// ==/Builder==

var TestCaseTestDivideByZeroException = new Class({
  Extends:SSException,
  Implements:SSExceptionPrinter
  name: 'TestCaseTestDivideByZeroException',
});

function TestCaseDivide(x, y)
{
  if(y == 0) throw new TestCaseTestDivideByZeroException(new Error(), "Oops! Division by zero!");
  return x/y;
}

var SSDefaultTest = new Class({
  
  Extends: SSUnitTest.TestCase,
  name: 'SSDefaultTest',
  
  setup: function()
  {
  },
  
  teardown: function()
  {
  },

  testAdd: function()
  {
    this.doc("Test adding two values and assert correct sum.");
    
    // start async testing
    var hook = this.startAsync();
    
    this.assertEqual(2+3, 5);
    
    // end async testing
    this.endAsync(hook);
  },

  testDivide: function()
  {
    this.doc("Division by zero should throw TestCaseTestDivideByZeroException.");
    this.assertThrows(TestCaseTestDivideByZeroException, TestCaseDivide, [5, 0]);
  },

  testSubtract: function()
  {
    this.doc("Test substraction.");
    var x = 5;
    this.assertNotEqual(x-2, 5);
  },

  testShouldFail: function()
  {
    this.doc("This test should fail");
    var x = 5;
    this.assertNotEqual(x, 5);
  },

  testMultiply: function()
  {
    this.doc("Test multiplying two values");
    this.assert((3*3) == 9);
  }
    
});
