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
    
    SSGetAllFeeds(function(feed) {
      new DatePicker(this.element, {
        whens: feed.filter(function(event) {
          return event.datetime_ref
        }).map(function(event) {
          return event.datetime_ref
        })
      })
    });
  }
});
