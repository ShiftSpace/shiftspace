// ==Builder==
// @test
// @suite           TestTesting
// @dependencies    SomeFile1, SomeFile2
// ==/Builder==

var TestTesting = new Class({
  name: 'TestTesting',

  Extends: SSUnitTest.TestCase,

  testTesting: function()
  {
    this.doc("Testing that dependencies within tests work");
    
    // start async testing
    var hook = this.startAsync();
    
    this.assertEqual(SomeValue1 + SomeValue2, 0);
    
    // end async testing
    this.endAsync(hook);
  }

});
