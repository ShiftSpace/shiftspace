// ==Builder==
// @test
// @suite             ShiftServerTest
// @dependencies      ShiftServerTestUtils
// ==/Builder==

var groupStream = {
  displayName:"My Cool Group"
};

var StreamTest = new Class({

  Extends: SSUnitTest.TestCase,
  name: 'StreamTest',
  
  setup: function()
  {
    join(fakemary);
  },
  
  
  tearDown: function()
  {
    app.delete('user', 'fakemary');
    logout()
  },
  

  testCreateNull: function()
  {
    this.doc("Error on stream with no data.");
    var json = app.create('stream');
    this.assertEqual(SSGetType(json), NoDataError);
  },
  

  testCreate: function()
  {
    this.doc("Create a stream.");
    var id = SSGetData(app.create('stream', groupStream));
    this.assertNotEqual(id, null);
    var user = SSGetData(app.read('user', 'fakemary'));
    this.assertNotEqual(user.streams.indexOf(id), -1);
  },
  
  
  testStreamDeleteOnUserDelete: function()
  {
    this.doc("Delete any new empty streams on user delete.");
    var id = SSGetData(app.create('stream', {displayName:"My Cool Group"}));
    app.delete('user', 'fakemary');
    login(admin);
    var json = app.read('stream', id);
    this.assertEqual(SSGetType(json), ResourceDoesNotExistError);
  },
  
  
  testSubscribePublic: function()
  {
    this.doc("A public stream can subscribed by anyone");
    var id = SSGetData(app.create('stream', {
      displayName:"My Cool Group",
      private:false
    }));
    logout();
    join(fakedave);
    var json = app.action('stream/'+id+'/subscribe')
    this.assertEqual(JSON.encode(json), ack)
    app.delete('user', 'fakedave');
    login(fakemary);
  },
  
  
  testSubscribePrivateError: function()
  {
    this.doc("A private stream cannot by subscribed anyone");
    var id = SSGetData(app.create('stream', {
      displayName:"My Cool Group",
      private:true
    }));
    logout();
    join(fakedave);
    var json = app.action('stream/'+id+'/subscribe')
    this.assertEqual(SSGetType(json), PermissionError)
    app.delete('user', 'fakedave');
    login(fakemary);
  },
  
  
  testSubscribePrivate: function()
  {
    this.doc("User should be able to subscribe to a private stream for which he has permission.");
    
    // create fakedave
    logout();
    var fakedavejson = SSGetData(join(fakedave));
    logout();
    
    // invite fake dave
    login(fakemary);
    var id = SSGetData(app.create('stream', {
      meta: "group",
      displayName:"My Cool Group",
      private:true
    }));
    var json = app.action('stream/'+id+'/add/fakedave');
    this.assertEqual(JSON.encode(json), ack);
    logout();

    // check permission exists
    login(admin);
    var perms = SSGetData(app.get('stream/'+id+'/permissions'));
    var userIds = perms.map(function(perm) {
      return perm['userId'];
    });
    this.assertNotEqual(userIds.indexOf(fakedavejson._id), -1);
    logout();
    
    // fakedave has a message and can subscribe
    login(fakedave);
    json = SSGetData(app.get('user/fakedave/messages'));
    this.assertEqual(json.length, 1);
    json = app.action('stream/'+id+'/subscribe');
    this.assertEqual(JSON.encode(json), ack);
    
    // fakedave should have this stream in his list of streams
    json = SSGetData(app.read('user', 'fakedave'));
    this.assertNotEqual(json.streams.indexOf(id), -1);

    logout();
    
    // permission should now be one
    login(admin);
    var perms = SSGetData(app.get('stream/'+id+'/permissions'));
    var userIds = perms.map(function(perm) {
      return perm['userId'];
    });
    var fakedaveperm = perms[userIds.indexOf(fakedavejson._id)]
    this.assertEqual(fakedaveperm.level, 1);

    app.delete('user', 'fakedave');
  },


  testStreamSetWritePermission: function()
  {
    this.doc("Set a write permission on a stream.");
    
    // create fakedave
    logout();
    var fakedavejson = SSGetData(join(fakedave));
    logout();
    
    // invite fake dave
    login(fakemary);
    var id = SSGetData(app.create('stream', {
      meta: "group",
      displayName:"My Cool Group",
      private:true
    }));
    app.action('stream/'+id+'/add/fakedave');
    logout();
    
    // subscribe fakedave
    login(fakedave);
    app.action('stream/'+id+'/subscribe');
    logout();
    
    // give fakedave write perms for the stream
    login(fakemary);
    setPerm(id, 'fakedave', 2);
    logout();
    
    // check that the permission is set
    login(admin);
    var perms = SSGetData(app.get('stream/'+id+'/permissions'));
    var userIds = perms.map(function(perm) {
      return perm['userId'];
    });
    var fakedaveperm = perms[userIds.indexOf(fakedavejson._id)]
    this.assertEqual(fakedaveperm.level, 2);
    
    app.delete('user', 'fakedave');
  },


  testStreamPost: function()
  {
    this.doc("Post an event to a private stream.");
    
    // create fakedave
    logout();
    var fakedavejson = SSGetData(join(fakedave));
    logout();
    
    // invite fake dave
    login(fakemary);
    var id = SSGetData(app.create('stream', {
      meta: "group",
      displayName:"My Cool Group",
      private:true
    }));
    app.action('stream/'+id+'/add/fakedave');
    logout();
    
    // subscribe fakedave
    login(fakedave);
    app.action('stream/'+id+'/subscribe');
    logout();
    
    // give fakedave write perms for the stream
    login(fakemary);
    setPerm(id, 'fakedave', 2);
    logout();
    
    login(fakedave);
    // post an event
    var eventId = SSGetData(app.action('stream/'+id+'/post', {
      displayString: "This is my cool event!"
    }));
    
    // check that it was added
    var events = SSGetData(app.get('stream/'+id+'/events'));
    var eventIds = events.map(function(event) {
      return event._id;
    });
    this.assertNotEqual(eventIds.indexOf(eventId), -1);
    logout();

    login(admin);
    app.delete('user', 'fakedave');
  },


  testPostError: function()
  {
    this.doc("Error when attempting to post to a stream without proper permissions.");
    
    // create fakedave
    logout();
    var fakedavejson = SSGetData(join(fakedave));
    logout();
    
    // invite fake dave
    login(fakemary);
    var id = SSGetData(app.create('stream', {
      meta: "group",
      displayName:"My Cool Group",
      private:true
    }));
    app.action('stream/'+id+'/add/fakedave');
    logout();
    
    // subscribe fakedave
    login(fakedave);
    app.action('stream/'+id+'/subscribe');
    // post an event
    var json = app.action('stream/'+id+'/post', {
      displayString: "This is my cool event!"
    });
    this.assertEqual(SSGetType(json), PermissionError);
    logout()

    login(admin);
    app.delete('user', 'fakedave');
  },
  
  
  testStreamPreserve: function()
  {
    this.doc("Stream should not be deleted if someone else has an event on it.");
    
    // create fakedave
    logout();
    var fakedavejson = SSGetData(join(fakedave));
    logout();
    
    // invite fake dave
    login(fakemary);
    var id = SSGetData(app.create('stream', {
      meta: "group",
      displayName:"My Cool Group",
      private:true
    }));
    app.action('stream/'+id+'/add/fakedave');
    logout();
    
    // subscribe fakedave
    login(fakedave);
    app.action('stream/'+id+'/subscribe');
    logout();
    
    // give fakedave write perms for the stream
    login(fakemary);
    setPerm(id, 'fakedave', 2);
    logout();
    
    login(fakedave);
    // post an event
    var eventId = SSGetData(app.action('stream/'+id+'/post', {
      displayString: "This is my cool event!"
    }));
    logout();
    
    // delete fakemary
    login(fakemary);
    app.delete('user', 'fakemary');

    // check that the stream still exists
    login(admin);
    var json = app.read("stream", id);
    this.assertEqual(SSGetData(json).displayName, "My Cool Group");

    // delete the stream
    app.delete('stream', id);
    app.delete('user', 'fakedave');
  }
})

