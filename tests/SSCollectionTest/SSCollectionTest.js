// ==Builder==
// @test
// @suite             Core
// ==/Builder==

var SSCollectionTest = new Class({
  name: "SSCollectionTest",

  Extends: SSUnitTest.TestCase,
  
  setup: function()
  {
    this.collection = new SSCollection("MyCollection");
  },

  teardown: function()
  {
  },
  
  
  testCollectionForName: function()
  {
    this.doc("collection should match by name");
    this.assertEqual(SSCollectionForName("MyCollection"), this.collection);
  },
  
  
  testClearCollections: function()
  {
    this.doc("clearing the global collections table");
    SSClearCollections();
    this.assert(SSCollections.getLength() == 0);
  },
  
  
  testErrorOnCollectionWithoutName: function()
  {
    this.doc("throw error if the collection is not named");
    
    function createCollection()
    {
      new SSCollection()
    }

    this.assertThrows(SSCollectionError.NoName, createCollection.bind(this));
  },


  testAdd: function()
  {
    this.doc("add an item to the collection");
    
    this.assert(false);
  }
});