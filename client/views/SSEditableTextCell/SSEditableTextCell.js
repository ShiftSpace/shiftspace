// ==Builder==
// @uiclass
// @required
// @name              SSEditableTextCell
// @package           ShiftSpaceCoreUI
// @dependencies      SSCell
// ==/Builder==

var SSEditableTextCell = new Class({

  name: 'SSEditableTextCell',
  Extends: SSCell,

  initialize: function(el, options)
  {
    this.parent(el, options);
  },


  setValue: function(value)
  {
    if(this.element) this.element.setProperty('value', value);
  },


  value: function()
  {
    if(this.element) return this.element.getProperty('value');
    return null;
  },


  setEditable: function(value)
  {
    if(this.element)
    {
      if(!value)
      {
        this.element.setProperty('readonly', 1);
      }
      else
      {
        this.element.removeProperty('readonly');
      }
    }
  },


  editable: function()
  {
    if(this.element) this.element.getProperty('enabled');
  },


  observeEvents: function()
  {
    // add key events
    this.element.addEvent('keyup', function(_evt) {
      var evt = new Event(_evt);
      var value = this.value();

      if(this.isEditing)
      {
        if(value != this.originalValue)
        {
          this.fireEvent("SSEditableTextCellDidChange", {sender:this, originalValue:this.originalValue, newValue:value});
        }

        if(evt.key == 'enter')
        {
          this.finishEdit();
          this.fireEvent("SSEditableTextCellDidFinishEditing", value);
        }
      }
    }.bind(this));

    this.element.addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      if(this.isEditing)
      {
        evt.stopPropagation();
      }
    }.bind(this));
  },


  unobserveEvents: function()
  {
    this.element.removeEvents('keyup');
    this.element.removeEvents('click');
  },


  edit: function()
  {
    if(this.element)
    {
      this.isEditing = true;

      // store the original value
      this.originalValue = this.element.getProperty('value');
      this.observeEvents();
      // make the field editable
      this.setEditable(true);
      this.editStyle();
    }
  },


  cancelEdit: function()
  {
    if(this.isEditing)
    {
      this.isEditing = false;
      // restore original value
      this.setValue(this.originalValue);
      // leave edit mode
      this.finishEdit();
      this.fireEvent("SSEditableTextCellDidCancelEdit", this);
    }
  },


  finishEdit: function()
  {
    if(this.element)
    {
      this.isEditing = false;
      // empty out original value
      this.originalValue = null;
      // make the field uneditable
      this.setEditable(false);
      this.unobserveEvents();
      this.normalStyle();
    }
  },


  normalStyle: function()
  {
    // exit edit style
    this.element.removeClass('SSEdit');
  },


  editStyle: function()
  {
    // style edit mode
    this.element.addClass('SSEdit');
  },


  unlock: function()
  {
    // clean up first
    if(this.isEditing)
    {
      this.cancelEdit();
    }
    // then call parent to clear out element
    this.parent();
  }

});

// Add it the global UI class lookup
if(typeof ShiftSpaceUI != 'undefined')
{
  ShiftSpaceUI.SSEditableTextCell = SSEditableTextCell;
}