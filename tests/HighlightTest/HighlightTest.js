// ==Builder==
// @test
// @suite             SpacesTest
// ==/Builder==

var dummy =  {};

var HighlightTest = new Class({
  Extends: SSUnitTest.TestCase,
  name: 'HighlightTest',

  html1: "<p>Here is some text <span>that is</span> split across some tags.</p>",

  setup: function() {
  },
  tearDown: function() {},

  test1: $fixture(
    "Test basic highlight",
    function() {
      document.body.grab(this.html1);
    }
  )
});
