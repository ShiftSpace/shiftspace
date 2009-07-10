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
  },
  
  
  tearDown: function()
  {
  },
  
  
  testCreate: function()
  {
    this.doc("Create a shift.");
    this.assertEqual(true, false);
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
    ths.doc("Error updating a shift if not logged in.");
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
    test.doc("A public shift be visible to anyone.");
    this.assertEqual(true, false);
  },
  
  
  testComment: function()
  {
    test.doc("A comment on a shift should send a message to anyone who has commented on the shift.");
    this.assertEqual(true, false);
  }
})

