var SSCustomTableRow = new Class({
  Extends: SSTableRow,
  
  setSelected: function(cell, space)
  {
  },
  
  setSpace: function(cell, space)
  {
    var image = cell._getElement('> img');
    var span = cell._getElement('> span');
    
    image.setProperty('src', ['../spaces/', space, '/', space, '.png'].join(''));
    span.set('text', space);
  },
  
  setSummary: function(cell, summary)
  {
    var div = cell._getElement('div');
    div.set('text', summary);
  }
});

// add it to the UI object if possible
if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.SSCustomTableRow = SSCustomTableRow;
}