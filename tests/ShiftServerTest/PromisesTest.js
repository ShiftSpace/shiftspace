// ==Builder==
// @test
// @suite             ShiftServerTest
// @dependencies      ShiftServerTestUtils, ApplicationServer, Promises
// ==/Builder==

var PromisesTest = new Class({
  Extends: SSUnitTest.TestCase,
  name: 'PromisesTest',

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

  chaining: $fixture(
    "Test chaining promises.",
    function()
    {
      var hook = SSUnit.startAsync();
      var p1 = SSApp.query();
      var p2 = $if(p1,
		   function(value) {
		     SSUnit.assert(true, hook);
		   });
      p2.op(function(value) {
	SSUnit.endAsync(hook);	
      });
    }
  )
});
