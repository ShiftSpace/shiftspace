// ==Builder==
// @test
// @suite             UI
// ==/Builder==

var SSListViewTest = new Class({
  name: "SSListViewTest",
  
  Extends: SSUnitTest.TestCase,
  
  setup: function()
  {
    Sandalphon.reset();
    
    this.methodOneRef = false;
    this.methodTwoRef = false;
    
    Sandalphon.compileAndLoad('tests/SSListViewTest/SSListViewTest', function(ui) {
      Sandalphon.addStyle(ui.styles);
      $('SSTestRunnerStage').set('html', ui.interface);
      Sandalphon.activate($('SSTestRunnerStage'));
      this.listView = SSControllerForNode($('SSListViewTest'));
      this.listView.setDelegate(this);
    }.bind(this));
  },
  
  
  tearDown: function()
  {
  },
  
  
  // testSetDataProvider
  
  
  testAddCell: function()
  {
    this.doc("Test the addition of a new cell");
    var before = this.listView.cells().length;
    this.listView.addCell();
    var after = this.listView.cells().length;
    this.assertNotEqual(before, after);
  },
  
  
  testInsertCell: function()
  {
    this.doc("Test the insertion of a new cell");
    
    this.listView.setCells([{id:"foo"}, {id:"bar"}]);
    this.listView.insertCell({id:"baz"}, 1);
    
    var theCell = this.listView.cellForId("cool");
    var fooCell = this.listView.cellForId("food");
    var barCell = this.listView.cellForId("bar");
    
    this.assertEqual(this.listView.indexOfCell(fooCell), 0);
    this.assertEqual(this.listView.indexOfCell(theCell), 1);
    this.assertEqual(this.listView.indexOfCell(barCell), 2);
  },
  
  
  testInsertCellBounds: function()
  {
    this.doc("Test that exception is thrown on insert out of bounds of SSListView.");
    
    this.listView.setCells([{id:"foo"}, {id:"bar"}]);
    
    this.assertThrows(SSListViewError.OutOfBounds, this.listView.insertCell.bind(this.listView), [{id:"baz"}, 3]);
    this.assertThrows(SSListViewError.OutOfBounds, this.listView.insertCell.bind(this.listView), [{id:"baz"}, -1]);
  },
  
  
  testRemoveCell: function()
  {
    this.doc("Test the removal of a cell");
    
    this.listView.setCells([{id:"foo"}, {id:"bar"}]);
    this.listView.removeCell(this.listView.indexOfCellById("foo"));
    
    this.assertEqual(this.listView.cellForId("foo"), null);
    this.assertEqual(this.listView.count(), 1);
  },
  
  
  testRefreshListView: function()
  {
    this.doc("Test refresh the content of a cell");
    
    this.listView.setCells([{id:"foo"}, {id:"bar"}]);
    this.listView.dataProvider().push({id:"baz"});
    this.listView.refresh();
    
    this.assertEqual(this.listView.cellNodes().length, 3);
  }
});

