// ==Builder==
// @test
// @suite           SSDefaultTestSuite
// ==/Builder==

var TestCaseTestDivideByZeroException = new Class({
  Extends: SSException,
  name: 'TestCaseTestDivideByZeroException'
});

function TestCaseDivide(x, y)
{
  if(y == 0) throw new TestCaseTestDivideByZeroException(new Error(), "Oops! Division by zero!");
  return (x/y);
}

var SSDefaultTest = new Class({
  Extends: SSUnitTest.TestCase,
  name: 'SSDefaultTest',
  
  setup: function() {},
  tearDown: function() {},

  add: $fixture(
    "Test adding two values and assert correct sum.",
    function() { SSUnit.assertEqual(2 + 3, 5); }
  ),

  divide: $fixture(
    "Division by zero should throw TestCaseTestDivideByZeroException.",
    function() { SSUnit.assertThrows(TestCaseTestDivideByZeroException, TestCaseDivide.bind(null, [5, 0])); }
  ),

  subtract: $fixture(
    "Test substraction.",
    function() { var x = 5; SSUnit.assertNotEqual(x-2, 5); }
  ),

  shouldFail: $fixture(
    "This test should fail",
    function() { var x = 5; SSUnit.assertNotEqual(x, 5); }
  ),

  multiply: $fixture(
    "Test multiplying two values",
    function() { SSUnit.assert((3*3) == 9); }
  )
});