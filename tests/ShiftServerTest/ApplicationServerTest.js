// ==Builder==
// @test
// @suite             ShiftServerTest
// @dependencies      ApplicationServer
// ==/Builder==

var ApplicationServerTest = new Class({
  Extends: SSUnitTest.TestCase,
  name: 'ApplicationServerTest',

  onStart: function()
  {
    SSApp.confirm(SSApp.join(fakemary));
  },

  onComplete: function()
  {
    SSApp.confirm(SSApp.delete(fakemary));
  },

  read: $fixture(
    "Test that reading a document enters the global cache."
    function()
    {
      SSUnit.assertEqual(true, true);
    }
  )
})
