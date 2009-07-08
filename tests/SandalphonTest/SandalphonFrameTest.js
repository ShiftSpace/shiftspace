// ==Builder==
// @test
// @suite           Core
// ==/Builder==

var SandalphonFrameTest = new Class({

  Extends: SSUnitTest.TestCase,
  name: "SandalphonFrameTest",

  setup: function()
  {
  },
  
  
  tearDown: function()
  {
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