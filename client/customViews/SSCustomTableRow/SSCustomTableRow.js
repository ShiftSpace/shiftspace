// ==Builder==
// @uiclass
// @optional
// @package           ShiftSpaceCoreUI
// @dependencies      SSTableRow
// ==/Builder==

var SSCustomTableRow = new Class({

  Extends: SSTableRow,
  
  name: 'SSCustomTableRow',
  
  initialize: function(el)
  {
    this.parent(el);
  },
  

  awake: function(context)
  {
    if(this.outlets().get('editTextCell'))
    {
      this.initEditTextCell();
    }
    if(this.outlets().get('actionCell'))
    {
      this.initActionCell();
    }
  },
  
  
  prepareModel: function(model)
  {
    SSLog('Preparing the model, first generating clone');
    var clone = $(model.clone(true));
    SSLog('Cleaning the model');
    // clean up the properties from the editable text cell, it's a singleton, we don't want these to be carried over
    clone.getElement('.SSEditableTextCell').removeProperty('uiclass');
    clone.getElement('.SSEditableTextCell').removeProperty('outlet');
    return clone;
  },
  
  
  modelRowClone: function()
  {
    var clone = this.parent();
    // readonly property gets lost in cloning for some reason, put it back
    clone.getElement('.SSEditableTextCell').setProperty('readonly', '1');
    clone.getElement('.SSActionCell').addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      // lock the element
      var checked = evt.target.getProperty('checked');
      SSPostNotification('userDidClickCheckboxForRowInTableView', {
        tableView: this.delegate(),
        rowIndex: this.delegate().indexOfRow(this.rowForNode(evt.target))
      });
      // unlock the element
    }.bind(this));
    return clone;
  },
  
  
  initActionCell: function()
  {
    this.actionCellControl = this.outlets().get('actionCell');
    SSLog('initActionCell', SSLogForce);
  },

  
  initEditTextCell: function()
  {
    this.editCellControl = this.outlets().get('editTextCell');
    
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
    
    return this.indexOfNode(rowForNode.getChildren('td'), parentCell);
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
      var image = cell.getElement('> img');
      var span = cell.getElement('> span');
      
      var server = (SSInfo && SSInfo().server) || '..';
      
      image.setProperty('src', [server, '/spaces/', space, '/', space, '.png'].join(''));
      
      span.set('text', SSLocalizedString(space));
    } 
  },
  
  
  setUsername: function(cell, username)
  {
    if(ShiftSpaceUser.getUsername() == username)
    {
      cell.addClass('SSAuthor');
    }
    else
    {
      cell.removeClass('SSAuthor');
    }
    
    cell.getElement('a').set('text', username);
    cell.getElement('a').setProperty('href', 'http://www.shiftspace.org/shifts/?filter=by&filterBy='+username);
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