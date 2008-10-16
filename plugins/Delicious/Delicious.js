var Delicious = new Class({
  
  Extends: ShiftSpace.Plugin,

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
    
  },
  
  showDeliciousWindow: function(shift) {
    alert('Delicious: ' + shift.id);
  }
  
});

ShiftSpace.__externals__.Delicious = Delicious; // For Safari
