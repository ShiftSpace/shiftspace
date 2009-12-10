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


  clearForm: function()
  {
    // clear all text forms
  },


  createGroup: function()
  {
    this.open();
  },


  attachEvents: function()
  {
    this.CancelCreateGroup.addEvent('click', this['close'].bind(this));
  },


  awake: function()
  {
    this.mapOutletsToThis();
    this.attachEvents();
  }

});
