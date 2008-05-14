var kNULL = 'null';

var TrailsPlugin = ShiftSpace.Plugin.extend({

  pluginType: ShiftSpace.Plugin.types.get('kMenuTypePlugin'),
  
  attributes :
  {
    name: 'Trails',
    title: null,
    icon: null,
    css: 'Trails.css',
    includes: ['Trail.js', 'TrailLink.js', 'TrailPage.js', 'TrailNavPage.js', 'TrailNav.js', 'Vector.js']
  },
  
  initialize : function(json)
  {
    // set the trails plugin to be of the menu type
    this.parent(json);
  },
  
  newTrail: function(shiftId)
  {
    var trailJson = {};
    trailJson[shiftId] = {
      title : 'shiftspace',
      url : 'http://www.shiftspace.org',
      thumb : this.attributes.dir+'images/highlight_thumb.png',
      loc : { x: 200, y: 200 },
      space : 'highlight'
    };
    
    // var loadData
    var aTrail = new Trail(shiftId, trailJson);
  },
  
  loadTrail: function()
  {
    // get the trail
    /*
    this.serverCall('load', {
      id: trailId
    }, this.onTrailLoad.bind(this));
    */
    this.onTrailLoad('node1', {
      node1:
      {
        title : 'shiftspace',
        url : 'http://www.shiftspace.org',
        thumb : this.attributes.dir+'images/highlight_thumb.png',
        loc : { x: 200, y: 200 },
        space : 'highlight',
        nodes : ['node2']
      },
      node2:
      {
        title : 'shiftspace',
        url : 'http://www.shiftspace.org',
        thumb : this.attributes.dir+'images/notes_thumb.png',
        loc : { x: 500, y: 500 },
        space : 'notes',
        nodes : ['node1']
      }
    });
  },
  
  onTrailLoad: function(focusedShift, trailJson)
  {
    // load the interface first
    this.showInterface();
    var newTrail = new Trail(focusedShift, trailJson);
  },
  
  saveTrail: function(trail)
  {
    // get the trail
    this.serverCall('save', {
      id: trail.id,
      content: Json.toString(trail)
    }, this.onTrailSave.bind(this));
  },
  
  onTrailSave: function(msg)
  {
    
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
    // this will be created dynamically
    return [
      {
        text: "Create a Trail",
        callback: function(shiftId)
        {
          this.showInterface(shiftId);
        }.bind(this)
      },
      {
        text: "A Trail",
        callback: function(shiftId)
        {
          this.loadTrail();
        }.bind(this)
      },
      {
        text: "Cancel",
        callback: function(shiftId)
        {
          this.closeMenu.bind(this);
        }
      }
    ];
  },
  
  buildInterface: function()
  {
    this.setInterfaceIsBuilt(true); 

    // this clips the scrolling area to the browser window viewport
    this.clippingArea = new ShiftSpace.Element('div', {
      'id': 'SSTrailsPlugInClippingArea'
    });
    this.clippingArea.injectInside(document.body);
    
    // where trails actually live
    this.scrollArea = new ShiftSpace.Element('div', {
      'id': 'SSTrailsPlugInScrollArea',
      class: "SSNormal" 
    });
    this.scrollArea.injectInside(this.clippingArea);
        
    // the control bar at the top
    this.controls = new ShiftSpace.Element('div', {
      'id': "trail-controls"
    });
    this.controls.setHTML('                                                    \
    <div id="trailPermaLink" class="trailPermaLink" style="border:none"></div> \
    <input type="text" id="trail-title" />                                     \
    <div style="float:right;">permalink</div>                                  \
    <div id="trail-title-limited"></div>                                       \
    <div id="trail-close">                                                     \
    </div>                                                                     \
    <div>                                                                      \
      <input type="button" value="Cancel" id="trail-cancel" />                 \
      <input type="button" value="Save" id="trail-save" />                     \
    </div>                                                                     \
    <div>                                                                      \
      <input type="button" value="Delete" id="trail-delete" />                 \
    </div>                                                                     \
    <div id="trail-save-feedback"></div>                                       \
    <br class="clear" />');
    
    // build the navigation interface
    this.nav = new ShiftSpace.Element('div', {
      'id': "trail-nav"
    });
    this.navItems = new ShiftSpace.Element('div', {
      'id': "trail-navitems"
    });
    this.navItems.injectInside(this.nav);
    this.navBg = new ShiftSpace.Element('div', {
      id: "trail-nav-bg"
    });                          
    
    this.controls.injectInside(document.body);
    this.navBg.injectInside(document.body);
    this.nav.injectInside(document.body);
    
    // Create a new nav object
    this.navObject = new TrailNav();
    
    // store a drag reference just in case we want to stop the dragging behavior
    this.scrollDragRef = this.scrollArea.makeDraggable({
      onStart: function()
      {
        this.scrollArea.removeClass('SSNormal');
        this.scrollArea.addClass('SSDrag');
      }.bind(this),
      onComplete: function()
      {
        this.scrollArea.removeClass('SSDrag');
        this.scrollArea.addClass('SSNormal');
      }.bind(this)
    });
    
    // Create a test trail
    console.log('Build interface >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    
    //test.intialize()
    
    this.attachEvents();
  },
  
  attachEvents: function()
  {
    this.controls.getElement('#trail-cancel').addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      this.hideInterface();
    }.bind(this));
    this.controls.getElement('#trail-close').addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      this.hideInterface();
    }.bind(this));
  },
  
  showInterface: function(shiftId)
  {
    if(!this.interfaceIsBuilt())
    {
      this.buildInterface();
    }
    
    if(this.enterFullScreen())
    {
      this.clippingArea.injectInside(document.body);
      this.controls.injectInside(document.body);
      this.navBg.injectInside(document.body);
      this.nav.injectInside(document.body);
    }
  },
  
  hideInterface: function()
  {
    if(this.exitFullScreen())
    {
      // remove everything from the DOM
      this.clippingArea.remove();
      this.scrollArea.empty();
      this.controls.remove();
      this.navBg.remove();
      this.nav.remove();
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