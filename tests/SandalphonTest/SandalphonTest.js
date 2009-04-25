// ==Builder==
// @test
// @suite           Core
// ==/Builder==

var SandalphonTest = new Class({

  Extends: SSUnitTest.TestCase,

  name: "SandalphonTest",

  setup: function()
  {
    Sandalphon.reset();
    $('SSTestRunnerStage').empty();
  },
  
  
  tearDown: function()
  {
  },
  
  
  testConvertToFragment: function()
  {
    this.doc("Convert a string fragment into html");
    
    var node = Sandalphon.convertToFragment("<div><p>Hello world!</p></div>");
    
    this.assertEqual(node.get('tag'), 'div');
    this.assertEqual(node.getElement('p').get('text'), "Hello world!");
  },
  
  testCompileAndLoad: function()
  {
    this.doc("Compile and load an interface file.");
    
    var hook = this.startAsync();
    
    Sandalphon.compileAndLoad('tests/SandalphonTest/SandalphonTest1', function(ui) {
      
      Sandalphon.addStyle(ui.styles);      
      var element = Sandalphon.convertToFragment(ui.interface);
      $('SSTestRunnerStage').grab(element);
      Sandalphon.activate($('SSTestRunnerStage'));
      
      this.assert(ShiftSpaceNameTable.MainView != null, hook);
      this.assert(ShiftSpaceNameTable.TestTabView != null, hook);
      
      this.endAsync(hook);
      
    }.bind(this));
  },

  testBindOutlets: function()
  {
    this.doc("Check that outlets get bound.");
    
    var hook = this.startAsync();
    
    Sandalphon.compileAndLoad('tests/SandalphonTest/SandalphonTest1', function(ui) {
      
      Sandalphon.addStyle(ui.styles);      
      var element = Sandalphon.convertToFragment(ui.interface);
      $('SSTestRunnerStage').grab(element);
      Sandalphon.activate($('SSTestRunnerStage'));
      
      var outlet = ShiftSpaceNameTable.MainView.outlets().get('TestTabView');
      
      this.assertEqual(ShiftSpaceNameTable.TestTabView, outlet, hook);
      
      this.endAsync(hook);
      
    }.bind(this));
  },

  // has to come last, since this realy is asynchronous
  testConvertToFragmentIframe: function()
  {
    this.doc("Convert a string fragment into html checking to see that it was created in an iFrame.");
    
    var frame = new IFrame({
      id:"SandalphonTestFrame", 
    });
    
    var hook = this.startAsync();
    
    $('SSTestRunnerStage').grab(frame);
    
    frame.addEvent('load', function() {

      var node = Sandalphon.convertToFragment("<div><p>Hello world!</p></div>", frame.contentWindow);
      
      this.assertEqual(node.get('tag'), 'div', hook);
      this.assertEqual(node.getElement('p').get('text'), "Hello world!", hook);
      this.assertEqual(node.getDocument(), frame.contentWindow.document, hook);
      this.assertEqual(node.getWindow(), frame.contentWindow, hook);
      
      this.endAsync(hook);      
    }.bind(this));
  }

});