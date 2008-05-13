var TrailsPlugin = ShiftSpace.Plugin.extend({

  pluginType: ShiftSpace.Plugin.types.get('kMenuTypePlugin'),
  
  attributes :
  {
    name: 'Trails',
    title: null,
    icon: null,
    css: 'Trails.css',
    includes: ['Trail.js', 'TrailLink.js', 'TrailPage.js', 'TrailNavPage.js', 'TrailNav.js']
  },
  
  initialize : function(json)
  {
    // set the trails plugin to be of the menu type
    this.parent(json);
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
      return "SSTrailsHasTrailsIcon";
    }
    else
    {
      return "SSTrailsNoTrailsIcon";
    }
  },
  
  menuIcon: function(shiftId)
  {
    return "SSTrailsPluginIcon";
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
    // this clips the scrolling area to the browser window viewport
    this.clippingArea = new ShiftSpace.Element('div', {
      'id': 'SSTrailsPlugInClippingArea'
    });
    this.clippingArea.injectInside(document.body);
    
    // where trails actually live
    this.scrollArea = new ShiftSpace.Element('div', {
      'id': 'SSTrailsPlugInScrollArea'
    });
    
    // the control bar at the top
    this.controls = new ShiftSpace.Element('div', {
      'id': "trails-controls"
    });
    
    this.controls.injectInside(document.body);
    this.scrollArea.injectInside(this.clippingArea);
    
    // store a drag reference just in case we want to stop the dragging behavior
    this.scrollDragRef = this.scrollArea.makeDraggable();
  },
  
  showInterface: function()
  {
    if(this.interfaceIsBuilt() && this.enterFullScreen())
    {
      this.clippingArea.injectInside(document.body);
    }
    else
    {
      this.buildInterface();
    }
  },
  
  hideInterface: function()
  {
    if(this.exitFullScreen())
    {
      // remove everything from the DOM
    }
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