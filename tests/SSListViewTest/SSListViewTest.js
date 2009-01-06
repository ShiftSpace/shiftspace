// ==Builder==
// @test
// @suite             UI
// @dependencies      SSListViewTestCell
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
    }.bind(this));
  },
  
  
  tearDown: function()
  {
  },
  
  
  testSetCell: function()
  {
    this.doc("test the cell is set properly");
    
    this.assert(this.listView.cell() != null);
    this.assert(this.listView.cell() instanceof SSListViewTestCell);
  },
  
  
  testSetData: function()
  {
    this.doc("set data for list view, refreshed contents should reflect.");
    
    var data = [
      {artworkId:0, title:'foo', image:'hellworld.png'},
      {artworkId:1, title:'bar', image:'hellworld.png'},
      {artworkId:2, title:'baz', image:'hellworld.png'}
    ];
    
    this.listView.setData(data);

    this.assertEqual(this.listView.length(), 3);
  }/*,
  
  
  testAdd: function()
  {
    this.doc("Test the addition of a new cell");
    
    console.log('test add');

    var before = this.listView.cells().length;
    this.listView.addCell();
    var after = this.listView.cells().length;
    this.assertNotEqual(before, after);
  },
  
  
  testInsert: function()
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
  
  
  testSwap: function()
  {
    this.assert(false);
  },
  
  
  testOutOfBounds: function()
  {
    this.doc("Test that exception is thrown on insert out of bounds of SSListView.");
    
    this.listView.setCells([{id:"foo"}, {id:"bar"}]);
    
    this.assertThrows(SSListViewError.OutOfBounds, this.listView.insertCell.bind(this.listView), [{id:"baz"}, 3]);
    this.assertThrows(SSListViewError.OutOfBounds, this.listView.insertCell.bind(this.listView), [{id:"baz"}, -1]);
  },
  
  
  testRemove: function()
  {
    this.doc("Test the removal of a cell");
    
    this.listView.setCells([{id:"foo"}, {id:"bar"}]);
    this.listView.removeCell(this.listView.indexOfCellById("foo"));
    
    this.assertEqual(this.listView.cellForId("foo"), null);
    this.assertEqual(this.listView.count(), 1);
  },
  
  
  testRefresh: function()
  {
    this.doc("Test refresh the content of a cell");
    
    this.listView.setCells([{id:"foo"}, {id:"bar"}]);
    this.listView.dataProvider().push({id:"baz"});
    this.listView.refresh();
    
    this.assertEqual(this.listView.cellNodes().length, 3);
  },
  
  
  testCellAction: function()
  {
    this.assert(false);
  }*/
  
});

