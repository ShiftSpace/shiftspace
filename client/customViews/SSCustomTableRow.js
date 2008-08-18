var SSCustomTableRow = new Class({

  name: 'SSCustomTableRow',

  Extends: SSTableRow,
  
  initialize: function(el)
  {
    this.parent(el);
    console.log('initialize SSCustomTableRow');
  },
  
  
  editCell: function(cell)
  {
    
  },
  
  
  setDelegate: function(delegate)
  {
    this.parent(delegate);
    // add some events
    delegate.addEvent('keyup', function(evt) {
    });
    delegate.addEvent('click', function(evt) {
    });
  },
  

  setSelected: function(cell, space)
  {
  },
  

  setSpace: function(cell, space)
  {
    if(cell)
    {
      var image = cell._getElement('> img');
      var span = cell._getElement('> span');
    
      image.setProperty('src', ['../spaces/', space, '/', space, '.png'].join(''));
      span.set('text', SSLocalizedString(space));
    } 
  },
  

  setSummary: function(cell, summary)
  {
    if(cell)
    {
      var div = cell._getElement('div');
      div.set('text', summary);
    }
  }

});

// add it to the UI object if possible
if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.SSCustomTableRow = SSCustomTableRow;
}