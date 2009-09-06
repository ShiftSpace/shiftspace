// ==Builder==
// @test
// @suite             ShiftServerTest
// @dependencies      ShiftServerTestUtils
// ==/Builder==

var ShiftTest = new Class({
  Extends: SSUnitTest.TestCase,
  name: 'ShiftTest',

  onStart: function()
  {
    SSApp.confirm(SSApp.logout());
    SSApp.confirm(SSApp.login(admin));
    SSApp.confirm(SSApp['delete']('user', 'fakemary'));
    SSApp.confirm(SSApp['delete']('user', 'fakedave'));
    SSApp.confirm(SSApp['delete']('user', 'fakejohn'));
    SSApp.confirm(SSApp.logout());
  },

  onComplete: function()
  {
    SSApp.confirm(SSApp.logout());
    SSApp.confirm(SSApp.login(admin));
    SSApp.confirm(SSApp['delete']('user', 'fakemary'));
    SSApp.confirm(SSApp['delete']('user', 'fakedave'));
    SSApp.confirm(SSApp['delete']('user', 'fakejohn'));
    SSApp.confirm(SSApp.logout());
  },

  setup: function() 
  { 
    SSApp.confirm(SSApp.join(fakemary));
  },

  tearDown: function()
  {
    SSApp.confirm(SSApp['delete']('user', 'fakemary'));
  },
  /*
  create: $fixture(
    "Create a shift.",
    function()
    {
      var shiftA = SSApp.confirm(SSApp.create('shift', noteShift));
      var shiftB = SSApp.confirm(SSApp.read('shift', shiftA._id));
      SSUnit.assertEqual(shiftA._id, shiftB._id);
    }
  ),

  
  shiftDeleteOnUserDelete: $fixture(
    "Ensure a user's shift are deleted if his account is deleted",
    function()
    {
      var shift = SSApp.confirm(SSApp.create('shift', noteShift));
      SSApp.confirm(SSApp['delete']('user', 'fakemary'));
      SSApp.confirm(SSApp.login(admin));
      var json = SSApp.confirm(SSApp.read('shift', shift._id));
      SSUnit.assertEqual(SSGetType(json), ResourceDoesNotExistError);
    }
  ),
  
  
  createNotLoggedIn: $fixture(
    "Error trying to create shift if not logged in.",
    function()
    {
      SSApp.confirm(SSApp.logout());
      var json = SSApp.confirm(SSApp.create('shift', noteShift));
      SSUnit.assertEqual(SSGetType(json), UserNotLoggedInError);
      SSApp.confirm(SSApp.login(fakemary));
    }
  ),
  
  
  read: $fixture(
    "Read a shift.",
    function()
    {
      var shift = SSApp.confirm(SSApp.create('shift', noteShift));
      SSUnit.assertEqual(shift.space.name, "Notes");
      SSUnit.assertEqual(shift.content.text, "Hello world!");
    }
  ),
  

  draft: $fixture(
    "A draft should not be visible to anybody but a logged in owner.",
    function()
    {
      var shift = SSApp.confirm(SSApp.create('shift', noteShift));
      SSApp.confirm(SSApp.logout());
      SSApp.confirm(SSApp.join(fakedave));
      var json = SSApp.confirm(SSApp.read('shift', shift._id));
      SSUnit.assertEqual(SSGetType(json), PermissionError);
      SSApp.confirm(SSApp.logout());
      SSApp.confirm(SSApp.login(fakemary));
    }
  ),

  
  publishPublic: $fixture(
    "Publish a shift to the public.",
    function()
    {
      var shift = SSApp.confirm(SSApp.create('shift', noteShift));
      SSApp.confirm(SSApp.post({resource:'shift', id:shift._id, action:'publish', data:{private:false}, json:true}));

      // TODO: check that the shift is on the user's public stream - David 7/16/09
      SSApp.confirm(SSApp.logout());
      SSApp.confirm(SSApp.join(fakedave));
    
      // check it's readable by all
      shift = SSApp.confirm(SSApp.read('shift', shift._id));
      SSUnit.assertEqual(shift.space.name, "Notes");
    
      // check comments stream
      var comments = SSApp.confirm(SSApp.get({resource:'shift', id:shift._id, action:'comments'}));
      SSUnit.assertEqual($type(comments), "array");
      
      SSApp.confirm(SSApp['delete']('user', 'fakedave'));
      SSApp.confirm(SSApp.login(fakemary));
    }
  ),
  
  
  publishPrivate: $fixture(
    "A private published shift should be visible only to people who have permission.",
    function()
    {
      var shift = SSApp.confirm(SSApp.create('shift', noteShift));
      SSApp.confirm(SSApp.logout());

      SSApp.confirm(SSApp.join(fakedave));
      var json = SSApp.confirm(SSApp.read('shift', shift._id));
      SSUnit.assertEqual(SSGetType(json), PermissionError);
      SSApp.confirm(SSApp.logout());
    
      SSApp.confirm(SSApp.login(fakemary));
      SSApp.confirm(
        SSApp.post({resource:'shift', 
                    id:shift._id, 
                    action:'publish', 
                    data:{users:['fakedave']},
                    json: true})
        );
      SSApp.confirm(SSApp.logout());
    
      SSApp.confirm(SSApp.login(fakedave));
      shift = SSApp.confirm(SSApp.read('shift', shift._id));
      SSUnit.assertEqual(shift.space.name, "Notes");
      SSApp.confirm(SSApp.logout());
    
      SSApp.confirm(SSApp.join(fakejohn));
      json = SSApp.confirm(SSApp.read('shift', shift._id));
      SSUnit.assertEqual(SSGetType(json), PermissionError);
      SSApp.confirm(SSApp.logout());
    
      SSApp.confirm(SSApp.login(admin));
      SSApp.confirm(SSApp['delete']('user', 'fakedave'));
      SSApp.confirm(SSApp['delete']('user', 'fakejohn'));
      SSApp.confirm(SSApp.logout());
      SSApp.confirm(SSApp.login(fakemary));
    }
  ),


  comment: $fixture(
    "Comment on a shift.",
    function()
    {
      var shift = SSApp.confirm(SSApp.create('shift', noteShift));
      SSApp.confirm(
        SSApp.post({resource:'shift', 
                    id:shift._id, 
                    action:'publish', 
                    data:{private:false},
                    json: true})
        );
      SSApp.confirm(SSApp.logout());
    
      SSApp.confirm(SSApp.join(fakedave));
      SSApp.confirm(
        SSApp.post({resource:'shift', 
                    id:shift._id, 
                    action:'comment', 
                    data:{text:"Hey what a cool shift!"},
                    json: true})
        );
      var comments = SSApp.confirm(SSApp.get({resource:'shift', id:shift._id, action:'comments'}));
      SSUnit.assertEqual(comments[0].content.text, "Hey what a cool shift!");
      SSApp.confirm(SSApp.logout());
    
      SSApp.confirm(SSApp.login(fakedave));
      SSApp.confirm(SSApp['delete']('user', 'fakedave'));
      SSApp.confirm(SSApp.login(fakemary));
    }
  ),

  
  readPrivateComments: $fixture(
    "Error if attempt to read comments on private shift. Should work for those with permission.",
    function()
    {
      var shift = SSApp.confirm(SSApp.create('shift', noteShift));
      SSApp.confirm(SSApp.logout());
    
      SSApp.confirm(SSApp.join(fakedave));
      var json = SSApp.confirm(SSApp.get({resource:'shift', id:shift._id, action:'comments'}));
      SSUnit.assertEqual(SSGetType(json), PermissionError);
      SSApp.confirm(SSApp.logout());
    
      // publish the shift
      SSApp.confirm(SSApp.login(fakemary));
      SSApp.confirm(
        SSApp.post({resource:'shift', 
                    id:shift._id, 
                    action:'publish', 
                    data:{users:['fakedave']},
                    json: true})
        );
      SSApp.confirm(SSApp.logout());
    
      SSApp.confirm(SSApp.login(fakedave));
      var comments = SSApp.confirm(SSApp.get({resource:'shift', id:shift._id, action:'comments'}));
      SSUnit.assertEqual($type(comments), "array");
      SSApp.confirm(SSApp['delete']('user', 'fakedave'));
      
      SSApp.confirm(SSApp.login(fakemary));
    }
  ),

  
  notify: $fixture(
    "A user on the shift comment stream notify list should get a message sent to his messageStream.",
    function()
    {
      var shift = SSApp.confirm(SSApp.create('shift', noteShift));
      SSApp.confirm(
        SSApp.post({
	  resource:'shift', 
          id:shift._id, 
          action:'publish', 
          data:{private:false},
          json: true
	})
      );
      SSApp.confirm(SSApp.logout());
      
      console.log("joining fakedave");
      SSApp.confirm(SSApp.join(fakedave));
      console.log("notifying", shift);
      SSApp.confirm(
	SSApp.post({
	  resource: 'shift', 
	  id: shift._id, 
	  action: 'notify'
	})
      );
      console.log("confirming");
      var user = SSApp.confirm(SSApp.read("user", "fakedave"));
      // check that the user should be notified about events on the shift comment stream
      SSUnit.assertEqual(user.notify.length, 1);
      SSApp.confirm(SSApp.logout());
      
      SSApp.confirm(SSApp.join(fakejohn));
      SSApp.confirm(
	SSApp.post({
	  resource: "shift",
	  id: shift._id,
	  action: "comment",
	  data: {text: "Hey what a cool shift!"},
	  json: true
	})
      );
      SSApp.confirm(SSApp.logout());
      
      SSApp.confirm(SSApp.login(fakedave));
      var messages = SSApp.confirm(SSApp.get({resource:"user", id:"fakedave", action:"messages"}));
      SSUnit.assertEqual(messages[0].content.text, "Hey what a cool shift!");

      SSApp.confirm(
	SSApp.post({
	  resource: "shift", 
	  id: shift._id,
	  action: "unnotify"
	})
      );
      user = SSApp.confirm(SSApp.read("user", "fakedave"));
      SSUnit.assertEqual(user.notify.length, 0);
      SSApp.confirm(SSApp.logout());
      
      SSApp.confirm(SSApp.login(fakejohn));
      SSApp.confirm(
	SSApp.post({
	  resource: "shift",
	  id: shift._id,
	  action: "comment", 
	  data: {text: "My other comment!"},
          json: true})
      );
      var comments = SSApp.confirm(
	SSApp.get({
	  resource: "shift",
	  id: shift._id,
	  action: "comments"
	})
      );
      SSUnit.assertEqual(comments.length, 2);
      SSApp.confirm(SSApp.logout());
      
      SSApp.confirm(SSApp.login(fakedave));
      messages = SSApp.confirm(
	SSApp.get({
	  resource: "user",
	  id: "fakedave",
	  action: "messages"
	})
      );
      SSUnit.assertEqual(messages.length, 1);
      SSApp.confirm(SSApp.logout());
      
      SSApp.confirm(SSApp.login(admin));
      SSApp.confirm(SSApp['delete']('user', 'fakedave'));
      SSApp.confirm(SSApp['delete']('user', 'fakejohn'));
      SSApp.confirm(SSApp.logout());
      SSApp.confirm(SSApp.login(fakemary));
    }
  ),*/

  
  update: $fixture(
    "Update a shift",
    function()
    {
      var shift = SSApp.confirm(SSApp.create("shift", noteShift));
      shift = SSApp.confirm(
	SSApp.update("shift", shift._id, 
	  {
	    content: 
	    {
              text: "Changed the note!",
              position: {x:500, y:400},
              size: {x:500, y:400}
	    }
	  })
      );

      var content = shift.content;
      SSUnit.assertEqual(content.text, "Changed the note!");
      SSUnit.assertEqual(content.position.x, 500);
      SSUnit.assertEqual(content.position.y, 400);
    }
  )/*,

  
  testUpdatePermission: function()
  {
    this.doc("Error updating a shift without the proper permissions. Admin allowed.");
    
    var shiftId = SSGetData.attempt(app.create('shift', noteShift));
    logout();
    // no logged in user
    var errType = SSGetType.attempt(app.update('shift', shiftId, {
      content: {
        text: "Changed the note!",
        position: {x:500, y:400},
        size: {x:500, y:400}
      }
    }));
    this.assertEqual(errType, UserNotLoggedInError);
    
    // wrong user
    join(fakedave);
    errType = SSGetType.attempt(app.update('shift', shiftId, {
      content: {
        text: "Changed the note!",
        position: {x:500, y:400},
        size: {x:500, y:400}
      }
    }));
    this.assertEqual(errType, PermissionError);
    logout();
    
    login(admin);
    app.update('shift', shiftId, {
      content: {
        text: "Changed the note!",
        position: {x:500, y:400},
        size: {x:500, y:400}
      }
    });
    var json = SSGetData.attempt(app.read('shift', shiftId));
    var content = json.content;
    this.assertEqual(content.text, "Changed the note!");
    this.assertEqual(content.position.x, 500);
    this.assertEqual(content.position.y, 400);
    
    app.delete('user', 'fakedave');
    // admin should be able to read
  },

  
  testDelete: function()
  {
    this.doc("Delete a shift.");
    
    var shiftId = SSGetData.attempt(app.create('shift', noteShift));
    app.delete('shift', shiftId);
    var errType = SSGetType.attempt(app.read('shift', shiftId))
    this.assertEqual(errType, ResourceDoesNotExistError);
  },
  
  
  testDeletePermission: function()
  {
    this.doc("Error deleting a shift without permission. Admin allowed");
    
    var shiftId = SSGetData.attempt(app.create('shift', noteShift));
    logout();
    
    var errType = SSGetType.attempt(app.delete('shift', shiftId));
    this.assertEqual(errType, UserNotLoggedInError);
    
    join(fakedave);
    errType = SSGetType.attempt(app.delete('shift', shiftId));
    this.assertEqual(errType, PermissionError);
    logout();
    
    login(admin);
    var json = app.delete('shift', shiftId);
    this.assertEqual(JSON.encode(json), ack);
    
    app.delete('user', 'fakedave');
  }*/
})

