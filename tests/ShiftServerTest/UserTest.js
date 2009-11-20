// ==Builder==
// @test
// @suite             ShiftServerTest
// @dependencies      ShiftServerTestUtils
// ==/Builder==

var missingEmail = {
  userName:"fakemary",
  password:"foobar",
  passwordVerify:"foobar"
};

var missingUserName = {
  email: "fakemary@gmail.com",
  password:"foobar",
  passwordVerify:"foobar"
};

var shortUserName = {
  userName: "fake",
  email: "fakemary@gmail.com",
  password:"foobar",
  passwordVerify:"foobar"
};

var userNameTaken = {
  userName: "fakemary",
  email: "fakemary@gmail.com",
  password:"foobar",
  passwordVerify:"foobar"
};

var missingPassword = {
  userName: "fakemary",
  email: "fakemary@gmail.com",
  passwordVerify:"foobar"
};

var missingPasswordVerify = {
  userName: "fakemary",
  email: "fakemary@gmail.com",
  password:"foobar"
};

var passwordMismatch = {
  userName: "fakemary",
  email: "fakemary@gmail.com",
  password:"foobar",
  passwordVerify:"foobaz"
};

var UserTest = new Class({

  Extends: SSUnitTest.TestCase,
  name: 'UserTest',
  

  setup: function() {},
  tearDown: function() {},
  

  missingEmail: $fixture(
    "Missing email.",
    function()
    {
      var json = SSApp.confirm(SSApp.join(missingEmail));
      SSUnit.assertEqual(SSGetType(json), NoEmailError);
    }
  ),
  

  missingUserName: $fixture(
    "Error on missing userName",
    function()
    {
      var json = SSApp.confirm(SSApp.join(missingUserName));
      SSUnit.assertEqual(SSGetType(json), MissingUserNameError);
    }
  ),


  shortUserName: $fixture(
    "Error on short user name",
    function()
    {
      var json = SSApp.confirm(SSApp.join(shortUserName));
      SSUnit.assertEqual(SSGetType(json), ShortUserNameError);
    }
  ),
  

  userNameTaken: $fixture(
    "Error on user name taken.",
    function()
    {
      SSApp.confirm(SSApp.join(fakemary));
      SSApp.confirm(SSApp.logout());
      var json = SSApp.confirm(SSApp.join(userNameTaken));
      SSUnit.assertEqual(SSGetType(json), UserNameAlreadyExistsError);
      SSApp.confirm(SSApp.login(fakemary));
      SSApp.confirm(SSApp['delete']('user', 'fakemary'));
    }
  ),
  

  missingPassword: $fixture(
    "Error on missing password",
    function()
    {
      var json = SSApp.confirm(SSApp.join(missingPassword));
      SSUnit.assertEqual(SSGetType(json), MissingPasswordError);
    }
  ),
  

  missingPasswordVerify: $fixture(
    "Error on missing password verify",
    function()
    {
      var json = SSApp.confirm(SSApp.join(missingPasswordVerify));
      SSUnit.assertEqual(SSGetType(json), MissingPasswordVerifyError);
    }
  ),
  

  passwordMatch: $fixture(
    "Error on password/passwordVerify mismatch",
    function()
    {
      var json = SSApp.confirm(SSApp.join(passwordMismatch));
      SSUnit.assertEqual(SSGetType(json), PasswordMatchError);
    }
  ),
  

  validUser: $fixture(
    "Valid user",
    function()
    {
      var json = SSApp.confirm(SSApp.join(fakemary));
      SSUnit.assertEqual(json.userName, "fakemary");
      SSApp.confirm(SSApp['delete']('user', 'fakemary'));
    }
  ),
  

  basicDeleteUser: $fixture(
    "Test basic deletion. Only verify the account no longer exists",
    function()
    {
      SSApp.confirm(SSApp.join(fakemary));
      SSApp.confirm(SSApp['delete']('user', 'fakemary'));
      var json = SSApp.confirm(SSApp.read('user', 'fakemary'));
      SSUnit.assertEqual(SSGetType(json), UserDoesNotExistError);
    }
  ),
  

  deletePermission: $fixture(
    "Cannot delete account if not logged in, or not the right user.",
    function()
    {
      SSApp.confirm(SSApp.join(fakemary));
      SSApp.confirm(SSApp.logout());
      var json = SSApp.confirm(SSApp['delete']('user', 'fakemary'));
      SSUnit.assertEqual(SSGetType(json), UserNotLoggedInError);
      SSApp.confirm(SSApp.login(fakemary));
      SSApp.confirm(SSApp['delete']('user', 'fakemary'));
    }
  ),
  

  adminDeletePermission: $fixture(
    "Can delete account if logged in as admin",
    function()
    {
      SSApp.confirm(SSApp.join(fakemary));
      SSApp.confirm(SSApp.logout());
      SSApp.confirm(SSApp.login(admin));
      var json = SSApp.confirm(SSApp['delete']('user', 'fakemary'));
      SSUnit.assertEqual(JSON.encode(json), ack);
      SSApp.confirm(SSApp.logout());
    }
  ),


  follow: $fixture(
    "Test following other users.",
    function()
    {
      SSApp.confirm(SSApp.logout());
      SSApp.confirm(SSApp.join(fakemary));
      SSApp.confirm(SSApp.logout());
      
      // fakejohn follow fakemary
      SSApp.confirm(SSApp.join(fakejohn));
      SSApp.confirm(SSApp.login(fakejohn));
      var json = SSApp.confirm(SSApp.post({
        resource: 'follow',
        id: 'fakemary'
      }));
      var theUser = SSApp.confirm(SSApp.get({
        resource: 'user',
        id: 'fakejohn'
      }));
      SSUnit.assertEqual(theUser.following.length, 1);
      SSApp.confirm(SSApp.logout());
      
      // fakemary create shift
      SSApp.confirm(SSApp.login(fakemary));
      var theShift = SSApp.confirm(SSApp.create('shift', noteShift));
      SSApp.confirm(SSApp.post({
        resource: 'shift',
        id: theShift._id,
        action: 'publish',
        data: {private: false},
        json: true
      }));
      SSApp.confirm(SSApp.logout());
      
      // check fakejohn's feed 
      SSApp.confirm(SSApp.login(fakejohn));
      var feed = SSApp.confirm(SSApp.get({
        resource: 'user',
        id: 'fakejohn',
        action: 'feed'
      }));
      SSUnit.assertEqual(feed.length, 1);
      SSApp.confirm(SSApp.logout());
      
      // cleanup
      SSApp.confirm(SSApp.login(admin));
      SSApp.confirm(SSApp['delete']('user', 'fakemary'));
      SSApp.confirm(SSApp['delete']('user', 'fakejohn'));
      SSApp.confirm(SSApp.logout());
    }
  )

});