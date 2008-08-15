var SSConsole = new Class({
  
  Extends: SSView,
  
  initialize: function(el, options)
  {
    this.super(el, options);
  },
  
  awake: function()
  {
    console.log('SSConsole awake, outlets:' + JSON.encode(this.outlets().getKeys()));
  }
});

// Add it the global UI class lookup
if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.SSConsole = SSConsole;
}