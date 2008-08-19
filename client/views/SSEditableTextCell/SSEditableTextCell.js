var SSEditableTextCell = new Class({
  
  name: 'SSEditableTextCell',
  
  Extends: SSCell,


  initialize: function(options)
  {
    this.parent(options);
  },
  

  set value(value)
  {
    if(this.element) this.element.setProperty('value', value);
  },
  
  
  get value()
  {
    if(this.element) return this.element.getProperty('value');
  },
    

  set editable(value)
  {
    if(this.element)
    {
      if(!value)
      {
        this.element.setProperty('readonly', 1)
      }
      else
      {
        this.element.removeProperty('readonly');
      }
    }
  },
  
  
  get editable()
  {
    if(this.element) this.element.getProperty('enabled');
  },
  
  
  observeEvents: function()
  {
    console.log('OBSERVE');
    // add key events
    this.element.addEvent('keyup', function(_evt) {
      var evt = new Event(_evt);
      var value = this.value;
      
      if(this.isEditing)
      {
        if(value != this.originalValue)
        {
          this.fireEvent("SSEditableTextCellDidChange", {sender:this, originalValue:this.originalValue, newValue:value});
        }

        if(evt.key == 'enter')
        {
          console.log('USER EDIT');
          this.finishEdit();
          this.fireEvent("SSEditableTextCellDidFinishEditing", this);
        }
      }
    }.bind(this));
    console.log(this.element.retrieve('events'));
  },
  
  
  unobserveEvents: function()
  { 
    console.log('UNOBSERVE');
    console.log(this.element.retrieve('events'));
    this.element.removeEvents('keyup');
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
      this.editable = true;
      this.editStyle();
    }
  },
  
  
  cancelEdit: function()
  {
    if(this.isEditing)
    {
      console.log('CANCEL EDIT');
      this.isEditing = false;
      // restore original value
      this.value = this.originalValue;
      // leave edit mode
      this.finishEdit();
      this.fireEvent("SSEditableTextCellDidCancelEdit", this);
    }
  },
  
  
  finishEdit: function()
  {
    if(this.element)
    {
      console.log('FINISH EDIT');
      this.isEditing = false;
      // empty out original value
      this.originalValue = null;
      // make the field uneditable
      this.editable = false;
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
if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.SSEditableTextCell = SSEditableTextCell;
}