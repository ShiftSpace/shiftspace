// ==Builder==
// @test
// @suite             ShiftServerTest
// @dependencies      ShiftServerTestUtils
// ==/Builder==
  
var noUserName = {userName:"", password:"bazbaz"};
var wrongPassword = {userName:"fakemary", password:"foobaz"};

var LoginTest = new Class({

  Extends: SSUnitTest.TestCase,
  name: 'LoginTest',
  
  setup: function()
  {
    app.action('join', fakemary);
    logout();
  },
  
  
  tearDown: function()
  {
    app.delete('user', 'fakemary');
  },
  
  
  testNoUserName: function()
  {
    this.doc("Error on login if missing username.");
    var json = login(noUserName);
    this.assertEqual(SSGetType(json), InvalidUserNameError);
    login(fakemary);
  },
  
  
  testIncorrectPassword: function()
  {
    this.doc("Error on login if incorrect password.");
    var json = login(wrongPassword);
    this.assertEqual(SSGetType(json), IncorrectPasswordError);
    login(fakemary);
  },
  
  
  testAlreadyLoggedIn: function()
  {
    this.doc("Error on login if already logged in.");
    login(fakemary);
    var json = login(fakemary);
    this.assertEqual(SSGetType(json), AlreadyLoggedInError);
  },
  
  
  testLogoutNotLoggedIn: function()
  {
    this.doc("Error on logout if not logged in.");
    var json = logout();
    this.assertEqual(SSGetType(json), AlreadyLoggedOutError);
    login(fakemary);
  },
  
  
  testValidLogin: function()
  {
    this.doc("Valid login");
    var json = login(fakemary);
    this.assertEqual(SSGetData(json).userName, "fakemary");
  },
  
  
  testValidLoginOut: function()
  {
    this.doc("Valid login and out");
    login(fakemary);
    var json = logout(fakemary);
    this.assertEqual(JSON.encode(json), ack);
    login(fakemary);
  }
})

  