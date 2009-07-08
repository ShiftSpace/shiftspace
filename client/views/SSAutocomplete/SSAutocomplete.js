// ==Builder==
// @uiclass
// @package           Autocomplete
// @dependencies      SSView, Autocompleter
// ==/Builder==

var SSAutocomplete = new Class({
  name: 'SSAutocomplete',
  Extends: SSView,

  initialize: function(el, options)
  {
    this.parent(el, options);
    new Autocompleter.Local(el, ['Avital', 'David', 'Joe', 'Dan', 'Mushon', 'Florica', 'Justin', 'Clint', 'Alex'], {
      'minLength': 1, // We wait for at least one character
      'overflow': true, // Overflow for more entries
      'multiple': true,
//      'separator': ' '
    });
  },

  setValue: function(value)
  {
    if(this.element) this.element.setProperty('value', value);
  },

  value: function()
  {
    if(this.element) return this.element.getProperty('value');
    return null;
  }
});
