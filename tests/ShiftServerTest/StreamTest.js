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
  }/*,
  
  
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
    
  },
  
  
  testSubscribePublic: function()
  {
    
  }*/
})

