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

    this.createMatchesList();
  },


  createMatchesList: function()
  {
    this.autocomplete = new Element("div", {
      "id": "PublishTargetAutocomplete",
      "class": "AutocompleteList"
    });
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
    this.delegate().setHeight(580);
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
    this.SaveGroup.addEvent('click', function(evt) {
      evt = new Event(evt);
      var groupId = this.currentGroup().groupId,
          formData = SSFormToHash(this.GroupForm),
          p1 = SSUpdateGroup(groupId, formData),
          p2 = SSInviteUsersToGroup(groupId, this.users);
      this.onUpdateGroup(p1, p2);
    }.bind(this));
    this.InviteMemberField.addEvent("keyup", this.onKeyUp.bind(this));
    this.InviteMember.addEvent("click", this.inviteMember.bind(this));
  },


  onKeyUp: function(evt)
  {
    evt = new Event(evt);

    var target = $(evt.target),
        text = target.get("value").trim();

    if(text.length <= 1)
    {
      this.hideMatches();
      return;
    }

    if(this.currentMatches && this.currentMatches.length > 0)
    {
      var selected = this.autocomplete.getElement(".selected");
      if(!selected) return;
      if(evt.key == "down" && selected.getNext())
      {
        selected.removeClass("selected");
        selected.getNext().addClass("selected");
      }
      if(evt.key == "up" && selected.getPrevious())
      {
        selected.removeClass("selected");
        selected.getPrevious().addClass("selected");
      }
      if(evt.key == "enter")
      {
        var data = selected.retrieve("data");
        target.set("value", data.name);
        this.hideMatches();
      }
      evt.stop();
      return;
    }

    if(!this.autocomplete.getParent()) this.showMatches();

    if(text != this.lastText)
    {
      this.updateMatches(SSAutocomplete("user", text));
      this.lastText = text;
    }
  },


  showMatches: function(type)
  {
    var size = this.InviteMemberField.getSize(),
        pos = this.InviteMemberField.getPosition();
    this.element.getElement("#InviteMembers").grab(this.autocomplete);
    this.autocomplete.setStyles({
      left: pos.x,
      top: pos.y + size.y,
      width: size.x,
      "min-height": 20
    });
  },
  

  hideMatches: function()
  {
    this.currentMatches = null;
    this.autocomplete.dispose();
  },


  updateMatches: function(matches)
  {
    this.currentMatches = matches;
    this.autocomplete.empty();
    matches.each(function(x, i) {
      var el = new Element("div", {
        html: "<img></img><span></span>",
        'class': "autoResault"
      });
      if(i == 0) el.addClass("selected");
      if(x.gravatar)
      {
        el.getElement("img").set("src", x.gravatar);
      }
      else
      {
        el.getElement("img").dispose();
      }
      el.getElement("span").set("text", x.name);
      el.store("data", x);
      // watch for click
      this.autocomplete.grab(el);
    }, this);
  }.future(),


  onUpdateGroup: function(group)
  {
    
  }.future(),


  awake: function()
  {
    this.mapOutletsToThis();
    this.attachEvents();
  },


  inviteMember: function(evt)
  {
    var userName = this.InviteMemberField.get("value");
    this.__inviteMember__(SSGetUser(userName));
  },


  __inviteMember__: Future(function(user) {
    var p = SSInviteUsersToGroup(this.currentGroup().groupId, [user._id]);
    p.realize();
  }),


  removeMember: function(user)
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
      watches: [
        {
          events: [{resource:"group", action:"inviteusers"}],
          handlers: [SSTable.dirtyTheViews]
        }
      ]
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
