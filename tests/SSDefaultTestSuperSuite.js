// ==Builder==
// @test
// @name              SSDefaultTestSuperSuite
// @dependencies      SSDefaultTestSuite, SSAnotherDefaultTest
// ==/Builder==

var SSDefaultTestSuperSuite = new Class({
  
  name: 'SSDefaultTestSuperSuite',

  Extends: SSUnitTest.TestSuite,

  initialize: function(options)
  {
    // Important!
    this.parent(options);
    
    this.addTest(SSDefaultTestSuite);
    this.addTest(SSAnotherDefaultTest);
  }
  
});