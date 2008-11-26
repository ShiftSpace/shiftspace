// ==Builder==
// @test
// ==/Builder==

var SSAnotherDefaultTest = new Class({
  
  name: 'SSAnotherDefaultTest',

  Extends: SSUnitTest.TestCase,

  testRepeat: function()
  {
    var value = "hhhhh";
    this.assertEqual(value, "h".repeat(5));
  }

});