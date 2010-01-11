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

    // for holding users to be added to the group
    this.users = [];

    SSAddObserver(this, "onGroupsPaneHide", function() {
      if(this.isVisible()) this['close']();
    }.bind(this));

    SSAddObserver(this, "onCreateGroup", this.presentCreateForm.bind(this));
    SSAddObserver(this, "onEditGroup", this.presentEditForm.bind(this));
    SSAddObserver(this, "onEditGroupHide", this['close'].bind(this));
  },


  setCurrentGroup: function(group)
  {
    this.__currentGroup = group;
  },


  currentGroup: function()
  {
    return this.__currentGroup;
  },


  'open': function()
  {
    this.delegate().tall();
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
    this.users = [];
    if(!this.isVisible()) this['open']();
    this.CreateTitle.removeClass("SSDisplayNone");
    this.EditTitle.addClass("SSDisplayNone");
    this.CreateGroup.removeClass("SSDisplayNone");
    this.SaveGroup.addClass("SSDisplayNone");
  },


  presentEditForm: function(groupData)
  {
    this.setCurrentGroup(groupData);
    this.cleanupTable();
    this.initTable(groupData.groupId);
    SSTableForName("Members").addView(this.GroupMemberListView);
    this.clearForm();
    this.users = [];
    if(!this.isVisible()) this['open']();
    this.EditTitle.removeClass("SSDisplayNone");
    this.CreateTitle.addClass("SSDisplayNone");
    this.SaveGroup.removeClass("SSDisplayNone");
    this.CreateGroup.addClass("SSDisplayNone");
    SSTemplate(this.GroupForm, groupData);
    this.update(SSGroupInfo(groupData.groupId));
  },


  update: function(groupInfo)
  {
    SSTemplate(this.GroupUserCount, groupInfo);
  }.asPromise(),


  createGroup: function()
  {
    var formData = SSFormToHash(this.GroupForm),
        p = SSCreateGroup(formData);
    this.onCreateGroup(p);
  },


  onCreateGroup: function(group)
  {
    var p = SSInviteUsersToGroup(group._id, this.users);
    p.realize();
  }.asPromise(),


  attachEvents: function()
  {
    this.CreateGroup.addEvent("click", this.createGroup.bind(this));
    this.CancelAction.addEvent('click', this['close'].bind(this));

    this.InviteUsers.addEvent("click", function(evt) {
      evt = new Event(evt);
      this.delegate().sendBack();
      evt.stop();
      SSPostNotification("onAddUsers", this.currentGroup());
    }.bind(this));
    
    this.SaveGroup.addEvent('click', function(evt) {
      SSLog("save group", SSLogForce);
      evt = new Event(evt);
      var formData = SSFormToHash(this.GroupForm),
          p = SSUpdateGroup(this.currentGroup().groupId, formData);
      this.onUpdateGroup(p);
    }.bind(this));

    this.CloseEditMember.addEvent("click", function(evt) {
      evt = new Event(evt);
      this.EditGroupMember.addClass("SSDisplayNone");
      this.GroupMemberListViewContainer.removeClass("SSDisplayNone");
    }.bind(this));
  },


  onUpdateGroup: function(group)
  {
    
  }.asPromise(),


  awake: function()
  {
    this.mapOutletsToThis();
    this.attachEvents();
  },


  addRemoveUser: function(sender, evt)
  {
    if(evt.target.getProperty("checked"))
    {
      this.addUser(evt.data);
    }
    else
    {
      this.removeUser(evt.data);
    }
  },


  addUser: function(user)
  {
    this.users.push(user._id);
  },


  removeUser: function(user)
  {
    this.users.erase(user._id);
  },


  editMember: function(sender, evt)
  {
    var editMemberEl = this.element.getElement("#EditGroupMember"),
        templData = $H(evt.data);
    this.element.getElement("#GroupMemberListViewContainer").addClass("SSDisplayNone");
    editMemberEl.removeClass("SSDisplayNone");
    templData.erase("gravatar");
    templData.erase("fullName");
    SSTemplate(editMemberEl, templData);
    editMemberEl.getElement(".gravatar").set("src", evt.data.gravatar);
  },


  initTable: function(groupId)
  {
    this.members = new SSTable("Members", {
      resource: {read:['group', groupId, 'members'].join("/")},
      watches: []
    });
  },
  

  cleanupTable: function()
  {
    if(this.members)
    {
      this.members.dispose();
      this.members = null;
    }
  }
});
