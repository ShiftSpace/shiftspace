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
    join(fakemary);
  },
  

  tearDown: function()
  {
    app.delete('user', 'fakemary');
    logout();
  },
  
  /*
  testCreate: function()
  {
    this.doc("Create a shift.");
    var idA = SSGetData(app.create('shift', noteShift));
    var idB = SSGetData(app.read('shift', idA))._id;
    this.assertEqual(idA, idB);
  },

  
  testShiftDeleteOnUserDelete: function()
  {
    this.doc("Ensure a user's shift are deleted if his account is deleted");
    var shiftId = SSGetData(app.create('shift', noteShift));
    app.delete('user', 'fakemary');
    login(admin);
    var json = app.read('shift', shiftId);
    this.assertEqual(SSGetType(json), ResourceDoesNotExistError); 
  },
  
  
  testCreateNotLoggedIn: function()
  {
    this.doc("Error trying to create shift if not logged in.");
    logout();
    var json = app.create('shift', noteShift);
    this.assertEqual(SSGetType(json), UserNotLoggedInError);
    login(fakemary);
  },
  
  
  testRead: function()
  {
    this.doc("Read a shift.");
    var shiftId = SSGetData(app.create('shift', noteShift));
    var data = SSGetData(app.read('shift', shiftId));
    this.assertEqual(data.space, "Notes");
    this.assertEqual(data.text, "Hello world!");
  },
  

  testDraft: function()
  {
    this.doc("A draft should not be visible to anybody but a logged in owner.");
    var shiftId = SSGetData(app.create('shift', noteShift));
    logout();
    app.action('join', fakedave);
    var json = app.read('shift', shiftId);
    this.assertEqual(SSGetType(json), PermissionError);
    logout();
    login(fakemary);
  },

  
  testPublishPublic: function()
  {
    this.doc("Publish a shift to the public.");
    var shiftId = SSGetData(app.create('shift', noteShift));
    app.action('shift/'+shiftId+'/publish', {
      private: false
    });
    logout();
    app.action('join', fakedave);
    
    // check it's readable by all
    var json = SSGetData(app.read('shift', shiftId));
    this.assertEqual(json.space, "Notes");
    
    // check comments stream
    json = SSGetData(app.get('shift/'+shiftId+'/comments'));
    this.assertEqual($type(json), "array");
    logout();
    
    login(admin);
    app.delete('user', 'fakedave');
  },
  
  
  testPublishPrivate: function()
  {
    this.doc("A private published shift should be visible only to people who have permission.");
    
    var shiftId = SSGetData(app.create('shift', noteShift));
    logout();
    
    join(fakedave);
    var json = app.read('shift', shiftId);
    this.assertEqual(SSGetType(json), PermissionError);
    logout();
    
    login(fakemary);
    app.action('shift/'+shiftId+'/publish', {
      users: ['fakedave']
    });
    logout();
    
    login(fakedave);
    json = SSGetData(app.read('shift', shiftId));
    this.assertEqual(json.space, "Notes");
    logout();
    
    join(fakejohn);
    json = app.read('shift', shiftId);
    this.assertEqual(SSGetType(json), PermissionError);
    logout();
    
    login(admin);
    app.delete('user', 'fakedave');
    app.delete('user', 'fakejohn');
  },


  testComment: function()
  {
    this.doc("Comment on a shift.");
    
    var shiftId = SSGetData(app.create('shift', noteShift));
    app.action('shift/'+shiftId+'/publish', {
      private: false
    });
    logout();
    
    join(fakedave);
    json = app.action('shift/'+shiftId+"/comment", {
      text: "Hey what a cool shift!"
    });
    json = SSGetData(app.get('shift/'+shiftId+'/comments'));
    this.assertEqual(json[0].content.text, "Hey what a cool shift!");
    logout();
    
    login(admin);
    app.delete('user', 'fakedave');
  },

  
  testReadPrivateComments: function()
  {
    this.doc("Error if attempt to read on private should. Should work for those with permission.");

    var shiftId = SSGetData(app.create('shift', noteShift));
    logout();
    
    join(fakedave);
    var json = app.get('shift/' + shiftId + '/comments');
    this.assertEqual(SSGetType(json), PermissionError);
    logout();
    
    // publish the shift
    login(fakemary);
    app.action('shift/'+shiftId+'/publish', {
      users: ['fakedave']
    });
    logout();
    
    login(fakedave);
    json = SSGetData(app.get('shift/' + shiftId + '/comments'));
    this.assertEqual($type(json), "array");
    logout();
    
    login(admin);
    app.delete('user', 'fakedave');
  },
  */
  
  testNotify: function()
  {
    this.doc("A user on the shift comment stream notify list should get a message sent to his messageStream.");
    
    var shiftId = SSGetData(app.create('shift', noteShift));
    app.action('shift/'+shiftId+'/publish', {
      private: false
    });
    logout();
    
    join(fakedave);
    json = SSGetData.attempt(app.action('shift/'+shiftId+'/notify'));
    json = SSGetData.attempt(app.get('/user/fakedave'));
    this.assertEqual(json.notify.length, 1);
    logout();
    
    join(fakejohn);
    app.action('shift/'+shiftId+"/comment", {
      text: "Hey what a cool shift!"
    });
    logout();
    
    login(fakedave);
    json = SSGetData.attempt(app.get('user/fakedave/messages'));
    this.assertEqual(json[0].content.text, "Hey what a cool shift!");
    app.action('shift/'+shiftId+'/unnotify');
    json = SSGetData.attempt(app.get('/user/fakedave'));
    this.assertEqual(json.notify.length, 0);
    logout();
    
    login(fakejohn)
    app.action('shift/'+shiftId+"/comment", {
      text: "My other comment!"
    });
    json = SSGetData.attempt(app.get('shift/'+shiftId+'/comments'));
    this.assertEqual(json.length, 2);
    logout();
    
    login(fakedave);
    json = SSGetData.attempt(app.get('user/fakedave/messages'));
    this.assertEqual(json.length, 1);
    logout();
    
    login(admin);
    app.delete('user', 'fakedave');
    app.delete('user', 'fakejohn');
  }/*,
  
  
  testUnpublish: function()
  {
    this.doc("Unpublish takes the shift off any streams it's currently on.");
    
    
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
  }*/
})

