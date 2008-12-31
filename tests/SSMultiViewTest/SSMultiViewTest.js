// ==Builder==
// @test
// @suite             UI
// ==/Builder==

var SSListViewTest = new Class({
  
  name: "SSListViewTest",
  
  Extends: SSUnitTest.TestCase,
  
  setup: function()
  {
    
  },
  
  teardown: function()
  {
    
  },
  
  testShowSubView: function()
  {
    var hook = this.startAsync();
    Sandalphon.load('SSMultiViewTest1.html', function(ui) {
      $('SSTestRunnerStage').set('html', ui);
      Sandalphon.activate(ui);
      SSControllerForNode($('SSMultiViewTest'));
    });
  }
  
});