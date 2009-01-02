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
  
  
  testGetRawSubViews: function()
  {
    this.doc("getting raw subviews.");
    
    var hook = this.startAsync();

    Sandalphon.compileAndLoad('tests/SSMultiViewTest/SSMultiViewTest1', function(ui) {
      
      Sandalphon.addStyle(ui.styles);
      $('SSTestRunnerStage').set('html', ui.interface);
      Sandalphon.activate($('SSTestRunnerStage'));
      
      var multiview = SSControllerForNode($('SSMultiViewTest'));
      var rawViews1 = multiview.getRawSubViews();
      var rawViews2 = multiview.element.getElements('> .SSSubView');
      
      this.assertEqual(rawViews1.length, 4, hook);
      this.assertEqual(rawViews2.length, 4, hook);
      
      var match = rawViews1.every(function(x) { return rawViews2.contains(x); });
      this.assert(match, hook);
      match = rawViews1.every(function(x) { return $type(x) == 'element'; });
      this.assert(match, hook);
      
      this.endAsync(hook);
      
    }.bind(this));    
  },
  
  
  testGetSubViews: function()
  {
    this.doc("getting subviews.");
    
    var hook = this.startAsync();
    
    Sandalphon.compileAndLoad('tests/SSMultiViewTest/SSMultiViewTest1', function(ui) {

      Sandalphon.addStyle(ui.styles);
      $('SSTestRunnerStage').set('html', ui.interface);
      Sandalphon.activate($('SSTestRunnerStage'));
      
      var multiview = SSControllerForNode($('SSMultiViewTest'));
      var views = multiview.getSubViews();
      
      this.assertFalse(SSIsController(views[0]), hook);
      this.assert(SSIsController(views[1]), hook);
      this.assert(SSIsController(views[2]), hook);
      this.assertFalse(SSIsController(views[3]), hook);

      this.endAsync(hook);

    }.bind(this));
  },
  
  
  testGetRawCurrentView: function()
  {
    this.doc("getting the raw current view.");
    
    var hook = this.startAsync();
    
    Sandalphon.compileAndLoad('tests/SSMultiViewTest/SSMultiViewTest1', function(ui) {

      Sandalphon.addStyle(ui.styles);
      $('SSTestRunnerStage').set('html', ui.interface);
      Sandalphon.activate($('SSTestRunnerStage'));
      
      var multiview = SSControllerForNode($('SSMultiViewTest'));
      var rawView = multiview.getRawCurrentView();
      var check = multiview.element.getElement('> .SSActive');
      
      this.assertEqual(rawView, check, hook);
 
      this.endAsync(hook);

    }.bind(this));
  },
  
  
  testGetCurrentView: function()
  {
    this.doc("getting the current view.");
    
    var hook = this.startAsync();
    
    Sandalphon.compileAndLoad('tests/SSMultiViewTest/SSMultiViewTest1', function(ui) {

      Sandalphon.addStyle(ui.styles);
      $('SSTestRunnerStage').set('html', ui.interface);
      Sandalphon.activate($('SSTestRunnerStage'));
      
      var multiview = SSControllerForNode($('SSMultiViewTest'));
      multiview.showView(1);
      var view = multiview.getCurrentView();
      var check = multiview.element.getElement('> .SSActive');
      
      this.assert(SSIsController(view), hook);
      this.assertEqual(view.element, check, hook);
 
      this.endAsync(hook);

    }.bind(this));
  },
  
  
  testShowView: function()
  {
    this.doc("showing a subview by index");
    
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
    this.doc("showing a subview by name");
    
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
    this.doc("using a different subview CSS selector than .SSSubView");
    
    var hook = this.startAsync();
    
    Sandalphon.compileAndLoad('tests/SSMultiViewTest/SSMultiViewTest2', function(ui) {

      Sandalphon.addStyle(ui.styles);
      $('SSTestRunnerStage').set('html', ui.interface);
      Sandalphon.activate($('SSTestRunnerStage'));

      var multiview = SSControllerForNode($('SSMultiViewTest'));
      var rawViews1 = multiview.getRawSubViews();
      var rawViews2 = multiview.element.getElements('> .SSSubForm');
      
      this.assertEqual(rawViews1.length, 4, hook);
      this.assertEqual(rawViews2.length, 4, hook);
      
      var match = rawViews1.every(function(x) { return rawViews2.contains(x); });
      this.assert(match, hook);
      match = rawViews1.every(function(x) { return $type(x) == 'element'; });
      this.assert(match, hook);

      this.endAsync(hook);
      
    }.bind(this));
  }
  
});