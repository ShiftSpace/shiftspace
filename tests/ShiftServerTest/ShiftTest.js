// ==Builder==
// @test
// @suite             ShiftServerTest
// @dependencies      ShiftServerTestUtils
// ==/Builder==

var ShiftTest = new Class({

  Extends: SSUnitTest.TestCase,
  name: 'ShiftTest',
  
  setup: function()
  {
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
  },
  
  
  tearDown: function()
  {
    req({
      url:'/user',
      resourceId:'fakemary',
      emulation: false,
      method: 'delete'
    });
    logout();
  },
  

  testCreate: function()
  {
    this.doc("Create a shift.");
    
    var hook = this.startAsync();
    var shiftId;

    req({
      url:'/shift',
      method:'post',
      json: true,
      data:
      {
        space: "Notes",
        position: {x:150, y:150},
        size: {x:200, y:200},
        summary: "Foo!",
        text: "Hello world!"
      },
      onComplete: function(json)
      {
        shiftId = SSGetData(json);
      }.bind(this)
    });
    
    req({
      url:'/shift',
      resourceId: shiftId,
      method: 'get',
      onComplete: function(json)
      {
        this.assertEqual(SSGetData(json)._id, shiftId, hook);
      }.bind(this)
    });
    
    this.endAsync(hook);
  },

  
  testShiftDeleteOnUserDelete: function()
  {
    this.doc("Ensure a user's shift are deleted if his account is deleted");
    
    var hook = this.startAsync();
    var shiftId;

    req({
      url:'/shift',
      method:'post',
      json: true,
      data:
      {
        space: "Notes",
        position: {x:150, y:150},
        size: {x:200, y:200},
        summary: "Foo!",
        text: "Hello world!"
      },
      onComplete: function(json)
      {
        shiftId = SSGetData(json);
      }.bind(this)
    });
    
    req({
      url:'/user',
      resourceId:'fakemary',
      emulation: false,
      method: 'delete'
    });
    
    adminLogin();
    
    req({
      url:'/shift',
      resourceId: shiftId,
      method: 'get',
      onComplete: function(json)
      {
        this.assertEqual(SSGetType(json), ResourceDoesNotExistError, hook);
      }.bind(this)
    });
    
    this.endAsync(hook);
  },
  
  
  testCreateNotLoggedIn: function()
  {
    this.doc("Error trying to create shift if not logged in.");
    this.assertEqual(true, false);
  },
  
  
  testRead: function()
  {
    this.doc("Read a shift.");
    this.assertEqual(true, false);
  },
  
  
  testUpdateNotLoggedIn: function()
  {
    this.doc("Error updating a shift if not logged in.");
    this.assertEqual(true, false);
  },
  
  
  testDelete: function()
  {
    this.doc("Delete a shift.");
    this.assertEqual(true, false);
  },
  
  
  testAdminDelete: function()
  {
    this.doc("Admin should be able to delete a shift.");
    this.assertEqual(true, false);
  },
  
  
  testDeleteNotLoggedIn: function()
  {
    this.doc("Error on deleting a shift if not logged in.");
    this.assertEqual(true, false);
  },
  
  
  testDraft: function()
  {
    this.doc("A draft should not be visible to anybody but a logged in owner.");
    this.assertEqual(true, false);
  },
  
  
  testPrivate: function()
  {
    this.doc("A private published shift should be visible to people who have permission.");
    this.assertEqual(true, false);
  },
  
  
  testPublic: function()
  {
    this.doc("A public shift be visible to anyone.");
    this.assertEqual(true, false);
  },
  
  
  testComment: function()
  {
    this.doc("A comment on a shift should send a message to anyone who has commented on the shift.");
    this.assertEqual(true, false);
  }
})

