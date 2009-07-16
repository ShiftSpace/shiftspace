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
  

  setup: function()
  {
    
  },
  

  tearDown: function()
  {
  },
  
  /*
  testMissingEmail: function()
  {
    this.doc("Error on missing email");
    var json = app.action('join', missingEmail);
    this.assertEqual(SSGetType(json), NoEmailError);
  },
  
  
  testMissingUserName: function()
  {
    this.doc("Error on missing userName");
    var json = app.action('join', missingUserName);
    this.assertEqual(SSGetType(json), MissingUserNameError);
  },
  

  testShortUserName: function()
  {
    this.doc("Error on short user name");
    var json = app.action('join', shortUserName);
    this.assertEqual(SSGetType(json), ShortUserNameError);
  },
  
  
  testUserNameTaken: function()
  {
    this.doc("Error on user name taken.");
    join(fakemary);
    logout();
    var json = join(userNameTaken);
    this.assertEqual(SSGetType(json), UserNameAlreadyExistsError);
    login(fakemary);
    app.delete('user', 'fakemary');
  },
  
  
  testMissingPassword: function()
  {
    this.doc("Error on missing password");
    var json = app.action('join', missingPassword);
    this.assertEqual(SSGetType(json), MissingPasswordError);
  },
  
  
  testMissingPasswordVerify: function()
  {
    this.doc("Error on missing password verify");
    var json = app.action('join', missingPasswordVerify);
    this.assertEqual(SSGetType(json), MissingPasswordVerifyError);
  },
  
  
  testPasswordMatch: function()
  {
    this.doc("Error on password/passwordVerify mismatch");
    var json = app.action('join', passwordMismatch);
    this.assertEqual(SSGetType(json), PasswordMatchError);
  },
  
  
  testValidUser: function()
  {
    this.doc("Valid user");
    var json = app.action('join', fakemary);
    this.assertEqual(SSGetData(json).userName, "fakemary");
    app.delete('user', 'fakemary');
  },
  
  
  testBasicDeleteUser: function()
  {
    this.doc("Test basic deletion. Only verify the account no longer exists");
    app.action('join', fakemary);
    app.delete('user', 'fakemary');
    var json = app.read('user', 'fakemary');
    this.assertEqual(SSGetType(json), UserDoesNotExistError);
  },
  
  
  testDeletePermission: function()
  {
    this.doc("Cannot delete account if not logged in, or not the right user.");
    app.action('join', fakemary);
    logout();
    var json = app.delete('user', 'fakemary');
    this.assertEqual(SSGetType(json), UserNotLoggedInError);
    login(fakemary);
    app.delete('user', 'fakemary');
  },
  

  testAdminDeletePermission: function()
  {
    this.doc("Can delete account if logged in as admin");
    app.action('join', fakemary);
    logout();
    login(admin);
    var json = app.delete('user', 'fakemary');
    this.assertEqual(JSON.encode(json), ack);
    logout();
  },
  
  
  testUserStreamsExists: function()
  {
    this.doc("User public and private stream should exist and have the right values after account creation.");
    
    var json = app.action('join', fakemary);
    var data = SSGetData(json);
    var publicStream = data.publicStream;
    var messageStream = data.messageStream;
    var userId = data._id;
        
    this.assertNotEqual(publicStream, null);
    this.assertNotEqual(messageStream, null);
    
    json = app.read('stream', messageStream);
    this.assertEqual(SSGetData(json).createdBy, userId);
    json = app.read('stream', publicStream);
    this.assertEqual(SSGetData(json).createdBy, userId);
    
    app.delete('user', 'fakemary');
  },
  
  
  testDeleteUserContent: function()
  {
    this.doc("User's public stream, private stream, events, and shifts should be deleted");
    
    var json = app.action('join', fakemary);
    var data = SSGetData(json);
    var publicStream = data.publicStream;
    var messageStream = data.messageStream;
    var userId = data._id;
    
    app.delete('user', 'fakemary');
  
    json = app.read('stream', messageStream);
    this.assertEqual(SSGetType(json), ResourceDoesNotExistError);
    json = app.read('stream', publicStream);
    this.assertEqual(SSGetType(json), ResourceDoesNotExistError);
  },
  */
  
  testFollow: function()
  {
    this.doc("Test following other users.");
    
    logout();
    join(fakemary);
    logout();

    join(fakejohn);
    logout();

    login(fakemary);
    var shiftId = SSGetData(app.create('shift', noteShift));
    app.action('shift/'+shiftId+'/publish', {
      private: false
    });
    logout();
    
    login(fakejohn);
    var json = app.action('follow/fakemary');
    json = app.get('user/fakejohn/feeds');
    logout();
    
    login(admin);
    app.delete('user', 'fakemary');
    app.delete('user', 'fakejohn');
    logout();
  }

});