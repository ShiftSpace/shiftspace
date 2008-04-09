var TrailsPlugin = ShiftSpace.Plugin.extend({

  pluginType: ShiftSpace.Plugin.types.get('kMenuTypePlugin'),
  
  attributes :
  {
    name: 'Trails',
    title: null,
    icon: null,
    css: 'Trails.css'
  },
  
  initialize : function(json)
  {
    // set the trails plugin to be of the menu type
    this.parent(json);
    
    this.buildInterface();
  },
  
  loadData : function()
  {
    // fetch the data
    this.parent();
  },
  
  /*
    Function: menuIconForShift
      Return the CSS class for the shift.
  */
  menuIconForShift: function(shiftId)
  {
    if(this.data[shiftId])
    {
      return "hasTrails";
    }
    else
    {
      return "noTrails";
    }
  },
  
  menuForShift: function(shiftId)
  {
    return [
      {
        text: "Create a Trail",
        callback: function()
        {
          if(this.enterFullScreen())
          {
            this.showInterface()
          }
        }.bind(this)
      },
      {
        text: "Cancel",
        callback: this.closeMenu.bind(this)
      },
      {
        text: "Hey Avital",
        callback: function() {}
      }
    ];
  },
  
  buildInterface: function()
  {
    this.backDrop = new ShiftSpace.Element('div', {
      
    });
  },
  
  showInterface: function()
  {
    //console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Show Interface');
  },
  
  hideInterface: function()
  {
    //console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Hide Interface');
  },
  
  /*
    Function : saveTrail
  */
  saveTrail : function()
  {
    this.saveObject(this.currentTrail);
  },
  
  /*
    deleteTrail : deleteTrail
  */
  deleteTrail : function()
  {
    this.deleteObject(this.currentTrails);
  }
  
});

var Trails = new TrailsPlugin();