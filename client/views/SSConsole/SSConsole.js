var SSConsole = new Class({
  
  Extends: SSView,
  
  initialize: function(el, options)
  {
    this.parent(el, options);
  },
  
  awake: function()
  {
    this.parent();
    this.outlets().get('clickMeButton').addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      console.log('Button clicked!');
    });
  }
});

// Add it the global UI class lookup
if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.SSConsole = SSConsole;
}