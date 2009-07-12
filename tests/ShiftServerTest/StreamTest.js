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
    
    logout();
    var fakedavejson = SSGetData(join(fakedave));
    logout();
    
    login(fakemary);
    var id = SSGetData(app.create('stream', {
      displayName:"My Cool Group",
      private:true
    }));
    var json = app.action('stream/'+id+'/add/fakedave');
    this.assertEqual(JSON.encode(json), ack);
    
    logout();
    login(admin);
    var perms = SSGetData(app.get('stream/'+id+'/permissions'));
    var userIds = perms.map(function(perm) {
      return perm['userId'];
    });
    this.assertNotEqual(userIds.indexOf(fakedavejson._id), -1);
    logout();
    
    login(fakedave);
    var json = app.action('stream/'+id+'/subscribe')
    this.assertEqual(JSON.encode(json), ack)

    app.delete('user', 'fakedave');
  },/*,

  testStreamNotDeletedIfHasNonOwnerEvent: function()
  {
    this.doc("A stream with an event by another user should not be deleted.");
    var id = SSGetData(app.create('stream', {
      displayName:"My Cool Group",
      private:"false"
    }));
    logout();
    join(fakedave);
    fake
    app.delete('user', 'fakemary');
  },
  
  
  testRead: function()
  {
    
  },
  
  
  testUpdate: function()
  {
    
  },
  
  
  testDelete: function()
  {
    
  },
  
  
  testGiveSubscribePerm: function()
  {
    
  },


  testSubscribePrivate: function()
  {
    
  }*/
})

