// ==Builder==
// @test
// ==/Builder==

var SSAnotherDefaultTest = new Class({
  Extends: SSUnitTest.TestCase,
  name: 'SSAnotherDefaultTest',

  repeat: $fixture(
    "Test String.repeat",
    function()
    {
      var value = "hhhhh";
      SSUnit.assertEqual(value, "h".repeat(5));
    }
  )
});