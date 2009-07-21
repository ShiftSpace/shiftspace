// ==Builder==
// @uiclass
// @package           Calendar
// @dependencies      SSView, DatePicker
// ==/Builder==

var SSCalendar = new Class({
  name: 'SSCalendar',
  Extends: SSView,
  
  defaults: function()
  {
    return $merge(this.parent(), {
     displayOptions: null 
    });
  },

  initialize: function(el, options)
  {
    this.parent(el, options);
    new DatePicker(this.element, this.options.displayOptions);
  }
});
