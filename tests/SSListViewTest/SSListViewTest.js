// ==Builder==
// @test
// @suite             UI
// @name              SSListViewTest
// @dependencies      SSListView
// ==/Builder==

var SSListViewTest = new Class({
  name: "SSListViewTest",
  
  Extends: SSUnitTest.TestCase,
  
  setup: function()
  {
    console.log('setup')
    //this.listView = new SSListView();
    // add it to the view
  },
  
  
  tearDown: function()
  {
    console.log('tearDown');
    // remove the list view
    //this.listView.destroy();
  },
  
  
  testAddCell: function()
  {
    this.doc("Test the addition of a new cell");
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

