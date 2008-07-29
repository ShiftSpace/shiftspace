var SSTableRow = new Class({
  
  Extends: SSView,
  
  initialize: function(model)
  {
    console.log('++++++++++++++++ initialize SSTableRow');
    console.log(model);
    this.parent(model);
  },
  
  
  setProperty: function(row, prop, value)
  {
    var propMethod = 'set'+prop.capitalize();
    var cell = row._getElement('> td[name='+prop+']');
    if(this[propMethod])
    {
      this[propMethod](cell, value);
    }
    else
    {
      cell.set('text', value);
    }
  },
  
  getProperty: function(row, prop)
  {
    var propMethod = 'get'+prop.capitalize();
    var cell = row._getElement('> td[name='+prop+']');
    if(this[propMethod])
    {
      return this[propMethod](cell, prop);
    }
    else
    {
      return cell.get('text');
    }
  }
  
});

// add it to the UI object if possible
if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.SSTableRow = SSTableRow;
}