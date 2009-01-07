// ==Builder==
// @test
// @suite             Core
// ==/Builder==

var SSCollectionTest = new Class({
  name: "SSCollectionTest",

  Extends: SSUnit.TestCase,
  
  setup: function()
  {
    this.collection = new SSCollection("MyCollection");
  },

  teardown: function()
  {
  },

  testAdd: function()
  {
    this.doc("add an item to the collection");
    
  }
});