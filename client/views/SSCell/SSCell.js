// ==Builder==
// @uiclass
// @optional
// @name              SSCell
// @package           ShiftSpaceCoreUI
// @dependencies      SSView
// ==/Builder==

var SSCell = new Class({

  name: 'SSCell',
  Extends: SSView,

  initialize: function(el, options)
  {
    this.parent(el, options);
  },


  lock: function(element)
  {
    this.element = element;
  },


  unlock: function()
  {
    this.element = null;
  },


  isLocked: function()
  {
    return (this.element != null);
  },


  getParentRow: function()
  {
    if(this.element) return this.element.getParent('.SSRow');
    return null;
  }

});

// Add it the global UI class lookup
if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.SSCell = SSCell;
}