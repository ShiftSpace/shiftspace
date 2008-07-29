var SSTableRow = new Class({
  
  Extends: SSView,
  
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
    else
    {
      el._getElement('> td[name='+columnName+']').set('text', value);
    }
  },
  
  getProperty: function(el, prop)
  {
    var propMethod = 'get'+prop.capitalize();
    if(this[propMethod])
    {
      return this[propMethod]();
    }
    else
    {
      return el._getElement('> td[name='+columnName+']').get('text');
    }
  }
  
});

// add it to the UI object if possible
if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.SSTableRow = SSTableRow;
}