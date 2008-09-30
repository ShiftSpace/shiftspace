var Delicious = new Class({
  
  pluginType: ShiftSpace.Plugin.types.get('kInterfaceTypePlugin'),

  attributes:
  {
    name: 'Delicious',
    title: null,
    icon: null,
    css: 'Delicious.css',
    version: 0.1
  },
  
  setup: function() {
    
  }
  
});

ShiftSpace.__externals__.Delicious = Delicious; // For Safari
