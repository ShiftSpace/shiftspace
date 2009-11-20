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
      // a private draft shift cannot be operated on at all without being
      // logged-in this is because it takes two keys to look up a private 
      // shift (the user id AND the shift id), this is why we don't have permission
      // fixtures modifications attempted on drafts, unauthorized access
      // on private draft shift always results in ResourceDoesNotExistError
      // while unauthorized access on shifts which are not draft
      // (and thus in shiftspace/shared) result in PermissionError
      // - David 11/18/09
      var shift = SSApp.confirm(SSApp.create('shift', noteShift));
      var aShift = SSApp.confirm(SSApp.read('shift', shift._id));
      SSUnit.assertEqual(shift._id, aShift._id);
      SSApp.confirm(SSApp.logout());
      
      // unauthorized individual
      SSApp.confirm(SSApp.join(fakedave));
      var json = SSApp.confirm(SSApp.read('shift', shift._id));
      SSUnit.assertEqual(SSGetType(json), ResourceDoesNotExistError);
      SSApp.confirm(SSApp['delete']('user', 'fakedave'));
      
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
      SSUnit.assertEqual(SSGetType(json), ResourceDoesNotExistError); // It's truly private, noone can see it
      SSApp.confirm(SSApp.logout());
      
      SSApp.confirm(SSApp.login(fakemary));
      SSApp.confirm(
        SSApp.post({
          resource:'shift', 
          id:shift._id, 
          action:'publish', 
          data:{dbs:['user/'+fakedaveJson._id]},
          json: true
        })
      );
      SSApp.confirm(SSApp.logout());
      
      SSApp.confirm(SSApp.login(fakedave));
      shift = SSApp.confirm(SSApp.read('shift', shift._id));
      SSUnit.assertEqual(shift.space.name, "Notes");
      SSApp.confirm(SSApp.logout());
      
      SSApp.confirm(SSApp.join(fakejohn));
      json = SSApp.confirm(SSApp.read('shift', shift._id));
      SSUnit.assertEqual(SSGetType(json), PermissionError); // It's published, now we can check for permission errors
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
          resource:'shift', 
          id:shift._id, 
          action:'comment', 
          data:{text:"Hey what a cool shift!"},
          json: true
        })
      );
      var comments = SSApp.confirm(SSApp.get({resource:'shift', id:shift._id, action:'comments'}));
      SSUnit.assertEqual(comments[0].text, "Hey what a cool shift!");
      SSApp.confirm(SSApp['delete']('user', 'fakedave'));

      SSApp.confirm(SSApp.login(fakemary));
    }
  ),


  readPrivateComments: $fixture(
    "Error if attempt to read comments on private shift. Should work for those with permission on a shared shift.",
    function()
    {
      var shift = SSApp.confirm(SSApp.create('shift', noteShift));
      SSApp.confirm(SSApp.logout());
      
      // comment thread doesn't exist
      var fakedaveJson = SSApp.confirm(SSApp.join(fakedave));
      var json = SSApp.confirm(SSApp.get({resource:'shift', id:shift._id, action:'comments'}));
      SSUnit.assertEqual(SSGetType(json), ResourceDoesNotExistError);
      SSApp.confirm(SSApp.logout());
      
      // publish the shift
      SSApp.confirm(SSApp.login(fakemary));
      SSApp.confirm(
        SSApp.post({
          resource:'shift', 
          id:shift._id, 
          action:'publish', 
          data:{dbs:['user/'+fakedaveJson._id]},
          json: true
        })
      );
      SSApp.confirm(SSApp.logout());
      
      // leave a comment, read the comments
      SSApp.confirm(SSApp.login(fakedave));
      SSApp.confirm(
        SSApp.post({
          resource:'shift', 
          id:shift._id, 
          action:'comment', 
          data:{text:"Hey what a cool shift!"},
          json: true
        })
      );
      var comments = SSApp.confirm(SSApp.get({resource:'shift', id:shift._id, action:'comments'}));
      SSUnit.assertEqual($type(comments), "array");
      SSApp.confirm(SSApp['delete']('user', 'fakedave'));
      
      // not permitted
      SSApp.confirm(SSApp.join(fakejohn));
      var json = SSApp.confirm(SSApp.get({resource:'shift', id:shift._id, action:'comments'}));
      SSUnit.assertEqual(SSGetType(json), PermissionError);
      SSApp.confirm(SSApp['delete']('user', 'fakejohn'));
      
      SSApp.confirm(SSApp.login(fakemary));
    }
  ),


  notify: $fixture(
    "A user subscribed to a shift comment thread should get a message sent to his/her messages inbox.",
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
      
      // make comment #1
      SSApp.confirm(SSApp.join(fakedave));
      SSApp.confirm(
        SSApp.post({
          resource: "shift",
          id: shift._id,
          action: "comment",
          data: { text: "Hey what a cool shift foo!", subscribe:true },
          json: true
        })
      );
      SSApp.confirm(SSApp.logout());
      
      // make comment #2
      SSApp.confirm(SSApp.join(fakejohn));
      SSApp.confirm(
        SSApp.post({
          resource: "shift",
          id: shift._id,
          action: "comment",
          data: { text: "Hey what a cool shift bar!", subscribe:true },
          json: true
        })
      );
      SSApp.confirm(SSApp.logout());
      
      // check fakemary received 2 messages
      SSApp.confirm(SSApp.login(fakemary));
      var messages = SSApp.confirm(SSApp.get({resource:"user", id:"fakemary", action:"messages"}));
      SSUnit.assertEqual(messages.length, 2);
      SSApp.confirm(SSApp.logout());

      // unsubscribe fakedave from the thread
      SSApp.confirm(SSApp.login(fakedave));
      SSApp.confirm(
        SSApp.post({
          resource: "shift", 
          id: shift._id,
          action: "unnotify"
        })
      );
      SSApp.confirm(SSApp.logout());
      
      // comment #3
      SSApp.confirm(SSApp.login(fakejohn));
      SSApp.confirm(
        SSApp.post({
          resource: "shift",
          id: shift._id,
          action: "comment", 
          data: {text: "My other comment!"},
          json: true
        })
      );
      SSApp.confirm(SSApp.logout());
      
      // first comment should only have 1 message from the thread
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
      
      // cleanup
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
        SSApp.update("shift", shift._id, {
            content: {
              noteText: "Changed the note!",
              position: {x:500, y:400},
              size: {x:500, y:400}
            }
          }
        )
      );
      var content = shift.content;
      SSUnit.assertEqual(content.noteText, "Changed the note!");
      SSUnit.assertEqual(content.position.x, 500);
      SSUnit.assertEqual(content.position.y, 400);
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
  )


});