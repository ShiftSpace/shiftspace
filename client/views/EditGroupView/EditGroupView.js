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

    SSAddObserver(this, "onCreateGroup", this.presentCreateForm.bind(this));
    SSAddObserver(this, "onEditGroup", this.presentEditForm.bind(this));
    SSAddObserver(this, "onEditGroupHide", this['close'].bind(this));
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
    this.element.getElements("input[type=text]").setProperty("value", "");
  },


  presentCreateForm: function()
  {
    this.clearForm();
    if(!this.isVisible()) this['open']();
    this.CreateTitle.removeClass("SSDisplayNone");
    this.EditTitle.addClass("SSDisplayNone");
    this.CreateTitle.removeClass("SSDisplayNone");
    this.SaveGroup.addClass("SSDisplayNone");
  },


  presentEditForm: function(groupData)
  {
    this.clearForm();
    if(!this.isVisible()) this['open']();
    this.EditTitle.removeClass("SSDisplayNone");
    this.CreateTitle.addClass("SSDisplayNone");
    this.SaveGroup.removeClass("SSDisplayNone");
    this.CreateTitle.addClass("SSDisplayNone");
    SSTemplate(this.GroupForm, groupData);
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
    this.InviteUsers.addEvent("click", function(evt) {
      evt = new Event(evt);
      this.delegate().sendBack();
      evt.stop();
    }.bind(this));
  },


  awake: function()
  {
    this.mapOutletsToThis();
    this.attachEvents();
  }

});
