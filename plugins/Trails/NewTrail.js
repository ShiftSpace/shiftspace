var TrailsPlugin = ShiftSpace.Plugin.extend({

  pluginType: ShiftSpace.Plugin.types.get('kMenuTypePlugin'),
  
  attributes :
  {
    name: 'Trails',
    title: null,
    icon: null,
    css: 'Trails.css',
    includes: ['Trail.js', 'TrailLink.js', 'TrailPage.js', 'TrailNavPage.js', 'TrailNav.js', 'Vector.js'],
    version: 0.2
  },
  
  setup : function(json)
  {
  },

  createTrail: function(focusedShift)
  {
    // load the interface first
    this.showInterface();
    // load the shift with the trail focused
    var trailJson = {};
    trailJson[focusedShift] = this.getShift(focusedShift);
    
    // store some trail info
    this.currentTrailInfo = {
      username: ShiftSpace.user.getUsername(),
      title: "Untitled"
    };
    
    this.setCurrentTrail(new Trail(focusedShift, trailJson));
    this.updateInterface();
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
    
    this.currentTrailInfo = {
      trailId: trailJson.trailId,
      username: trailJson.username,
      title: trailJson.title
    };
    
    // check to see if this is a legacy trail
    if(!trailJson.version)
    {
      this.setCurrentTrail(new Trail(focusedShift, Json.evaluate(trailJson.content)));
      this.updateInterface();
    }
    else
    {
      // we need to fetch the actual shifts
      this.trailData = Json.evaluate(trailJson.content);
      this.focusedShift = focusedShift;
      
      var trailShifts = [];
      for(var shiftId in this.trailData) { trailShifts.push(shiftId) };
      this.getShifts(trailShifts, this.trailShiftsLoaded.bind(this));
    }
  },
  
  trailShiftsLoaded : function(theShifts)
  {
    for(var a in this.trailData)
    {
      this.trailData[a]= $merge(this.trailData[a], theShifts[a]);
    }
    this.setCurrentTrail(new Trail(this.focusedShift, this.trailData));
    this.updateInterface();
  },
  
  saveTrail: function(trail, cb)
  {
    var data = {};
    
    if(trail.trailId) data.trailId = trail.trailId;
    data.content = trail.content;
    data.shifts = trail.shifts.join(',');
    data.title = trail.title;
    data.version = this.attributes.version;
    
    // get the trail
    this.serverCall(
      'save',
      data, 
      function(json) 
      {
        console.log('>>>>>>>>>>>>>>>>> trail saved! ' + Json.toString(json));
        this.onTrailSave(json);
        cb(json);
      }.bind(this)
    );
  },
  
  onTrailSave: function(json)
  {
    // do some stuff
    this.currentTrailInfo.trailId = json.trailId;
  },
  
  deleteTrail: function(trailId, cb)
  {
    var data = {'trailId':trailId};
    
    this.serverCall(
      'delete',
       data,
       function(json)
       {
         this.onTrailDelete(json);
         cb(json);
       }.bind(this)
    )
  },
  
  onTrailDelete: function(json)
  {
  },
  
  newTrail: function(shiftId)
  {
    this.createTrail(shiftId);
  },
  
  trailsWithShift: function(shiftId, cb)
  {
    this.serverCall('trailsWithShift', {
      'shiftId': shiftId
    }, function(json) {
      // this will be created dynamically
      var menuItems = [];
      // Add the first item
      menuItems.push({
        text: "Create a Trail",
        enabled: ShiftSpace.user.isLoggedIn(),
        callback: function(shiftId)
        {
          if(ShiftSpace.user.isLoggedIn())
          {
            this.newTrail(shiftId);
          }
          else
          {
            alert("You must be logged in to create a new trail.");
          }
        }.bind(this)
      });
      
      // Add the trails list
      if($type(json) == 'object')
      {
        for(var trailId in json)
        {
          menuItems.push({
            text: json[trailId],
            callback: this.loadTrail.bind(this, [shiftId, trailId])
          });
        }
      }
      
      // Add the cancel button
      menuItems.push({
        text: "Cancel",
        callback: function(shiftId)
        {
          this.closeMenu.bind(this);
        }.bind(this)
      });
      
      // send it to the callback function
      cb(menuItems);
    }.bind(this));
  },
  
  setCurrentTrail: function(newTrail)
  {
    this.__currentTrail__ = newTrail;
    newTrail.setDelegate(this);
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
      'id': 'SSTrailsPlugInClippingArea',
      'class': 'SSUserSelectNone'
    });
    this.clippingArea.injectInside(document.body);
    
    // where trails actually live
    this.scrollArea = new ShiftSpace.Element('div', {
      'id': 'SSTrailsPlugInScrollArea',
      'class': "SSNormal SSUserSelectNone" 
    });
    this.scrollArea.injectInside(this.clippingArea);
        
    // the control bar at the top
    this.controls = new ShiftSpace.Element('div', {
      'id': "trail-controls",
      'class': "SSUserSelectNone"
    });
    this.controls.setHTML('                                                    \
    <div id="trailPermaLink" class="trailPermaLink" style="border:none"></div> \
    <input type="text" id="trail-title" class="SSTrailControl"/>               \
    <div style="float:right;">permalink</div>                                  \
    <div id="trail-title-limited" class="SSUserSelectNone"></div>              \
    <div id="trail-close" class="SSUserSelectNone">                            \
    </div>                                                                     \
    <div class="SSTrailControl">                                               \
      <input type="button" value="Cancel" id="trail-cancel" />                 \
      <input type="button" value="Save" id="trail-save" />                     \
    </div>                                                                     \
    <div class="SSTrailControl">                                               \
      <input type="button" value="Delete" id="trail-delete" />                 \
    </div>                                                                     \
    <div id="trail-save-feedback"></div>                                       \
    <br class="clear" />');
    
    // build the navigation interface
    this.nav = new ShiftSpace.Element('div', {
      'id': "trail-nav",
      'class': 'SSUserSelectNone'
    });
    this.navItems = new ShiftSpace.Element('div', {
      'id': "trail-navitems",
      'class': 'SSUserSelectNone'
    });
    this.navItems.injectInside(this.nav);
    this.navBg = new ShiftSpace.Element('div', {
      id: "trail-nav-bg",
      'class': 'SSUserSelectNone'
    });                          
    
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
    // cancel create trail
    this.controls.getElement('#trail-cancel').addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      this.hideInterface();
    }.bind(this));

    // close the trail
    this.controls.getElement('#trail-close').addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      this.hideInterface();
    }.bind(this));

    // save the damn thing
    this.controls.getElement('#trail-save').addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      // encode the current trail
      var encodedTrailContent = this.currentTrail().encode();
      
      var trailJson = {
        title: $('trail-title').getProperty('value'),
        trailId: this.currentTrailInfo.trailId,
        username: this.currentTrailInfo.username,
        content: encodedTrailContent.structure,
        shifts: encodedTrailContent.nodes
      }
      
      // should merge this with a new trail json
      this.saveTrail(trailJson, this.trailSaved.bind(this));
    }.bind(this));

    // delete it! woohoo
    this.controls.getElement('#trail-delete').addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      this.deleteTrail();
      this.hideInterface();
    }.bind(this));
  },
  
  trailSaved: function(json)
  {
    // do some confirmation stuff
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
    }
  },
  
  updateInterface: function()
  {
    if(this.currentTrail() && this.currentTrailInfo)
    {
      this.controls.injectInside(document.body);

      // if user is allowed to edit
      if(this.userCanEdit())
      {
        this.navBg.injectInside(document.body);
        this.nav.injectInside(document.body);
        this.loadNav();
        // reveal the controls
        this.controls.getElements('.SSTrailControl').removeClass('SSDisplayNone');
        $('trail-title-limited').addClass('SSDisplayNone');
        $('trail-title').setProperty('value', this.currentTrailInfo.title);
      }
      else
      {
        this.controls.addClass('SSDisplayNone');
        this.controls.getElements('.SSTrailControl').addClass('SSDisplayNone');
        this.controls.removeClass('SSDisplayNone');
        $('trail-title-limited').removeClass('SSDisplayNone');
        $('trail-title-limited').setText(this.currentTrailInfo.title);
      }
    }
  },
  
  hideInterface: function()
  {
    if(this.exitFullScreen())
    {
      // remove everything from the DOM
      if(this.clippingArea.getParent()) this.clippingArea.remove();
      this.scrollArea.empty();
      if(this.controls.getParent()) this.controls.remove();
      if(this.navBg.getParent()) this.navBg.remove();
      if(this.nav.getParent()) this.nav.remove();
    }
  },
  
  deleteTrail: function()
  {
    var data = {trailId: this.currentTrailInfo.trailId};
    
    this.serverCall(
      'delete',
      data,
      this.onTrailDelete.bind(this)
    );
  },
  
  onTrailDelete: function(json)
  {
  },
  
  userCanEdit: function()
  {
    return (this.currentTrailInfo.username == ShiftSpace.user.getUsername());
  }
  
});

var Trails = new TrailsPlugin();
ShiftSpace.__externals__.Trails = Trails; // For Safari