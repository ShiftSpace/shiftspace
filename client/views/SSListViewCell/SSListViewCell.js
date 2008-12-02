// ==Builder==
// @uiclass
// @optional
// @package           ShiftSpaceCoreUI
// @dependencies      SSView
// ==/Builder==

var SSListViewCell = new Class({

  Extends: SSCell,

  name: "SSListViewCell",

  initialize: function(el, options)
  {
    this.parent(el, options);
  },
  
  
  awake: function(context)
  {
    this.parentController = SSControllerForNode(this.element.getParent('.SSListView'));
    this.attachEvents();
  },
  
  
  attachEvents: function(attribute)
  {
    this.element.addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      if(this.parentController.canSelect(this))
      {
        this.parentController.selectByNode(this);
      }
    }.bind(this));
  }
  

});

if(typeof ShiftSpaceUI != "undefined")
{
  ShiftSpaceUI.SSListViewCell = SSListViewCell;
}