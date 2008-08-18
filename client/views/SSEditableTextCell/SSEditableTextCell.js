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
    // add key events
    this.element.addEvent('keyup', function(_evt) {
      var evt = new Event(_evt);
      var value = this.value;
      
      console.log('keyup');

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
    this.element.removeEvents('keyup');
  },
  
  
  edit: function()
  {
    if(this.element)
    {
      console.log('EDITING!');

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