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
    
    SSFindStreams(this.options.streamMeta, function(result) {
      this.tags = result.data.map(function(stream) {
        return stream.stream_name
      })
      
      new Autocompleter.Local(el, this.tags, this.options)
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
