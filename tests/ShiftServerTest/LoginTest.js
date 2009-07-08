// ==Builder==
// @test
// @suite             ShiftServerTest
// @dependencies      ShiftServerTestUtils
// ==/Builder==

var LoginTest = new Class({

  Extends: SSUnitTest.TestCase,
  name: 'LoginTest',
  
  setup: function()
  {
    req({
      url: '/logout',
      method: 'post'
    });
  },
  
  
  tearDown: function()
  {
  },
  
  
  testNoUserName: function()
  {
    this.doc("Error on login if missing username.");
    
    var hook = this.startAsync();

    req({
      url: '/login',
      method: 'post',
      data: {userName:"", password:"bazbaz"},
      onComplete: function(json) 
      {
        this.assertEqual(json.type, InvalidUserNameError, hook);
      }.bind(this)
    });
    
    this.endAsync(hook);
  },
  
  
  testIncorrectPassword: function()
  {
    this.doc("Error on login if incorrect password.");
    
    var hook = this.startAsync();

    req({
      url: '/login',
      method: 'post',
      data: {userName:"fakebob", password:"bazbar"},
      onComplete: function(json) 
      {
        this.assertEqual(json.type, IncorrectPasswordError, hook);
      }.bind(this)
    });
    
    this.endAsync(hook);
  },
  
  
  testAlreadyLoggedIn: function()
  {
    this.doc("Error on login if already logged in.");
    
    var hook = this.startAsync();

    req({
      url: '/login',
      method: 'post',
      data: {userName:"fakebob", password:"bazbaz"},
    });
    
    req({
      url: '/login',
      method: 'post',
      data: {userName:"fakebob", password:"bazbaz"},
      onComplete: function(json) 
      {
        this.assertEqual(json.type, AlreadyLoggedInError, hook);
      }.bind(this)
    });
    
    this.endAsync(hook);
  },
  
  
  testLogoutNotLoggedIn: function()
  {
    this.doc("Error on logout if not logged in.");
    
    var hook = this.startAsync();
    
    req({
      url: '/logout',
      method: 'post',
      onComplete: function(json) 
      {
        this.assertEqual(json.type, AlreadyLoggedOutError, hook);
      }.bind(this)
    });
    
    this.endAsync(hook);
  },
  
  
  testValidLogin: function()
  {
    this.doc("Valid login");
    
    var hook = this.startAsync();
    
    req({
      url: '/login',
      method: 'post',
      data: {userName:"fakebob", password:"bazbaz"},
      onComplete: function(json) 
      {
        this.assertEqual(json.data.userName, "fakebob", hook);
      }.bind(this)
    });
    
    this.endAsync(hook);
  },
  
  
  testValidLoginOut: function()
  {
    this.doc("Valid login and out");
    
    var hook = this.startAsync();
    
    req({
      url: '/login',
      method: 'post',
      data: {userName:"fakebob", password:"bazbaz"}
    });
    
    req({
      url: '/logout',
      method: 'post',
      onComplete: function(json) 
      {
        this.assertEqual(jsonFormat(json), jsonFormat(ack), hook);
      }.bind(this)
    });
    
    this.endAsync(hook);
  }
})

  