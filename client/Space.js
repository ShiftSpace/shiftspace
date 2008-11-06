// ==Builder==
// @required
// @name              Space
// @package           System
// ==/Builder==

/*
  Class: ShiftSpace.Space
    The base class for spaces.  A Space is essentially an extension to the ShiftSpace architecture.  You can think of ShiftSpace
    as a kind of simple operating system and windowing interface.  ShiftSpace doesn't actually know much about individual spaces.
    A Space is a kind of document controller, the documents being the shifts it manages. Some spaces need a cross document interface,
    such as SourceShift, while others, such as Notes, present only the interface provided by the document itself.  The API for
    spaces can handle both types.  Refer to the source code of Notes and SourceShift to see their differences.

    Most of the methods here get called automatically.  For example, you should rarely if ever, call the showShift method directly.
    Users should be in control of whether a shift is visible or not.  In general the user of ShiftSpace is in control of the experience
    not the developer.  To get a better understanding of this please refer to the ShiftSpace tutorial.
*/
ShiftSpace.Space = new Class({
  
  name: 'ShiftSpace.Space',
  
  Implements: [Events, Options],

  attributes : {},

  /*
    Function : initialize (private)
      Initialize the space.  Sets internala state variables as well as calls SSRegisterSpace.  Also call the subclass
      setup method.
  */
  initialize: function( shiftClass )
  {
    SSLog('INITIALIZE: ' + this.attributes.name);

    this.shiftClass = shiftClass;

    // set the interface built flag
    this.__interfaceBuilt__ = false;
    this.__state__ = new Hash();

    this.__deferredNewShifts__= [];
    this.__deferredShifts__ = [];
    this.__deferredEdits__ = [];

    // if no css file, we don't need to wait for it to load
    this.setCssLoaded(!this.attributes.css);

    // the shifts array
    this.shifts = {};

    // is visible flag
    this.setIsVisible(false);

    var valid = true;

    if(!this.shiftClass)
    {
      valid = false;
      SSLog('You did not specify a Shift Class for this Space.', SSLogError);
    }

    // Error checking for Developers, probably should just replace with defaults
    if( !this.attributes.name )
    {
      valid = false;
      SSLog(this);
      SSLog('This Space does not define a name attribute.', SSLogError);
    }
    if( !this.attributes.icon )
    {
      valid = false;
      SSLog('Error: This Space does not have an icon.', SSLogError);
    }

    if( valid )
    {
      if(typeof SSRegisterSpace != 'undefined')
      {
        SSLog('REGISTER >');
        SSRegisterSpace( this, this.attributes );
      }
      else
      {
        SSLog('SSRegisterSpace is NOT defined.');
      }
    }
    else
    {
      var name = this.attributes.name || '';
      console.error( 'Error: The  ' + name + ' is not valid and will not be instantiated.' );
    }
    //SSLog('/ / / / SETTING UP');
    this.setup();

    // check for a pending shift
    var pendingShift = SSPendingShift();
    if(pendingShift)
    {
      // clear it out
      SSSetPendingShift(null);
      // show the pending shift
      SSShowShift(pendingShift);
    }

    return this;
  },

  /*
    Function: setup (abstract)
      To be implemented by subclasses.
  */
  setup: function() {},

  /*
    Function: interfaceIsBuilt
      Returns whether the interface of the space has been built yet.
  */
  interfaceIsBuilt : function()
  {
    return this.__interfaceBuilt__;
  },

  /*
    Function: setInterfaceIsBuilt (private)
      Set the private interface built flag.

    Parameters:
      val - a boolean.
  */
  setInterfaceIsBuilt : function(val)
  {
    return this.__interfaceBuilt__ = val;
  },

  /*
    Function: onCssLoad (private)
      Callback handler when the space's css file has loaded.  The interface is not built until after this
      function has been called.  Also any shifts that were set to creaetd/shown/edited.
  */
  onCssLoad : function()
  {
    this.setCssLoaded(true);

    if(this.__deferredContent__)
    {
      SSLog('__deferredContent__');

      this.showInterface();
      this.hideInterface();

      // load any deferred shifts
      this.__deferredShifts__.each(function(aShift) {
        if(aShift.id)
        {
          SSShowShift(aShift.id);
        }
        else
        {
          SSShowShift(aShift);
        }
      }.bind(this));

      // edit any deferred shifts
      this.__deferredEdits__.each(function(aShift) {
        SSLog('deferred edit');
        SSEditShift(aShift);
      }.bind(this));

      // load any deferred just created shifts
      this.__deferredNewShifts__.each(function(aShift) {
        SSLog('show deferred new shift');
        this.createShift(aShift);
        SSShowNewShift(aShift.id);
      }.bind(this));
    }
  },

  /*
    Function: addDeferredNew (private)
      Adds a deferred shift was just created.  This happens when a user create a shift
      using the Menu for a space that hasn't loaded yet.

    Parameters:
      shift - shift content Javascript object.
  */
  addDeferredNew: function(shift)
  {
    this.__deferredNewShifts__.push(shift);
    this.__deferredContent__ = true;
  },

  /*
    Function: addDeferredShift (private)
      Adds a deferred shift to be show.  This happens a user attempt to view a shift
      from <Console> for a space that hasn't loaded yet.

    Parameters:
      shiftId - a shift id.
  */
  addDeferredShift: function(shiftId)
  {
    this.__deferredShifts__.push(shiftId);
    this.__deferredContent__ = true;
  },

  /*
    Function: addDeferredEdit (private)
      Adds a deferred shift to be edited.  This happens when a user attempts to edit
      an existing shift from the <Console>.

    Parameters:
      shiftId - a shift id.
  */
  addDeferredEdit: function(shiftId)
  {
    this.__deferredEdits__.push(shiftId);
    this.__deferredContent__ = true;
  },

  /*
    Function: setCssLoaded (private)
      A setter for the internal flag tracking whether the css for this space has loaded yet.
  */
  setCssLoaded: function(val)
  {
    this.__cssLoaded__ = val;
  },

  /*
    Function: cssIsLoaded (private)
  */
  cssIsLoaded: function()
  {
    return this.__cssLoaded__;
  },

  /*
    Function: show (private)
      Show the space. Simple calls Space.showInterface

    See Also:
      Space.showInterface
  */
  show : function()
  {
    this.showInterface();
  },

  /*
    Function: hide
      Hide the space's interface is there is one.

    See Also:
      Space.hideInterface
  */
  hide : function()
  {
    this.hideInterface();

    for(var shift in this.shifts)
    {
      if(this.shifts[shift].isVisible())
      {
        this.shifts[shift].hide();
      }
    }
  },


  sleep: function()
  {
    // keep track of all the visible shifts
  },


  wake: function()
  {
    // restore the previously visible shifts
  },


  /*
    Function: setIsVisible
      Setter for internal flag about whether the Space and/or it's shifts are visible.

    Parameters:
      val - a boolean.
  */
  setIsVisible: function(val)
  {
    this.__isVisible__ = val;
  },


  /*
    Function: isVisible
      Returns value of internal flag about wheter the Space's interface or any of its shifts are visible.

    Returns:
      A boolean.
  */
  isVisible: function()
  {
    var visibleShifts = false;
    for(var shift in this.shifts)
    {
      if(this.shifts[shift].isVisible())
      {
        visibleShifts = true;
        continue;
      }
    }
    return this.__isVisible__ || visibleShifts;
  },

  /*
    Function: showInterface
      Show the space interface.  This can be overriden if necessary but you must remember to call this.parent()
      from your overriding method.

    Parameters:
      position (optional) - the x/y position of the mouse.
  */
  showInterface : function(position)
  {
    if(!this.interfaceIsBuilt() )
    {
      if(this.cssIsLoaded())
      {
        this.buildInterface();
        this.setInterfaceIsBuilt(true);
      }
      else
      {
        this.__deferredContent__ = true;
      }
    }
  },

  /*
    Function: hideInterface
      Hide the interface of the space.  If there are any unsaved shifts they will be destroyed. Can be overriden, remember to call
      this.parent() from your overriding method.
  */
  hideInterface : function()
  {
    // remove any unsaved shifts
    var unsavedShifts = [];

    for(var shift in this.shifts)
    {
      if(shift.search('newShift') != -1)
      {
        unsavedShifts.push(this.shifts[shift]);
        delete this.shifts[shift];
      }
    }

    unsavedShifts.each(function(x) {
      x.destroy();
    });
  },

  /*
    Function: buildInterface (abstract)
      subclass should implement this if they want to present a custom interface.

    Example:
      (start code)
      build: function()
      {
        var this.element = new ShiftSpace.Element('div', {
          'class':'MyCSSClass'
        });
        var this.title = new ShiftSpace.Element('span', {
          'class':'MyCSSSpanClass'
        });
        this.title.setText('MyTitle');
        this.title.injectInside(this.element);

        this.setMainView(this.element);
      }
      (end)
  */
  buildInterface : function() {},

  /*
    Function: getName
      Returns the name of the shift.

    Returns:
      The name of the space as a string.
  */
  getName : function()
  {
    return this.attributes.name;
  },

  /*
    Function: addShift (private)
      Adds a shift to an internal array.  Implicity creates a new instance of a shift based on the
      contents of the passed in Object.

    Parameters:
      Takes a shift JSON object and creates and attaches event handlers.

    Returns:
      The internal shift instance.
  */
  addShift : function( aShift )
  {
    // add a backreference
    aShift.parentSpace = this;

    SSLog('constructing');
    SSLog(this.shiftClass);

    // create the new shift
    try
    {
      var newShift = new this.shiftClass( aShift );
    }
    catch(exc)
    {
      SSLog(SSDescribeException(exc));
    }

    //SSLog('a new shift');
    //SSLog(newShift);

    // listen for shift updates
    newShift.addEvent( 'onUpdate', this.updateShift.bind( this ) );
    // Set up events that console will listen to
    newShift.addEvent( 'onShiftShow', function( shiftId ) {
      this.onShiftShow(shiftId);
      this.fireEvent( 'onShiftShow', shiftId );
    }.bind( this ) );
    newShift.addEvent( 'onShiftHide', function( shiftId ) {
      this.onShiftHide(shiftId);
      this.fireEvent( 'onShiftHide', shiftId );
    }.bind( this ) );
    newShift.addEvent( 'onShiftDestroy', function( shiftId ) {
      this.onShiftDestroy(shiftId);
      this.fireEvent( 'onShiftDestroy', shiftId );
    }.bind( this ) );
    newShift.addEvent( 'onShiftFocus', function( shiftId ) {
      this.onShiftFocus(shiftId);
      this.fireEvent( 'onShiftFocus', shiftId );
    }.bind( this ));
    newShift.addEvent( 'onShiftBlur', function( shiftId ) {
      this.onShiftBlur(shiftId);
      this.fireEvent( 'onShiftBlur', shiftId );
    }.bind( this ));
    newShift.addEvent( 'onShiftSave', function( shiftId ) {
      this.onShiftSave(shiftId);
      this.fireEvent( 'onShiftSave', shiftId );
    }.bind( this ));

    //SSLog('events added');

    this.shifts[newShift.getId()] = newShift;

    //SSLog('exiting');

    return this.shifts[newShift.getId()];
  },

  /*
    Function: allocateNewShift
      Used when it necessary to kick off shift allocation from with in a Space
      and not from the ShiftMenu.  ImageSwap uses this.
  */
  allocateNewShift: function()
  {
    if(typeof SSInitShift != 'undefined') SSInitShift(this.getName(), {});
  },

  /*
    Function : createShift (private)
      Create a new shift.

    Parameters :
      newShiftJson - The JSON for the new shift.

    Returns:
      The new Shift object.
  */
  createShift : function( newShiftJson )
  {
    SSLog('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> createShift');
    if(this.cssIsLoaded())
    {
      this.addShift(newShiftJson);
      SSLog('added shift');
      var _newShift = this.shifts[newShiftJson.id];
      SSLog('fire event');
      this.fireEvent( 'onCreateShift', { 'space' : this, 'shift' : _newShift } );
      SSLog('return new baby');
      return _newShift;
    }
    else
    {
      SSLog('++++++++++++++++++++++++++++ css not loaded');
      // we need to load these when the css is done
      this.addDeferredNew( newShiftJson );
    }

    return null;
  },

  /*
    Function : deleteShift
      Delete a shift from the internal array.  Implicity calls SSDeleteShift which will remove this
      shift from the ShiftSpace DB.

    Parameters :
      shiftId - The id of the shift.
  */
  deleteShift : function( shiftId )
  {
    // destroy the shift
    if (this.shifts[shiftId])
    {
        this.shifts[shiftId].destroy();
        delete this.shifts[shiftId];
    }

    this.fireEvent( 'onDeleteShift', shiftId );
  },

  /*
    Function: editShift
      Tell the shift to go into edit mode.

    Parameters:
      shiftId - a shift id.
  */
  editShift : function( shiftId )
  {
    var theShift = this.shifts[shiftId];

    if(!theShift.isBeingEdited())
    {
      theShift.setIsBeingEdited(true);
      theShift.edit();
    }
  },

  /*
    Function: updateShift
      Update a shift.  Implicity calls the SSUpdateShift in Core to update the ShiftSpace DB.

    Parameters:
      aShift - The shift instance to update.
  */
  updateShift : function( aShift )
  {
    // notify other object such as the console
    var shiftJson = aShift.encode();

    // fix this
    shiftJson.id = aShift.getId();
    shiftJson.space = this.attributes.name;
    shiftJson.username = ShiftSpace.User.getUsername();

    this.fireEvent('onShiftUpdate', shiftJson);
  },


  /*
    Function: canShowShift (abstract)
      Check if the shift json can be shown.  This method returns true unless you override it.

    Parameters:
      shiftJson - a shift JSON object

    Returns:
      A boolean.
  */
  canShowShift: function(shiftJson)
  {
    return true;
  },


  /*
    Function : showShift
      Show a shift.  If a corresponding internal instance does not exist it will be created.

    Parameters :
      shiftId - The JSON representing the shift to show.

    Returns :
      An _ACTUAL_ Shift object, _NOT_ an id.
  */
  showShift : function( aShift )
  {
    if(!this.cssIsLoaded())
    {
      this.__deferredShifts__.push(aShift);
    }
    else
    {
      var cShift;
      if($type(aShift) != 'object')
      {
        cShift = this.shifts[aShift];
      }
      else
      {
        cShift = this.shifts[aShift.id];
      }

      if( !cShift )
      {
        // add the shift if we don't have it already
        try
        {
          this.addShift( aShift );
        }
        catch(exc)
        {
          SSLog(SSDescribeException(exc));
        }
        cShift = this.shifts[aShift.id];
      }

      if( cShift.canShow() )
      {
        // blur the old shift
        if(this.getCurrentShift() &&
           cShift != this.getCurrentShift())
        {
          this.getCurrentShift().onBlur();
        }

        this.setCurrentShift(cShift);

        // show the new shift and focus it
        if(!cShift.isVisible())
        {
          // do some private show setup here, this way subclass don't have to call this.parent() in show
          cShift._show();
          // call the actual show method
          cShift.show();

          // set some state flags
          cShift.setIsVisible(true);
          cShift.setIsBeingEdited(false);
        }

        // focus the shift
        cShift.onFocus();
      }

      // set the currentShift
      return cShift;
    }

    return null;
  },

  /*
    Function: hideShift
      Hides a shift.

    Parameters:
      shiftId - a shift id.
  */
  hideShift : function( shiftId )
  {
    var cShift = this.shifts[shiftId];

    if( cShift )
    {
      if( cShift.canHide() && cShift.isVisible() )
      {
        cShift._hide();
        cShift.hide();
        cShift.setIsBeingEdited(false);
        cShift.setIsVisible(false);
      }
    }
    else
    {
      console.error( "Shift " + shiftId + " does not exist in this the " + this.getName() + " space." );
    }

    // check to see if there are no visible shifts, if not, hide the space interface
    var visibleShifts = false;
    for(var shift in this.shifts)
    {
      if(this.shifts[shift].isVisible())
      {
        visibleShifts = true;
        continue;
      }
    }
    if(!visibleShifts) this.hideInterface();
  },

  /*
    Function: orderFront
      Move a shift back in the display order.  This is generally called by ShiftSpace.

    Parameters:
      shiftId - the id of the Shift.
      layer - not yet implemented.
  */
  orderFront : function( shiftId, layer )
  {
    var mv = this.shifts[shiftId].getMainView();
    if(mv && !mv.hasClass('SSUnordered'))
    {
      mv.setStyle('zIndex', 10000);
    }
  },

  /*
    Function: orderBack
      Move a shift front in the display order.

    Parameters:
      shiftId - the id of the Shift.
      layer - not yet implemented.
  */
  orderBack : function( shiftId, layer )
  {
    var mv = this.shifts[shiftId].getMainView();
    if(mv && !mv.hasClass('SSUnordered'))
    {
      mv.setStyle('zIndex', 9999);
    }
  },

  /*
    Function: setDepth
      Not yet implemented.
  */
  setDepth: function( shiftId, depth )
  {
    var mv = this.shifts[shiftId].getMainView();
    if(mv && !mv.hasClass('SSUnordered'))
    {
      mv.setStyle('zIndex', depth);
    }
  },

  /*
    Function: regionIsObscured
      Not yet implemented.
  */
  regionIsObscured : function( region )
  {
    var len = this.shifts.length;
    for(var i = 0; i < len; i++ )
    {
      var aShift = this.shifts[i];

      if(aShift.mainViewIsVisible())
      {
        var sregion = aShift.getRegion();

        // check to see if any point of the region falls within this shift
        if ( !( sregion.left > region.right
            || sregion.right < region.left
            || sregion.top > region.bottom
            || sregion.bottom < region.top
            ) )
        {
          return true;
        }
      }
    }
    return false;
  },

  /*
    Function: setCurrentShift (private)
      Set the current shift object.

    Parameters:
      newShift - an internal shift instance.
  */
  setCurrentShift : function(newShift)
  {
    this.__currentShift__ = newShift;
  },

  /*
    Function: setCurrentShiftById
      Same as Space.setCurrentShift but can use an id instead.

    Parameters:
      shiftId - a shift id.
  */
  setCurrentShiftById: function(shiftId)
  {
    this.setCurrentShift(this.shifts[shiftId]);
  },

  /*
    Function: getCurrentShift
      Get the current shift.

    Returns:
      The current focused shift instance.
  */
  getCurrentShift : function()
  {
    return this.__currentShift__;
  },

  /*
    Fuction: getShift
      Returns a shift instance from the internal hash.

    Parameters:
      shiftId - a shift id.
  */
  getShift: function(shiftId)
  {
    return this.shifts[shiftId];
  },

  /*
    Function: focusShift
      Focus a shift.  Implicitly calls Space.setCurrentShift.

    Parameters:
      shiftId - a shift id.
  */
  focusShift : function(shiftId)
  {
    this.setCurrentShift(this.shifts[shiftId]);
    this.getCurrentShift().onFocus();
  },

  /*
    Function: blurShift
      Blur a shift. If the shift is being edited it will be taken out of editing mode.

    Parameters:
      shiftId - a shift id.
  */
  blurShift: function(shiftId)
  {
    var theShift = this.shifts[shiftId];
    theShift.onBlur();
    theShift.setIsBeingEdited(false);
  },

  /*
    Function: onShiftPrepare (abstract)
      Called before a shift will be shown.

    Parameters:
      shiftId - a shift id.
  */
  onShiftPrepare : function(shiftId) {},

  /*
    Function: onShiftCreate (abstract)
      Called after a shift has been created.

    Parameters:
      shiftId - a shift id.
  */
  onShiftCreate : function(shiftId) {},

  /*
    Function: onShiftEdit (abstract)
      Called after a shift has been edited.

    Parameters:
      shiftId - a shift id.
  */
  onShiftEdit: function(shiftId) {},

  /*
    Function: onShiftSave (abstract)
      Called after a shift has been saved.

    Parameters:
      shiftId - a shift id.
  */
  onShiftSave : function(shiftId) {},

  /*
    Function: onShiftDelete (abstract)
      Called after a shift has been deleted.

    Parameters:
      shiftId - a shift id.
  */
  onShiftDelete : function(shiftId) {},

  /*
    Function: onShiftDestroy (abstract)
      Called after a shift has been destroyed.

    Parameters:
      shiftId - a shift id.
  */
  onShiftDestroy : function(shiftId) {},

  /*
    Function: onShiftShow (abstract)
      Called after shift has been shown.

    Parameters:
      shiftId - a shift id.
  */
  onShiftShow : function(shiftId) {},

  /*
    Function: onShiftHide (abstract)
      Called after a shift has been hidden.

    Parameters:
      shiftId - a shift id.
  */
  onShiftHide : function(shiftId) {},

  /*
    Function: onShiftFocus (abstract)
      Called after a shift has been focused.

    Parameters:
      shiftId - a shift id.
  */
  onShiftFocus : function(shiftId) {},

  /*
    Function: onShiftBlur (abstract)
      Called after a shift has been blurred.

    Parameters:
      shiftId - a shift id.
  */
  onShiftBlur: function(shiftId) {},

  /*
    Function: setValue
      Safe wrapper around GM_setValue for spaces.

    Parameters:
      key - a string. The actual key is "spaceName.key"
      value - a value to be set.
  */
  setValue : function(key, value)
  {
    setValue.safeCall(this.attributes.name + "." + key, value);
  },

  /*
    Function: getValue
      Safe wrapper around GM_getValue

    Parameters:
      key - returns a key. The real key is "spaceName.key".
      defaultValue - a default value is the key doesn't exist.
      callback - a callback function.
  */
  getValue : function(key, defaultValue, callback)
  {
    SSGetValue.safeCallWithResult(this.attributes.name + '.' + key, defaultValue, callback);
  },

  /*
    Function: updateTitleOfShift (private)
      Update the title of a shift, if appropriate.

    Parameters:
      shiftId - a shift id.
      title - a new title <string>.
  */
  updateTitleOfShift: function(shiftId, title)
  {
    this.shifts[shiftId].updateTitle(title);
  },

  /*
    Function: mainViewForShift (private)
      Returns the main view DOM node of the shift.

    Parameters:
      shiftId - a shift id.

    Returns:
      A DOM node.
  */
  mainViewForShift: function(shiftId)
  {
    return this.shifts[shiftId].getMainView();
  },

  /*
    Function: saveState (private)
      Saves the state of the space. For the moment just saves the currently visible shifts.
      Normally used when a plugin takes over the entire current browser viewport.
  */
  saveState: function()
  {
    // empty the state
    this.__state__.empty();

    var visibleShifts = [];
    for(var shift in this.shifts)
    {
      if(this.shifts[shift].isVisible())
      {
        visibleShifts.push(this.shifts[shift]);
      }
    }
    this.__state__.set('visibleShifts', visibleShifts);
  },

  /*
    Function: restoreState (private)
      Restores the state of the space. Normally used when a plugin has relinquished the
      browser's current viewport.
  */
  restoreState: function()
  {
    this.__state__.get('visibleShifts').each(function(x) { x.show(); });
  },

  /*
    Function: isNewShift
      Used to check whether a shift is unsaved.

    Parameters:
      shiftId - a shift id.
  */
  isNewShift: function(shiftId)
  {
    return SSIsNewShift(shiftId);
  },

  /*
    Function: xmlhttpRequest
      A safe wrapper around GM_xmlhttpRequest.

    Parameters:
      config - object with properties as defined by GM_xmlhttpRequest.
  */
  xmlhttpRequest: function(config)
  {
    SSXmlHttpRequest.safeCall(config);
  },

  /*
    Function: setPref
      Set a space pref.

    Parameters:
      key - a key.
      value - a value to be set. If value is an Object make sure there aren't circular references.
  */
  setPref: function(key, value)
  {
    this.setValue(this.attributes.name+'.prefs.'+key, value);
  },

  /*
    Function: getPref
      Returns a space pref.

    Parameters:
      key - a key.
      defaultValue - a default value.
      callback - a function to be called when the value has been retrieved.
  */
  getPref: function(key, defaultValue, callback)
  {
    this.getValue(this.attributes.name+'.prefs.'+key, defaultValue, callback);
  }

});