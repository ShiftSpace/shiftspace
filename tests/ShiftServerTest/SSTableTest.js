// ==Builder==
// @test
// @suite             ShiftServerTest
// @dependencies      ShiftServerTestUtils, ApplicationServer
// ==/Builder==

var SSTableTest = new Class({
  Extends: SSUnitTest.TestCase,
  name: 'SSTableTest',

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

  flow: $fixture(
    "Test the flow of operations",
    function()
    {
      SSUnit.assert(true);
    }
  )
});
