// ==Builder==
// @test
// @suite           SSDefaultTestSuite
// ==/Builder==

var TestCaseTestDivideByZeroException = new Class({
  Extends: SSException,
  Implements: SSExceptionPrinter,
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
  
  setup: function() {},
  tearDown: function() {},

  add: $deftest(
    "Test adding two values and assert correct sum.",
    function()
    {
      this.assertEqual(2+3, 5);
    }
  )/*,*/

  /*
  divide: $deftest(
    "Division by zero should throw TestCaseTestDivideByZeroException.",
    function()
    {
      this.assertThrows(TestCaseTestDivideByZeroException, TestCaseDivide, [5, 0]);
    }
  ),
  */

  /*
  subtract: $deftest(
    "Test substraction.",
    function()
    {
      var x = 5;
      this.assertNotEqual(x-2, 5);
    }
  ),

  shouldFail: $deftest(
    "This test should fail",
    function()
    {
      var x = 5;
      this.assertNotEqual(x, 5);
    }
  ),

  multiply: $deftest(
    "Test multiplying two values",
    function()
    {
      this.assert((3*3) == 9);
    }
  )*/
});
