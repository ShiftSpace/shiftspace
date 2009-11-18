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
    SSApp.confirm(SSApp.join(fakemary));
    SSApp.confirm(SSApp.logout());
  },
  
  
  tearDown: function()
  {
    SSApp.confirm(SSApp['delete']('user', 'fakemary'));
  },
  
  
  noUserName: $fixture(
    "Error on login if missing username.",
    function()
    {
      var json = SSApp.confirm(SSApp.login(noUserName));
      SSUnit.assertEqual(SSGetType(json), InvalidUserNameError);
      SSApp.confirm(SSApp.login(fakemary));
    }
  ),


  incorrectPassword: $fixture(
    "Error on login if incorrect password.",
    function()
    {
      var json = SSApp.confirm(SSApp.login(wrongPassword));
      SSUnit.assertEqual(SSGetType(json), IncorrectPasswordError);
      SSApp.confirm(SSApp.login(fakemary));
    }
  ),
  

  alreadyLoggedIn: $fixture(
    "Error on login if already logged in.",
    function()
    {
      SSApp.confirm(SSApp.login(fakemary));
      var json = SSApp.confirm(SSApp.login(fakemary));
      SSUnit.assertEqual(SSGetType(json), AlreadyLoggedInError);
    }
  ),
  

  logoutNotLoggedIn: $fixture(
    "Error on logout if not logged in.",
    function()
    {
      var json = SSApp.confirm(SSApp.logout());
      SSUnit.assertEqual(SSGetType(json), AlreadyLoggedOutError);
      SSApp.confirm(SSApp.login(fakemary));
    }
  ),
  

  validLogin: $fixture(
    "Valid login",
    function()
    {
      var json = SSApp.confirm(SSApp.login(fakemary));
      SSUnit.assertEqual(json.userName, "fakemary");
    }
  ),
  

  validLoginOut: $fixture(
    "Valid login and out",
    function()
    {
      SSApp.confirm(SSApp.login(fakemary));
      var json = SSApp.confirm(SSApp.logout(fakemary));
      SSUnit.assertEqual(JSON.encode(json), ack);
      SSApp.confirm(SSApp.login(fakemary));
    }
  )
})

  