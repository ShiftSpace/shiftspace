// ==Builder==
// @test
// @suite             ShiftServerTest
// @dependencies      ShiftServerTestUtils, ApplicationServer
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
      $if(p1,
	  function(value)
	  {
	    SSLog("This is p:", value, SSLogForce);
	  });
    }
  )
});
