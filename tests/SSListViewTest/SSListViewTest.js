// ==Builder==
// @test
// @suite             UI
// @name              SSListViewTest
// @dependencies      Bootstrap, SSListView
// ==/Builder==

var SSListViewTest = new Class({
  name: "SSListViewTest",
  
  Extends: SSUnitTest.TestCase,
  
  setup: function()
  {
    // add it to the view
    var el = new Element('div', {
      id: "SSListViewTest", 
      styles:
      {
        backgroundColor: 'red',
        width: 100,
        height: 100
      }
    });
    $('SSTestRunnerStage').grab(el);
    this.listView = new SSListView(el);
  },
  
  
  tearDown: function()
  {
    delete this.listView;
    // remove the list view
    $('SSListViewTest').dispose();
  },
  
  
  testAddCell: function()
  {
    this.doc("Test the addition of a new cell");
    var before = this.listView.cells().length;
    this.listView.addCell();
    var after = this.listView.cells().length;
    this.listView.getCellDivs();
    this.assertNotEqual(before, after);
  },
  
  
  testInsertCell: function()
  {
    this.doc("Test the insertion of a new cell");
    
  },
  
  
  testRemoveCell: function()
  {
    this.doc("Test the removal of a cell");
  },
  
  
  testRefreshCell: function()
  {
    this.doc("Test refresh the content of a cell");
  }
});

