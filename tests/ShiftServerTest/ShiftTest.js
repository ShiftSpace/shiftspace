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
      SSUnit.assertEqual(shift.content.noteText, "Foo!");
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
      
      SSApp.confirm(SSApp.logout());
      SSApp.confirm(SSApp.join(fakedave));
      
      // check it's readable by all
      shift = SSApp.confirm(SSApp.read('shift', shift._id));
      SSUnit.assertEqual(shift.space.name, "Notes");
      
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
      
      var fakedaveJson = SSApp.confirm(SSApp.join(fakedave));
      var json = SSApp.confirm(SSApp.read('shift', shift._id));
      SSUnit.assertEqual(SSGetType(json), PermissionError);
      SSApp.confirm(SSApp.logout());
      
      SSApp.confirm(SSApp.login(fakemary));
      SSApp.confirm(
        SSApp.post({resource:'shift', 
                    id:shift._id, 
                    action:'publish', 
                    data:{dbs:['user/'+fakedaveJson._id]},
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

  */  
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
  /*
  
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
      
      SSApp.confirm(SSApp.join(fakedave));
      SSApp.confirm(
	SSApp.post({
	  resource: 'shift', 
	  id: shift._id, 
	  action: 'notify'
	})
      );
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
  ),

  
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
  ),

  
  updatePermission: $fixture(
    "Error updating a shift without the proper permissions. Admin allowed.",
    function()
    {
      var shift = SSApp.confirm(SSApp.create('shift', noteShift));
      SSApp.confirm(SSApp.logout());

      // no logged in user
      var error = SSApp.confirm(
	SSApp.update('shift', shift._id,
          {
	    content: 
	    {
              text: "Changed the note!",
              position: {x:500, y:400},
              size: {x:500, y:400}
	    }
	  })
      );
      SSUnit.assertEqual(error.type, UserNotLoggedInError);
      
      // wrong user
      SSApp.confirm(SSApp.join(fakedave));
      error = SSApp.confirm(
	SSApp.update('shift', shift._id,
          {
	    content: 
	    {
              text: "Changed the note!",
              position: {x:500, y:400},
              size: {x:500, y:400}
	    }
	  })
      );
      SSUnit.assertEqual(error.type, PermissionError);
      SSApp.confirm(SSApp.logout());
      
      SSApp.confirm(SSApp.login(admin));
      SSApp.confirm(
	SSApp.update('shift', shift._id, 
          {
	    content:
	    {
              text: "Changed the note!",
              position: {x:500, y:400},
              size: {x:500, y:400}
	    }
	  })
      );
      var shift = SSApp.confirm(SSApp.read('shift', shift._id));
      var content = shift.content;
      SSUnit.assertEqual(content.text, "Changed the note!");
      SSUnit.assertEqual(content.position.x, 500);
      SSUnit.assertEqual(content.position.y, 400);
      
      SSApp.confirm(SSApp['delete']('user', 'fakedave'));
      SSApp.login(fakemary);
    }
  ),

  
  "delete": $fixture(
    "Delete a shift.",
    function()
    {
      var shift = SSApp.confirm(SSApp.create('shift', noteShift));
      SSApp.confirm(SSApp['delete']('shift', shift._id));
      var error = SSApp.confirm(SSApp.read('shift', shift._id));
      SSUnit.assertEqual(error.type, ResourceDoesNotExistError);
    }
  ),
  
  
  deletePermission: $fixture(
    "Error deleting a shift without permission. Admin allowed",
    function()
    {
      var shift = SSApp.confirm(SSApp.create('shift', noteShift));
      SSApp.confirm(SSApp.logout());
      
      var error = SSApp.confirm(SSApp['delete']('shift', shift._id));
      SSUnit.assertEqual(error.type, UserNotLoggedInError);
      
      SSApp.confirm(SSApp.join(fakedave));
      error = SSApp.confirm(SSApp['delete']('shift', shift._id));
      SSUnit.assertEqual(error.type, PermissionError);
      SSApp.confirm(SSApp.logout());
      
      SSApp.confirm(SSApp.login(admin));
      var json = SSApp.confirm(SSApp['delete']('shift', shift._id));
      SSUnit.assertEqual(JSON.encode(json), ack);
      
      SSApp.confirm(SSApp['delete']('user', 'fakedave'));
      SSApp.confirm(SSApp.logout());
      SSApp.confirm(SSApp.login(fakemary))
    }
  )
   */
});