// ==Builder==
// @uiclass
// @package           Autocomplete
// @dependencies      SSView, Autocompleter
// ==/Builder==

var SSAutocomplete = new Class({

  name: 'SSAutocomplete',
  Extends: SSView,

  
  defaults: function() {
    return $merge(this.parent(), {
      minLength: 1,
      overflow: true,
      multiple: true
    })
  },


  initialize: function(el, options)
  {
    this.parent(el, options);
    
    el.addEvent('keydown', this.handleKeyDown.bind(this));
    this.getTags();
    SSAddObserver(this, 'tagCreated', this.getTags.bind(this));
  },
  
  
  handleKeyDown: function(evt)
  {
    evt = new Event(evt);
    if(evt.key == 'enter') this.fireEvent('onEnter', this.element.getProperty('value'));
  },
  
  
  getTags: function()
  {
    SSFindStreams("tag", null, function(result) {
      var tags = result.data.map(function(stream) {
        return stream.stream_name
      });
      this.autocompleter = new Autocompleter.Local(this.element, tags, this.options);
    }.bind(this))
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
