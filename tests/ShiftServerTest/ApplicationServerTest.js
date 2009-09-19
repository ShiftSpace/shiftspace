// ==Builder==
// @test
// @suite             ShiftServerTest
// @dependencies      ShiftServerTestUtils, ApplicationServer
// ==/Builder==

var ApplicationServerTest = new Class({
  Extends: SSUnitTest.TestCase,
  name: 'ApplicationServerTest',

  onStart: function()
  {
    SSLog("on start!", SSLogForce);
    SSApp.confirm(SSApp.logout());
    SSApp.confirm(SSApp.login(admin));
    SSApp.confirm(SSApp['delete']('user', 'fakemary'));
    SSApp.confirm(SSApp.logout());
    SSApp.confirm(SSApp.join(fakemary));
  },

  onComplete: function()
  {
    SSLog("on complete!", SSLogForce);
    SSApp.confirm(SSApp['delete']('user', 'fakemary'));
  },

  setup: function() {},
  tearDown: function() {},

  create: $fixture(
    "Test that creating a document enters the global cache.",
    function()
    {
      var shift = SSApp.confirm(SSApp.create('shift', noteShift));
      var cached = SSApp.getDocument(shift._id);
      SSUnit.assert(cached);
      SSUnit.assertEqual(shift.space.name, noteShift.space.name);
    }
  ),

  read: $fixture(
    "Test that reading a document enters the global cache.",
    function()
    {
      var shift = SSApp.confirm(SSApp.create('shift', noteShift));
      shift = SSApp.confirm(SSApp.read('shift', shift._id));
      var cached = SSApp.getDocument(shift._id);
      SSUnit.assert(cached);
      SSUnit.assertEqual(shift.space.name, noteShift.space.name);
    }
  )
});
