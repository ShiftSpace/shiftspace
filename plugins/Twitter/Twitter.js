var TwitterPlugin = new Class({
  pluginType: ShiftSpace.Plugin.types.get('kInterfaceTypePlugin'),

  attributes:
  {
    name: 'Twitter',
    title: null,
    icon: null,
    css: 'Twitter.css',
    version: 0.1
  },

  setup: function()
  {
    SSLog('Setting up Twitter plugin');
  }
});

var Twitter = new TwitterPlugin();
ShiftSpace.__externals__.Comments = Comments; // For Safari & Firefox 3.1