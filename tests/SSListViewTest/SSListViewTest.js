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
      
      var data = [
        {artworkId:0, title:'foo', image:'hellworld.png'},
        {artworkId:1, title:'bar', image:'hellworld.png'},
        {artworkId:2, title:'baz', image:'hellworld.png'},
        {artworkId:3, title:'naz', image:'hellworld.png'},
        {artworkId:4, title:'grr', image:'hellworld.png'}
      ];
      
      this.listView.setData(data);
      
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
  
  
  testSetCellDelegate: function()
  {
    this.doc("the cell delegate should be properly set");
    
    this.assertEqual(this.listView.cell().delegate(), this.listView);
  },
  
  
  testSetData: function()
  {
    this.doc("set data for list view, refreshed contents should reflect.");
    
    this.assertEqual(this.listView.count(), 5);
    this.assertEqual(this.listView.element.getElements('li').length, 5);
  },
  
  
  testCellAction: function()
  {
    this.doc("cells should fire their methods");
    
    var removeDidRun = false;
    this.listView.remove = function() {
      removeDidRun = true;
    };
    
    SSTestRunner.createMouseEventForNode('click', $$('.button2')[0]);
    
    this.assert(removeDidRun);
  },
  
  
  testAdd: function()
  {
    this.doc("Test the addition of a new cell");
    
    var before = this.listView.count();
    this.listView.add({artworkId:5, title:'jar', image:'helloworld.png'});
    var after = this.listView.count();
    
    this.assertNotEqual(before, after);
    this.assertEqual(before, 5);
    this.assertEqual(after, 6);
  },
  
  
  testInsert: function()
  {
    this.doc("Test the insertion of a new cell");
    
    this.listView.insert({artworkId:10, title:"nar", image:"helloworld.png"}, 2);
    
    function byArtworkId(id) {
      return function(x) {
        return x.artworkId == id;
      }
    };
    
    var idx = this.listView.find(byArtworkId(10));
    
    this.assertEqual(this.listView.count(), 6);
    this.assertEqual(idx, 2);
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
    
    function byArtworkId(id) {
      return function(x) {
        return x.artworkId == id;
      }
    };
    
    this.listView.remove(2);
    
    this.assertEqual(this.listView.count(), 4);
    this.assertEqual(this.listView.find(byArtworkId(2)), -1);
  },
  
  
  testRefresh: function()
  {
    this.doc("Test refresh the content of a cell");
    
    this.listView.setCells([{id:"foo"}, {id:"bar"}]);
    this.listView.dataProvider().push({id:"baz"});
    this.listView.refresh();
    
    this.assertEqual(this.listView.cellNodes().length, 3);
  }
  
});

