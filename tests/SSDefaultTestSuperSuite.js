// ==Builder==
// @test
// @name              SSDefaultTestSuperSuite
// @dependencies      SSDefaultTestSuite, SSAnotherDefaultTest
// ==/Builder==

var SSDefaultTestSuperSuite = new Class({
  
  Extends: SSUnitTest.TestSuite,
  name: 'SSDefaultTestSuperSuite',
  
  initialize: function(options)
  {
    // Important!
    this.parent(options);
    
    this.addTest(SSDefaultTestSuite);
    this.addTest(SSAnotherDefaultTest);
  }
  
});