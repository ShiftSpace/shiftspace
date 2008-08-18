var SSCell = new Class({
  
  name: 'SSCell',
  
  Implements: [Events, Options],


  initialize: function(options)
  {
    this.setOptions(options);
  },
  
  
  lock: function(element)
  {
    this.element = element;
  },
  
  
  unlock: function()
  {
    this.element = null;
  }
  
});

// Add it the global UI class lookup
if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.SSCell = SSCell;
}