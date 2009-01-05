// ==Builder==
// @test
// @uiclass
// ==/Builder==

var SSCellTestCell = new Class({
  name: "SSCellTestCell",
  Extends: SSCell,
  
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
    this.lockedElement().getElement('span').set('text', title);
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
