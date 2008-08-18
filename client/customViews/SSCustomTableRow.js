var SSCustomTableRow = new Class({

  name: 'SSCustomTableRow',

  Extends: SSTableRow,
  
  
  initialize: function(el)
  {
    this.parent(el);
    console.log('initialize SSCustomTableRow');
    this.editCellControl = new SSEditableTextCell();
  },
  
  
  editCell: function(cell)
  {
    console.log('EDIT CELL!');
    console.log(cell);
    if(cell)
    {
      this.editCellControl.addEvent('SSEditableTextCellDidChange', function(data) {
        console.log('SSEditableTextCellDidChange ' + JSON.encode(data));
      }.bind(this));
      this.editCellControl.addEvent('SSEditableTextCellDidFinish', function(data) {
        console.log('SSEditableTextCellDidFinish ' + JSON.encode(data));
        this.editCellControl.unlock();
      }.bind(this));
      this.editCellControl.lock(cell.getFirst());
      this.editCellControl.edit();
    }
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
      var el = cell.getFirst();
      
      switch(el.get('tag'))
      {
        case 'div':
          el.set('text', summary);
          break;
        case 'input':
          el.setProperty('value', summary)
          break;
        default:
          break;
      }
    }
  }

});

// add it to the UI object if possible
if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.SSCustomTableRow = SSCustomTableRow;
}