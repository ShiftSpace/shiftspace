// ==Builder==
// @test
// @suite             ShiftServerTest
// @dependencies      ShiftServerTestUtils
// ==/Builder==

var UserCreateDeleteTest = new Class({

  Extends: SSUnitTest.TestCase,
  name: 'UserCreateDeleteTest',
  

  setup: function()
  {

  },
  

  tearDown: function()
  {
    req({
      url: '/user',
      resourceId: 'fakemary',
      method: 'delete'
    });
  },
  

  testMissingEmail: function()
  {
    this.doc("Error on missing email");
  },
  
  
  testMissingUserName: function()
  {
    this.doc("Error on missing userName");
  },
  

  testShortUserName: function()
  {
    this.doc("Error on short user name");
  },
  
  
  testUserNameTaken: function()
  {
    this.doc("Error on user name taken.");
  },
  
  
  testMissingPassword: function()
  {
    this.doc("Error on missing password");
  },
  
  
  testMissingPasswordVerify: function()
  {
    this.doc("Error on missing password verify");
  },
  
  
  testPasswordMatch: function()
  {
    this.doc("Error on password/passwordVerify mismatch");
  },
  
  
  testValidUser: function()
  {
    this.doc("Valid user");
  },
  
  
  testBasicDeleteUser: function()
  {
    this.doc("Test basic deletion. Only verify the account no longer exists");
  }
  
});