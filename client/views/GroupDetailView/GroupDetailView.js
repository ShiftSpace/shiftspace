// ==Builder==
// @uiclass
// @package           ShiftSpaceUI
// @dependencies      SSView
// ==/Builder==

var GroupDetailView = new Class({

  Extends: SSView,
  name: "GroupDetailView",


  initialize: function(el, options)
  {
    this.parent(el, options);

    SSAddObserver(this, "onGroupsPaneHide", function() {
      if(this.isVisible()) this['close']();
    }.bind(this));
    
    SSAddObserver(this, "onShowGroup", this.showGroup.bind(this));
  },


  currentGroup: function()
  {
    return this.__currentGroup;
  },
  
  
  setCurrentGroup: function(currentGroup)
  {
    this.__currentGroup = currentGroup;
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


  attachEvents: function()
  {
    this.JoinGroup.addEvent("click", function(evt) {
      evt = new Event(evt);
      this.onJoinGroup(SSJoinGroup(this.currentGroup()._id));
    }.bind(this));

    this.DetailGroupSettings.addEvent("click", function(evt) {
      evt = new Event(evt);
      SSPostNotification("onEditGroup", this.currentGroup());
    }.bind(this));
  },


  onJoinGroup: function(group)
  {
    SSLog("onJoinGroup", SSLogForce);
  }.future(),


  awake: function()
  {
    this.mapOutletsToThis();
    this.attachEvents();
  },


  showGroup: function(groupData)
  {
    this.open();
    this.setCurrentGroup(groupData);
    SSTemplate(this.element, groupData);
    if(groupData.level > 0)
    {
      this.element.getElement(".join").addClass("SSDisplayNone");
    }
    else
    {
      this.element.getElement(".join").removeClass("SSDisplayNone");
    }
    this.update(SSGroupInfo(groupData.groupId));
  },


  update: function(groupInfo)
  {
    SSTemplate(this.DetailGroupUserCount, groupInfo);
    var str = "shift";
    if(groupInfo.shiftCount != 1)
    {
      str += "s";
    }
    this.element.getElement(".shiftCount").set("text", groupInfo.shiftCount + " " + str);
    if(groupInfo.isAdmin)
    {
      this.DetailInviteUsers.removeClass("SSDisplayNone");
      this.DetailGroupSettings.removeClass("SSDisplayNone");
    }
    else
    {
      this.DetailInviteUsers.addClass("SSDisplayNone");
      this.DetailGroupSettings.addClass("SSDisplayNone");
    }
  }.future()
});

