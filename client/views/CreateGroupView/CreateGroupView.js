// ==Builder==
// @uiclass
// @package           ShiftSpaceUI
// @dependencies      SSView
// ==/Builder==

var CreateGroupView = new Class({

  Extends: SSView,
  name: "CreateGroupView",


  initialize: function(el, options)
  {
    this.parent(el, options);

    SSAddObserver(this, "onCreateGroup", this.createGroup.bind(this));
  },


  'open': function()
  {
    this.delegate().show();
    this.multiView().showViewByName(this.name);
  },


  'close': function()
  {
    this.delegate().hide();
  },


  createGroup: function()
  {
    this.open();
  },


  attachEvents: function()
  {
    
  },


  awake: function()
  {
    this.attachEvents();
  }

});
