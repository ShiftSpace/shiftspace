// ==Builder==
// @uiclass
// @package           Calendar
// @dependencies      SSView, DatePicker
// ==/Builder==

var SSCalendar = new Class({
  name: 'SSCalendar',
  Extends: SSView,

  initialize: function(el, options)
  {
    this.parent(el, options);
    new DatePicker(this.element, {
      whens: ['07/08/2009', '07/10/2009', '07/18/2008']
    });
  }
});
