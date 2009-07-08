// ==Builder==
// @test
// @uiclass
// ==/Builder==

var SSListViewTestCell = new Class({

  Extends: SSCell,
  name: "SSListViewTestCell",
  
  setArtworkId: function(id)
  {
    this.__artworkId = id;
  },
  
  getArtworkId: function()
  {
    return this.__artworkId;
  },
  
  setTitle: function(title)
  {
    this.__title = title;
    this.lockedElement().getElement('span.title').set('text', title);
  },
  
  getTitle: function()
  {
    return this.__title;
  },
  
  setImage: function(src)
  {
    this.__imagesrc = src;
  },
  
  getImage: function()
  {
    return this.__imagesrc;
  }
});
