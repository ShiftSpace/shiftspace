// ==Builder==
// @test
// @dependencies      LoginTest, UserTest, StreamTest
// ==/Builder==

var ShiftServerTestSuite = new Class({

  Extends: SSUnitTest.TestSuite,
  name: "ShiftServerTestSuite",

  initialize: function(options)
  {
    this.parent(options);
    
    this.addTest(LoginTest);
    this.addTest(UserTest);
    this.addTest(StreamTest);
  }
});