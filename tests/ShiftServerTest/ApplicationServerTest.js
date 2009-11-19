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
      SSUnit.assertEqual(cached.space.name, shift.space.name);
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
      SSUnit.assertEqual(cached.space.name, shift.space.name);
    }
  ),

  update: $fixture(
    "Test that updating a document enters the global cache.",
    function()
    {
      var shift = SSApp.confirm(SSApp.create('shift', noteShift));
      shift = SSApp.confirm(
        SSApp.update('shift', shift._id, {
          content: {
            text: "Changed the note!",
            position: {x:150, y:150},
            size: {x:200, y:200}
          }
        })
      );
      var cached = SSApp.getDocument(shift._id);
      SSUnit.assert(cached);
      SSUnit.assertEqual(cached.content.text, "Changed the note!");
    }
  ),

  'delete': $fixture(
    "Test that deleting a document removes it from the global cache.",
    function()
    {
      var shift = SSApp.confirm(SSApp.create('shift', noteShift));
      SSApp.confirm(SSApp['delete']('shift', shift._id));
      var cached = SSApp.getDocument(shift._id);
      SSUnit.assertEqual(cached, null);
    }
  ),

  namedCreate: $fixture(
    "Test that creating a document in a named cache works",
    function()
    {
      var shift = SSApp.confirm(SSApp.create('shift', noteShift, {local:'mylist'}));
      var cached = SSApp.cache('mylist')[shift._id];
      SSUnit.assertEqual(cached.space.name, shift.space.name);
    }
  ),

  namedUpdate: $fixture(
    "Test that updating a document in a named cache works",
    function()
    {
      var shift = SSApp.confirm(SSApp.create('shift', noteShift, {local:'mylist'}));
      shift = SSApp.confirm(
        SSApp.update('shift', shift._id, {
            content: {
              text: "Changed the note!",
              position: {x:150, y:150},
              size: {x:200, y:200}
            }
          }, 
          {local:'mylist'}
        )
      );
      var cached = SSApp.cache('mylist')[shift._id];
      SSUnit.assert(cached);
      SSUnit.assertEqual(cached.content.text, "Changed the note!");
    }
  ),

  namedDelete: $fixture(
    "Test that deleting a document removes it from the global cache.",
    function()
    {
      var shift = SSApp.confirm(SSApp.create('shift', noteShift, {local:'mylist'}));
      SSApp.confirm(SSApp['delete']('shift', shift._id));
      var cached = SSApp.cache('mylist')[shift._id];
      SSUnit.assertEqual(cached, null);
    }
  )

});
