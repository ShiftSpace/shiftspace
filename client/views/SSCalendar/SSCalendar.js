// ==Builder==
// @uiclass
// @package           Calendar
// @dependencies      SSView, DatePicker
// ==/Builder==

var SSCalendar = new Class({

  Extends: SSView,
  name: 'SSCalendar',

  
  defaults: function()
  {
    return $merge(this.parent(), {
     displayOptions: null 
    });
  },


  initialize: function(el, options)
  {
    this.parent(el, options);
    var picker = new DatePicker(this.element, $merge(this.options.displayOptions, {delegate:this}));
    this.setPicker(picker);
  },

  
  setPicker: function(picker)
  {
    this.__picker = picker;
  },

  
  picker: function()
  {
    return this.__picker;
  }
  
});
