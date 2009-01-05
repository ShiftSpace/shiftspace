// ==Builder==
// @test
// @suite             UI
// @dependencies       SSCellTestCell
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
    
    var propertyList = ['artworkId', 'image', 'title'];
    this.assert(this.cell.getPropertyList().equalSet(propertyList));
  },
  
  
  testSetWithoutLock: function()
  {
    this.doc("throw error if set data with out an element lock");
    this.assertThrows(SSCellError.NoLock, this.cell.setProperty.bind(this.cell), ['artworkId', 1]);
  },
  
  
  testGetWithoutLock: function()
  {
    this.doc("throw error if get data without an element lock");
    this.assertThrows(SSCellError.NoLock, this.cell.getProperty.bind(this.cell), 'artworkId')
  },
  
  
  testVerifyPropertyAccess: function()
  {
    this.doc("throw error if missing setter or getter for cell");
    this.cell.setPropertyList(['foo', 'bar']);
    this.assertThrows(SSCellError.MissingAccessor, this.cell.verifyPropertyAccess.bind(this.cell));
  },
  
  
  testSetData: function()
  {
    this.doc("set data");
    
    this.cell.lock($('SSCellTest'));
    
    this.cell.setData({
      artworkId: 1,
      title: 'Starry Night',
      image: 'starry_night.png'
    });
    
    this.assertEqual(this.cell.getProperty('title'), 'Starry Night');
    this.assertEqual(this.cell.getProperty('image'), 'starry_night.png');
    this.assertEqual(this.cell.getProperty('artworkId'), 1);
  },
  
  
  testSetFaultyData: function()
  {
    this.doc("throw error on invalid property");
    
    this.cell.lock($('SSCellTest'));
    this.assertThrows(SSCellError.NoSuchProperty, this.cell.setData.bind(this.cell), {foobar:'baz'});
  },
  
  
  testGetData: function()
  {
    this.doc("get data");
    
    this.cell.lock($('SSCellTest'));

    this.cell.setData({
      artworkId: 1,
      title: 'Starry Night',
      image: 'starry_night.png'
    });

    var data = this.cell.getData(['artworkId', 'title', 'image']);
    
    this.assert(data.artworkId == 1);
    this.assert(data.title == 'Starry Night');
    this.assert(data.image == 'starry_night.png');
  },
  
  
  testGetFaultyData: function()
  {
    this.doc("throw error on faulty data");
    
    this.cell.lock($('SSCellTest'));

    this.assertThrows(SSCellError.NoSuchProperty, this.cell.getData.bind(this.cell), ['foobar']);
  },
  
  
  testClone: function()
  {
    this.doc('clone a cell');
    
    var clone = this.cell.clone();
    
    this.assert(clone.getElement('img') != null);
    this.assert(clone.getElement('span') != null);
    this.assert(clone.getProperty('uiclass') == null);
    this.assert(clone.getProperty('options') == null);
    this.assert(clone.getProperty('outlet') == null);
  },
  
  
  testCloneWithData: function()
  {
    this.doc('clone a cell with data');
    
    var clone = this.cell.cloneWithData({
      artworkId: 2,
      title: 'Fountain',
      image: 'fountain.png'
    });
    
    this.assert(clone.getElement('span').get('text') == 'Fountain');
    this.assertFalse(this.cell.isLocked());
  },
  
  
  testCloneWithEmbeddedView: function()
  {
    this.doc('cell with embedded view');
    
    var clone = this.cell.clone();
    
    var controller = SSControllerForNode(clone.getElement('div'));

    this.assert(controller != null);
    this.assertFalse(controller instanceof SSViewProxy);
  }
});