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
  
  setup : function(json)
  {
  },
  
  createTrail: function(focusedShift, trail)
  {
    // load the interface first
    this.showInterface();
    // load the shift with the trail focused
    this.setCurrentTrail(new Trail(shiftId, trail));
  },
  
  loadTrail: function(focusedShift, trailId)
  {
    // get the trail
    this.serverCall('load', {
      'trailId': trailId
    }, function(json) {
      this.onTrailLoad(focusedShift, json);
    }.bind(this));
  },
  
  onTrailLoad: function(focusedShift, trailJson)
  {
    // load the interface first
    this.showInterface();
    this.setCurrentTrail(new Trail(focusedShift, Json.evaluate(trailJson)));
  },
  
  saveTrail: function(trail, cb)
  {
    // get the trail
    this.serverCall('save', {
      trailId: (trail && trail.id) || null, 
      content: Json.toString(trail)
    }, function(json) {
      console.log('>>>>>>>>>>>>>>>>>>>>> saved trail is ');
      console.log(json);
      this.onTrailSave(json);
      cb(json);
    }.bind(this));
  },
  
  onTrailSave: function(json)
  {
    // do some stuff
    console.log('>>>>>>>>>>>>>>>>>>>>> trail saved');
    console.log(json);
  },
  
  newTrail: function(shiftId)
  {
    this.saveTrail(null, function(json) {
      console.log('>>>>>>>>>>>>>>>>>>>>> createTrail');
      this.createTrail(shiftId, Json.evaluate(json));
    }.bind(this));
  },
  
  trailsWithShift: function(shiftId, cb)
  {
    this.serverCall('trailsWithShift', {
      'shiftId': shiftId
    }, function(json) {
      // this will be created dynamically
      var menuItems = [];
      menuItems.push({
        text: "Create a Trail",
        callback: function(shiftId)
        {
          this.newTrail(shiftId);
        }.bind(this)
      });
      if($type(json) == 'object')
      {
        for(trailId in json)
        {
          menuItems.push({
            text: json[trailId],
            callback: function(shiftId) {
              console.log('loadTrail, shiftId:' + shiftId + ', trailId:' + trailId);
              this.loadTrail(shiftId, trailId);
            }.bind(this)
          })
        }
      }
      menuItems.push({
        text: "Cancel",
        callback: function(shiftId)
        {
          this.closeMenu.bind(this);
        }.bind(this)
      });
      console.log(menuItems);
      cb(menuItems);
    }.bind(this));
  },
  
  setCurrentTrail: function(newTrail)
  {
    this.__currentTrail__ = newTrail;
  },
  
  currentTrail: function()
  {
    return this.__currentTrail__;
  },
  
  /*
    Function: menuIconForShift
      Return the CSS class for the shift.
  */
  menuIconForShift: function(shiftId)
  {
    if(false)
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
  
  menuForShift: function(shiftId, cb)
  {
    this.trailsWithShift(shiftId, cb);
    return this.delayedMenu();
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
  
  loadNav: function()
  {
    delete this.navObj;
    
    // get the recently view shifts that aren't already on the page

    this.navObj = new TrailNav(this.recentlyViewedShifts());
  },
  
  showInterface: function(shiftId)
  {
    if(!this.interfaceIsBuilt())
    {
      this.buildInterface();
    }
    
    if(this.enterFullScreen())
    {
      // put the interface back onto the DOM
      this.clippingArea.injectInside(document.body);
      this.scrollArea.empty();
      this.controls.injectInside(document.body);
      this.navBg.injectInside(document.body);
      this.nav.injectInside(document.body);
      
      // load the name
      this.loadNav();
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
  
  deleteTrail : function()
  {
  }
  
});

var Trails = new TrailsPlugin();