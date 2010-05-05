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


  currentUser: function()
  {
    return this.__currentUser;
  },
  
  
  setCurrentUser: function(currentUser)
  {
    this.__currentUser = currentUser;
  },
  

  setCurrentGroup: function(group)
  {
    this.__currentGroup = group;
  },


  currentGroup: function()
  {
    return this.__currentGroup;
  },

  
  groupInfo: function()
  {
    return this.__groupInfo;
  },
  
  
  setGroupInfo: function(groupInfo)
  {
    this.__groupInfo = groupInfo;
  },
  

  'open': function()
  {
    this.delegate().setHeight(530);
    this.delegate().show();
    this.multiView().showViewByName(this.name);
  },


  'close': function()
  {
    this.delegate().hide();
  },


  clearForm: function()
  {
    this.element.getElements("input.SSInputField[type=text]").setProperty("value", "");
  },


  presentCreateForm: function()
  {
    this.__mode = "create";
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
    this.__mode = "edit";
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
    this.setGroupInfo(groupInfo);
  }.future(),


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
  }.future(),


  attachEvents: function()
  {
    this.CreateGroup.addEvent("click", this.createGroup.bind(this));
    this.CancelAction.addEvent('click', this['close'].bind(this));

    this.InviteUsers.addEvent("click", function(evt) {
      evt = new Event(evt);
      this.delegate().sendBack();
      evt.stop();
      SSPostNotification("onAddUsers", {group: this.currentGroup(), mode:this.__mode});
    }.bind(this));
    
    this.SaveGroup.addEvent('click', function(evt) {
      evt = new Event(evt);
      var groupId = this.currentGroup().groupId,
          formData = SSFormToHash(this.GroupForm),
          p1 = SSUpdateGroup(groupId, formData),
          p2 = SSInviteUsersToGroup(groupId, this.users);
      this.onUpdateGroup(p1, p2);
    }.bind(this));
  },


  onUpdateGroup: function(group)
  {
    
  }.future(),


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
    // TODO: add this functionality to the modal view
    this.setCurrentUser(evt.data);
    var templData = $H(evt.data),
        groupInfo = this.groupInfo();
    if(groupInfo.isAdmin && evt.data._id != ShiftSpace.User.getId())
    {
    }
    else
    {
    }
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
