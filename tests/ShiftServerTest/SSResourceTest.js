// ==Builder==
// @test
// @suite             ShiftServerTest
// @dependencies      ShiftServerTestUtils, ApplicationServer, SSResourceTest
// ==/Builder==

var SSResourceTest = new Class({
  Extends: SSUnitTest.TestCase,
  name: 'SSResourceTest',

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
  tearDown: function() {}
});
