// ==Builder==
// @uiclass
// @package           ShiftSpaceUI
// @dependencies      SSView
// ==/Builder==

var EditGroupView = new Class({

  Extends: SSView,
  name: "EditGroupView",


  initialize: function(el, options)
  {
    this.parent(el, options);

    SSAddObserver(this, "onGroupsPaneHide", function() {
      if(this.isVisible()) this['close']();
    }.bind(this));

    SSAddObserver(this, "onCreateGroup", this['open'].bind(this));
    SSAddObserver(this, "onEditGroupHide", this['close'].bind(this));
  },


  'open': function()
  {
    this.clearForm();
    this.delegate().show();
    this.multiView().showViewByName(this.name);
  },


  'close': function()
  {
    this.delegate().hide();
  },


  clearForm: function()
  {
    this.element.getElements("input[type=text]").setProperty("value", "");
  },


  createGroup: function()
  {
    var formData = SSFormToHash(this.GroupForm);
    var p = SSCreateGroup(formData);
    this.onCreateGroup(p);
  },


  onCreateGroup: function(p)
  {
    SSLog("Group created!", SSLogForce);
  }.asPromise(),


  attachEvents: function()
  {
    this.CreateGroup.addEvent("click", this.createGroup.bind(this));
    this.CancelAction.addEvent('click', this['close'].bind(this));
  },


  awake: function()
  {
    this.mapOutletsToThis();
    this.attachEvents();
  }

});
