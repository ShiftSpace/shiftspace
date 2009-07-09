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
  },
  

  testMissingEmail: function()
  {
    this.doc("Error on missing email");
    
    var hook = this.startAsync();
    
    req({
      url: '/join',
      json: true,
      data:
      {
        userName:"fakemary",
        password:"foobar",
        passwordVerify:"foobar"
      },
      method: 'post',
      onComplete: function(json)
      {
        this.assertEqual(json.type, NoEmailError, hook);
      }.bind(this)
    });
    
    this.endAsync(hook);
  },
  
  
  testMissingUserName: function()
  {
    this.doc("Error on missing userName");
    
    var hook = this.startAsync();
    
    req({
      url: '/join',
      json: true,
      data:
      {
        email: "fakemary@gmail.com",
        password:"foobar",
        passwordVerify:"foobar"
      },
      method: 'post',
      onComplete: function(json)
      {
        this.assertEqual(json.type, MissingUserNameError, hook);
      }.bind(this)
    });
    
    this.endAsync(hook);
  },
  

  testShortUserName: function()
  {
    this.doc("Error on short user name");
    
    var hook = this.startAsync();
    
    req({
      url: '/join',
      json: true,
      data:
      {
        userName: "fake",
        email: "fakemary@gmail.com",
        password:"foobar",
        passwordVerify:"foobar"
      },
      method: 'post',
      onComplete: function(json)
      {
        this.assertEqual(json.type, ShortUserNameError, hook);
      }.bind(this)
    });
    
    this.endAsync(hook);
  },
  
  
  testUserNameTaken: function()
  {
    this.doc("Error on user name taken.");
    
    var hook = this.startAsync();
    
    req({
      url: '/join',
      json: true,
      data:
      {
        userName: "fakebob",
        email: "fakemary@gmail.com",
        password:"foobar",
        passwordVerify:"foobar"
      },
      method: 'post',
      onComplete: function(json)
      {
        this.assertEqual(json.type, UserNameAlreadyExistsError, hook);
      }.bind(this)
    });
    
    this.endAsync(hook);
  },
  
  
  testMissingPassword: function()
  {
    this.doc("Error on missing password");
    
    var hook = this.startAsync();
    
    req({
      url: '/join',
      json: true,
      data:
      {
        userName: "fakemary",
        email: "fakemary@gmail.com",
        passwordVerify:"foobar"
      },
      method: 'post',
      onComplete: function(json)
      {
        this.assertEqual(json.type, MissingPasswordError, hook);
      }.bind(this)
    });
    
    this.endAsync(hook);
  },
  
  
  testMissingPasswordVerify: function()
  {
    this.doc("Error on missing password verify");
    
    var hook = this.startAsync();
    
    req({
      url: '/join',
      json: true,
      data:
      {
        userName: "fakemary",
        email: "fakemary@gmail.com",
        password:"foobar"
      },
      method: 'post',
      onComplete: function(json)
      {
        this.assertEqual(json.type, MissingPasswordVerifyError, hook);
      }.bind(this)
    });
    
    this.endAsync(hook);
  },
  
  
  testPasswordMatch: function()
  {
    this.doc("Error on password/passwordVerify mismatch");
    
    var hook = this.startAsync();
    
    req({
      url: '/join',
      json: true,
      data:
      {
        userName: "fakemary",
        email: "fakemary@gmail.com",
        password:"foobar",
        passwordVerify:"foobaz"
      },
      method: 'post',
      onComplete: function(json)
      {
        this.assertEqual(json.type, PasswordMatchError, hook);
      }.bind(this)
    });
    
    this.endAsync(hook);
  },
  
  
  testValidUser: function()
  {
    this.doc("Valid user");

    var hook = this.startAsync();
    
    req({
      url: '/join',
      json: true,
      data:
      {
        userName: "fakemary",
        email: "fakemary@gmail.com",
        password:"foobar",
        passwordVerify:"foobar"
      },
      method: 'post',
      onComplete: function(json)
      {
        this.assertEqual(json.data.userName, "fakemary", hook);
      }.bind(this)
    });
    
    req({
      url:'/user',
      resourceId:'fakemary',
      emulation: false,
      method: 'delete'
    });
    
    this.endAsync(hook);
  },
  
  
  testBasicDeleteUser: function()
  {
    this.doc("Test basic deletion. Only verify the account no longer exists");
    
    var hook = this.startAsync();
    
    req({
      url: '/join',
      json: true,
      data:
      {
        userName: "fakemary",
        email: "fakemary@gmail.com",
        password:"foobar",
        passwordVerify:"foobar"
      },
      method: 'post'
    });
    
    req({
      url:'/user',
      resourceId:'fakemary',
      emulation: false,
      method: 'delete'
    });
    
    req({
      url:'/user',
      resourceId:'fakemary',
      method: 'get',
      onComplete: function(json)
      {
        this.assertEqual(json.type, UserDoesNotExistError, hook);
      }.bind(this)
    });
    
    this.endAsync(hook);
  },
  
  
  testDeletePermission: function()
  {
    this.doc("Cannot delete account if not logged in, or not the right user.");
    
    var hook = this.startAsync();
    
    req({
      url: '/join',
      json: true,
      data:
      {
        userName: "fakemary",
        email: "fakemary@gmail.com",
        password:"foobar",
        passwordVerify:"foobar"
      },
      method: 'post'
    });
    
    req({
      url:'/logout',
      method: 'post'
    })
    
    req({
      url:'/user',
      resourceId:'fakemary',
      emulation: false,
      method: 'delete',
      onComplete: function(json)
      {
        this.assertEqual(json.type, UserNotLoggedInError, hook);
      }.bind(this)
    });
    
    req({
      url: '/login',
      data:
      {
        userName: "fakemary",
        password: "foobar"
      },
      method: 'post'
    });
    
    req({
      url:'/user',
      resourceId:'fakemary',
      emulation: false,
      method: 'delete'
    });
    
    this.endAsync(hook);
  },
  

  testAdminDeletePermission: function()
  {
    this.doc("Can delete account if logged in as admin");

    var hook = this.startAsync();
    
    req({
      url: '/join',
      json: true,
      data:
      {
        userName: "fakemary",
        email: "fakemary@gmail.com",
        password:"foobar",
        passwordVerify:"foobar"
      },
      method: 'post'
    });
    
    req({
      url:'/logout',
      method: 'post'
    })
    
    adminLogin();
    
    req({
      url:'/user',
      resourceId:'fakemary',
      emulation: false,
      method: 'delete',
      onComplete: function(json)
      {
        this.assertEqual(JSON.encode(json), ack, hook);
      }.bind(this)
    });
    
    req({
      url:'/logout',
      method: 'post'
    })
    
    this.endAsync(hook);
  },
  
  
  testUserStreamsExists: function()
  {
    this.doc("User public and private stream should exist and have the right values after account creation.");
    
    var hook = this.startAsync();
    
    var publicStream;
    var messageStream;
    var userId;
    
    req({
      url: '/join',
      json: true,
      data:
      {
        userName: "fakemary",
        email: "fakemary@gmail.com",
        password:"foobar",
        passwordVerify:"foobar"
      },
      method: 'post',
      onComplete: function(json)
      {
        publicStream = json.data.publicStream;
        messageStream = json.data.messageStream;
        userId = json.data._id;
        
        this.assertNotEqual(publicStream, null, hook);
        this.assertNotEqual(messageStream, null, hook);
      }.bind(this)
    });

    req({
      url: '/stream',
      resourceId: messageStream,
      method: 'get',
      onComplete: function(json)
      {
        this.assertEqual(json.data.createdBy, userId, hook)
      }.bind(this)
    });
    
    req({
      url: '/stream',
      resourceId: publicStream,
      method: 'get',
      onComplete: function(json)
      {
        this.assertEqual(json.data.createdBy, userId, hook)
      }.bind(this)
    });
    
    req({
      url:'/user',
      resourceId:'fakemary',
      emulation: false,
      method: 'delete'
    });
    
    this.endAsync(hook);
  }/*,
  
  testDeleteUserContent: function()
  {
    this.doc("User's public stream, private stream, events, and shifts should be deleted");
    
    this.assertEqual(true, false);
  }
  */  
});