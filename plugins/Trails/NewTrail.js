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
    if(!$('SSTrailsPlugInIframe'))
    {
      this.frame = new ShiftSpace.Iframe({
        'id': 'SSTrailsPlugInIframe',
        src: this.attributes.dir + 'Trails.html',
        css: this.attributes.css,
        onload: this.finishFrame.bind(this)
      });
      this.frame.injectInside(document.body);
    }
  },
  
  finishFrame: function()
  {
  },
  
  showInterface: function()
  {
    if(this.interfaceIsBuilt() && this.enterFullScreen())
    {
      this.frame.injectInside(document.body);
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