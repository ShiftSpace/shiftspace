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


  'open': function()
  {
    this.delegate().show();
    this.multiView().showViewByName(this.name);
  },


  'close': function()
  {
    this.delegate().hide();
  },


  attachEvents: function()
  {
    
  },


  awake: function()
  {
    this.attachEvents();
  },


  showGroup: function(groupData)
  {
    this.open();
    this.currentGroup = groupData;
    SSTemplate(this.element, groupData);
    if(groupData.level > 0)
    {
      this.element.getElement(".join").addClass("SSDisplayNone");
    }
    else
    {
      this.element.getElement(".join").removeClass("SSDisplayNone");
    }
  }

});

