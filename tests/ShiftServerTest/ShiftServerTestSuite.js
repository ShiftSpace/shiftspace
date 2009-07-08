// ==Builder==
// @test
// @dependencies      LoginTest, UserCreateDeleteTest
// ==/Builder==

var ShiftServerTestSuite = new Class({

  Extends: SSUnitTest.TestSuite,
  name: "ShiftServerTestSuite",

  initialize: function(options)
  {
    this.parent(options);
    
    this.addTest(LoginTest);
    this.addTest(UserCreateDeleteTest);
  }
});