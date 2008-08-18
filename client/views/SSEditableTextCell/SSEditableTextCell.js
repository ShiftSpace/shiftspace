var SSEditableTextCell = new Class({
  
  name: 'SSEditableTextCell',
  
  Extends: SSCell,


  set value(value)
  {
    this.element.setProperty('value', value);
  },
  
  
  set editable(value)
  {
    this.element.setProperty('editable', value);
  },
  
  
  get value()
  {
    return this.element.getProperty('value');
  },
  
  
  get addEvent()
  {
    return this.element.addEvent.bind(this.element);
  },
  
  
  get removeEvent()
  {
    return this.element.removeEvent.bind(this.element);
  },
  
  
  get removeEvents()
  {
    return this.element.removeEvents.bind(this.element);
  },
  
  
  observeEvents: function()
  {
    // add key events
    this.addEvent('keyup', function(_evt) {
      var evt = new Event(_evt);
      var value = this.value;
      
      if(value != this.originalValue)
      {
        this.fireEvent("SSEditableTextCellChanged", {sender:this, originalValue:this.originalValue, newValue:value});
      }

      if(evt.key == 'enter')
      {
        this.finishEdit();
        this.fireEvent("SSEditableTextCellDidFinishEditing", this);
      }
    }.bind(this));
  },
  
  
  unobserveEvents: function()
  {
    this.removeEvents('keyup');
  },
  
  
  edit: function()
  {
    if(this.element)
    {
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
    if(this.element)
    {
      // restore original value
      this.value = this.originalValue;
      // leave edit mode
      this.finishEdit();
    }
  },
  
  
  finishEdit: function()
  {
    if(this.element)
    {
      // empty out original value
      this.originalValue = null;
      // make the field uneditable
      this.editable = false;
      this.unobserveEvents();
      this.normalStyle();
      // clear out element
      this.element = null;
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
  }
  
});

// Add it the global UI class lookup
if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.SSEditableTextCell = SSEditableTextCell;
}