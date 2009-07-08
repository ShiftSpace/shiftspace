// ==Builder==
// @test
// @dependencies      SSMultiViewTest, SSCellTest, SSListViewTest
// ==/Builder==

var SSUITestSuite = new Class({

  Extends: SSUnitTest.TestSuite,
  name: 'SSUITestSuite',

  initialize: function(options)
  {
    // Important!
    this.parent(options);
    
    this.addTest(SSMultiViewTest);
    this.addTest(SSCellTest);
    this.addTest(SSListViewTest);
  }
  
});