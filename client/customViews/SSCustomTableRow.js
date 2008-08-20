var SSCustomTableRow = new Class({

  name: 'SSCustomTableRow',

  Extends: SSTableRow,
  
  
  initialize: function(el)
  {
    this.parent(el);
    console.log('initialize SSCustomTableRow');
    this.editCellControl = new SSEditableTextCell();
    this.attachEvents();
  },
  
  
  attachEvents: function()
  {
    // listen for value change events
    this.editCellControl.addEvent('SSEditableTextCellDidChange', function(data) {
    }.bind(this));

    // listen for finish events
    this.editCellControl.addEvent('SSEditableTextCellDidFinishEditing', function(data) {
      var delegate = this.delegate();
      if(delegate && this.editCellControl.isLocked())
      {
        delegate.columnChangedForRow(this.rowForNode(this.editCellControl.element), 
                                     this.columnIndexForNode(this.editCellControl.element),
                                     data);
      }
      // unlock the edit control
      this.editCellControl.unlock();
    }.bind(this));
  },
  
  
  editCell: function(cell)
  {
    if(cell)
    {
      // unlock the previous edited field
      if(this.editCellControl.isLocked()) 
      {
        this.editCellControl.unlock();
      }

      this.editCellControl.lock(cell.getFirst());
      this.editCellControl.edit();
    }
  },
  
  
  columnIndexForNode: function(node)
  {
    var rowForNode = this.rowForNode(node);
    var parentCell = (node.get('tag') == 'td') || node.getParent('td');
    
    return rowForNode.getChildren('td').indexOf(parentCell);
  },
  
  
  rowForNode: function(node)
  {
    return node.getParent('.SSRow');
  },
  
  
  deselect: function(row)
  {
    console.log('DESELECT');
    if(this.editCellControl.isLocked() && this.editCellControl.getParentRow() == row) this.editCellControl.unlock();
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