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
    app.action('logout');
  },
  

  testCreate: function()
  {
    this.doc("Create a shift.");
    var id = SSGetData(app.create('stream'));
    this.assertNotEqual(id, null);
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
    
  }
})

