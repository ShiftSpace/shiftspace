var SSTableRow = new Class({
  
  initialize: function(model)
  {
    this.parent(model);
  },
  
  
  setProperty: function(el, prop, value)
  {
    var propMethod = 'set'+prop.capitalize();
    if(this[propMethod])
    {
      this[propMethod](value);
    }
  },
  
  getProperty: function(el, prop)
  {
    var propMethod = 'get'+prop.capitalize();
    if(this[propMethod])
    {
      return this[propMethod]();
    }
  }
  
});

// add it to the UI object if possible
if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.SSTableRow = SSTableRow;
}