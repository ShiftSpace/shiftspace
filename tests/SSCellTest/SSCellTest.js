// ==Builder==
// @test
// @suite             UI
// ==/Builder==

var SSCellTest = new Class({
  name: "SSCellTest",
  
  Extends: SSUnitTest.TestCase,
  
  setup: function()
  {
    Sandalphon.reset();
    
    Sandalphon.compileAndLoad('tests/SSCellTest/SSCellTest', function(ui) {
      Sandalphon.addStyle(ui.styles);
      $('SSTestRunnerStage').set('html', ui.interface);
      Sandalphon.activate($('SSTestRunnerStage'));
      this.cell = SSControllerForNode($('SSCellTest'));
    }.bind(this));
  },
  
  
  tearDown: function()
  {
    delete this.cell;
  },
  
  
  testSetProperties: function()
  {
    this.doc("set properties from inline options");
    
    var propertyList = ['artworkId', 'title', 'image'];
    this.assert(this.cell.getPropertyList().equalSet(propertyList));
  },
  
  
  testSetData: function()
  {
    this.doc("set data");
  },
  
  
  testSetFaultyData: function()
  {
    this.doc("throw error on invalid property");
  },
  
  
  testGetData: function()
  {
    this.doc("get data");
  },
  
  
  testGetFaultyData: function()
  {
    this.doc("throw error on faulty data");
  }
});