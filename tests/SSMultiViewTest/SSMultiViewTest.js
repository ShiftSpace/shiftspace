// ==Builder==
// @test
// @suite             UI
// ==/Builder==

var SSMultiViewTest = new Class({
  
  name: "SSMultiViewTest",
  
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
    Sandalphon.load('tests/SSMultiViewTest/SSMultiViewTest1', function(ui) {
      Sandalphon.addStyle(ui.styles);
      $('SSTestRunnerStage').set('html', ui.interface);
      Sandalphon.activate($('SSTestRunnerStage'));
      var multiview = SSControllerForNode($('SSMultiViewTest'));
      this.endAsync(hook);
    }.bind(this));
  }
  
});