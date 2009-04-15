// ==Builder==
// @test
// @suite             UI
// ==/Builder==

var SSTabViewTest = new Class({
  name: 'SSTabViewTest',
  Extends: SSUnitTest.TestCase,

  Implements: [Events, Options],

  setup: function()
  {
    console.log('running setup!');
  },
  
  tearDown: function()
  {
    console.log('running teardown!');
  },
  
  testOne: function()
  {
    this.doc("My first test!");
    
    this.assert(1 == 1);
  }

});