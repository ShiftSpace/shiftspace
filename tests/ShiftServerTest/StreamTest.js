// ==Builder==
// @test
// @suite             ShiftServerTest
// @dependencies      ShiftServerTestUtils
// ==/Builder==

var StreamTest = new Class({

  Extends: SSUnitTest.TestCase,
  name: 'StreamTest',
  
  setup: function()
  {
    app.action('join', fakemary);
  },
  
  
  tearDown: function()
  {
    app.delete('user', 'fakemary');
    logout();
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
    var id = SSGetData(app.create('stream', {displayName:"My Cool Group"}));
    this.assertNotEqual(id, null);
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
  
  
  testSubscribeToPublicStream: function()
  {
    this.doc("A public steram can subscribed by anyone");
    var id = SSGetData(app.create('stream', {displayName:"My Cool Group"}));
    logout();
    join(fakedave);
    var json = app.action('stream/'+id+'/subscribe')
    this.assertEqual(JSON.encode(json), ack)
    app.delete('user', 'fakedave');
    login(fakemary);
  }/*,

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
  
  
  testSubscribePrivateError: function()
  {
    
  },

  
  testGiveSubscribePerm: function()
  {
    
  },


  testSubscribePrivate: function()
  {
    
  }*/
})

