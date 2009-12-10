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
  },


  attachEvents: function()
  {
    
  },


  awake: function()
  {
    this.attachEvents();
  },


  showGroup: function(userData)
  {
    this.currentUser = userData;
    ['shortName',
     'longName',
     'url',
     'shiftCount',
     'adminCount',
     'memberCount'].each(function(prop) {
       this.element.getElement("."+prop).set("text", userData[prop]);
    }, this);
    this.element.getElement(".gravatarLarge").setProperty("src", userData.gravatarLarge);
    this.toggleFollowButtons(userData.following);
  }

});

