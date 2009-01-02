// ==Builder==
// @test
// @suite             UI
// ==/Builder==

var SSMultiViewTest = new Class({
  
  name: "SSMultiViewTest",
  
  Extends: SSUnitTest.TestCase,
  
  setup: function()
  {
    console.log('setup');
  },
  
  
  teardown: function()
  {
    console.log('teardown');
  },
  
  
  testShowView: function()
  {
    this.doc("Test showing a subview by index");
    
    var hook = this.startAsync();

    Sandalphon.compileAndLoad('tests/SSMultiViewTest/SSMultiViewTest1', function(ui) {
      
      Sandalphon.addStyle(ui.styles);
      $('SSTestRunnerStage').set('html', ui.interface);
      Sandalphon.activate($('SSTestRunnerStage'));
      
      var multiview = SSControllerForNode($('SSMultiViewTest'));
      multiview.showView(1);
      var allSubViews = multiview.element.getElements('.SSSubView');

      this.assertEqual(1, allSubViews.indexOf(multiview.element.getElement('.SSActive')), hook);
      
      this.endAsync(hook);
      
    }.bind(this));
  },
  
  
  testShowViewByName: function()
  {
    this.doc("Test showing a subview by name");
    
    var hook = this.startAsync();

    Sandalphon.compileAndLoad('tests/SSMultiViewTest/SSMultiViewTest1', function(ui) {
      
      Sandalphon.addStyle(ui.styles);
      $('SSTestRunnerStage').set('html', ui.interface);
      Sandalphon.activate($('SSTestRunnerStage'));
      
      var multiview = SSControllerForNode($('SSMultiViewTest'));
      multiview.showViewByName('SSMultiViewSubView2');
      var allSubViews = multiview.element.getElements('.SSSubView');

      this.assertEqual(1, allSubViews.indexOf(multiview.element.getElement('.SSActive')), hook);
      
      this.endAsync(hook);
      
    }.bind(this));
  },
  
  
  testSubViewSelector: function()
  {
    this.doc("Test using a different subview CSS selector than .SSSubView");
    
    
  }
  
});