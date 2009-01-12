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
        {artworkId:0, title:'foo', image:'helloworld.png'},
        {artworkId:1, title:'bar', image:'helloworld.png'},
        {artworkId:2, title:'baz', image:'helloworld.png'},
        {artworkId:3, title:'naz', image:'helloworld.png'},
        {artworkId:4, title:'grr', image:'helloworld.png'}
      ];
      
      new SSCollection("SSTestCollection", {
        array: [{artworkId:0, title:'cool', image:'helloworld.png'},
                {artworkId:1, title:'fool', image:'helloworld.png'},
                {artworkId:2, title:'drool', image:'helloworld.png'},
                {artworkId:3, title:'ghoul', image:'helloworld.png'},
                {artworkId:4, title:'jewel', image:'helloworld.png'}]
      });
      
      this.listView.setData(data);
      
    }.bind(this));
  },
  
  
  tearDown: function()
  {
    delete this.listView;
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
  
  
  testMove: function()
  {
    this.doc("move an item to a different position in the list view");
    
    this.listView.move(3, 1);
    var data = this.listView.get(1);
    
    this.assert(data.artworkId == 3);
    this.assert(data.title == "naz");
  },
  
  
  testOutOfBounds: function()
  {
    this.doc("Test that exception is thrown on insert out of bounds of SSListView.");
    this.assertThrows(SSListViewError.OutOfBounds, this.listView.insert.bind(this.listView), [{id:"baz"}, 6]);
    this.assertThrows(SSListViewError.OutOfBounds, this.listView.insert.bind(this.listView), [{id:"baz"}, -1]);
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
  
  
  testSetGet: function()
  {
    this.doc("set/get the content of a cell");
    
    this.listView.set({artworkId:22, title: 'cool', image:'goodbye.png'}, 1);
    var cellData = this.listView.get(1);
    
    this.assert(cellData.artworkId == 22);
    this.assert(cellData.title == 'cool');
    this.assert(cellData.image == 'goodbye.png');
  },
  
  
  testUpdate: function()
  {
    this.doc("update the content of a cell");
    
    this.listView.update({artworkId:22, title: 'cool'}, 1);
    var cellData = this.listView.get(1);
    
    this.assert(cellData.artworkId == 22);
    this.assert(cellData.title == 'cool');
    this.assert(cellData.image == 'helloworld.png');
  },
  
  
  userDidClickListItem: function(index)
  {
    this.userDidClickListItemDidRun = true;
    this.userDidClickListItemIndex = index;
  },
  
  
  testUserDidClickListItemDelegateMethod: function()
  {
    this.doc("userDidClickListItem delegate method");
    
    this.listView.setDelegate(this);
    
    SSTestRunner.createMouseEventForNode('click', this.listView.cellNodeForIndex(2));
    
    this.assert(this.userDidClickListItemDidRun);
    this.assert(this.userDidClickListItemIndex == 2);
  },
  
  
  testQuery: function()
  {
    this.doc("query the list for data");
    
    var data = this.listView.query(2, ['artworkId', 'title']);
    
    this.assert(data.artworkId == 2);
    this.assert(data.title == 'baz');
  },
  
  
  testUseCollection: function()
  {
    this.doc("use a named collection");
    
    new SSCollection("SSTestCollection", {
      array: [{artworkId:0, title:'foo', image:'helloworld.png'},
              {artworkId:1, title:'bar', image:'helloworld.png'},
              {artworkId:2, title:'baz', image:'helloworld.png'},
              {artworkId:3, title:'naz', image:'helloworld.png'},
              {artworkId:4, title:'grr', image:'helloworld.png'}]
    });
    
    this.listView.useCollection("SSTestCollection");
    var data = this.listView.get(1);
    
    this.assert(data.artworkId == 1);
    this.assert(data.title == 'bar');
    this.assert(data.image == 'helloworld.png');
  }
  
});

