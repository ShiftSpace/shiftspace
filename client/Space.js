/*
  Class: Space
    The base class for spaces.
*/
ShiftSpace.Space = new Class({
  attributes : {},
  
  /*
    Function : initialize
      The you can set the default shift constructor
  */
  initialize: function( shiftClass ) 
  {
    this.shiftClass = shiftClass;
    
    // set the interface built flag
    this.__interfaceBuilt__ = false;
    this.__state__ = new Hash();
    
    this.__deferredNewShifts__= [];
    this.__deferredShifts__ = [];
    this.__deferredEdits__ = [];
    
    this.setCssLoaded(false);
    
    // the shifts array
    this.shifts = {};

    // is visible flag
    this.setIsVisible(false);

    var valid = true;

    if(!this.shiftClass)
    {
      valid = false;
      console.error( 'Error: You did not specify a Shift Class for this Space.' );
    }

    // Error checking for Developers, probably should just replace with defaults
    if( !this.attributes.name )
    {
      valid = false;
      console.error( 'Error: This Space does not define a name attribute.' );
    }
    if( !this.attributes.icon )
    {
      valid = false;
      console.error( 'Error: This Space does not have an icon.' );
    }

    if( valid )
    {
      if(typeof registerSpace != 'undefined') registerSpace( this, this.attributes );
    }
    else
    {
      var name = this.attributes.name || '';
      console.error( 'Error: The  ' + name + ' is not valid and will not be instantiated.' );
    }
    console.log('/ / / / SETTING UP');
    this.setup();
    
    return this;
  },
  
  setup: function() {},
  
  interfaceIsBuilt : function()
  {
    return this.__interfaceBuilt__;
  },
  
  setInterfaceIsBuilt : function(val)
  {
    return this.__interfaceBuilt__ = val;
  },
  
  onCssLoad : function()
  {
    this.setCssLoaded(true);

    if(this.__deferredContent__)
    {
      console.log('__deferredContent__');

      this.showInterface();
      this.hideInterface();

      // load any deferred shifts
      this.__deferredShifts__.each(function(aShift) {
        if(aShift.id)
        {
          showShift(aShift.id);
        }
        else
        {
          showShift(aShift);
        }
      }.bind(this));
      
      // edit any deferred shifts
      this.__deferredEdits__.each(function(aShift) {
        editShift(aShift);
      }.bind(this));

      // load any deferred just created shifts
      this.__deferredNewShifts__.each(function(aShift) {
        console.log('show deferred new shift');
        this.createShift(aShift);
        SSShowNewShift(aShift.id);
      }.bind(this));
    }
  },
  
  addDeferredNew: function(shift)
  {
    this.__deferredNewShifts__.push(shift);
    this.__deferredContent__ = true;
  },
  
  addDeferredShift: function(shiftId)
  {
    this.__deferredShifts__.push(shiftId);
    this.__deferredContent__ = true;
  },
  
  addDeferredEdit: function(shiftId)
  {
    this.__deferredEdits__.push(shiftId);
    this.__deferredContent__ = true;
  },
  
  setCssLoaded: function(val)
  {
    this.__cssLoaded__ = true;
  },
  
  cssIsLoaded: function()
  {
    return this.__cssLoaded__;
  },
  
  show : function()
  {
    this.showInterface();
  },
  
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
  
  setIsVisible: function(val)
  {
    this.__isVisible__ = val;
  },
  
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
  
  buildInterface : function() {},
  
  /*
    Function: getName
      Returns the name of the shift.
  */
  getName : function()
  {
    return this.attributes.name;
  },
  
  /*
    Function : addShift
    
    Parameters :
      Takes a shift JSON object and creates and attaches event handlers.
  */
  addShift : function( aShift )
  {
    // add a backreference
    aShift.parentSpace = this;
    
    console.log('constructing');
    console.log(this.shiftClass);

    // create the new shift
    try
    {
      var newShift = new this.shiftClass( aShift );
    }
    catch(exc)
    {
      console.log(SSDescribeException(exc));
    }
    
    console.log('a new shift');
    console.log(newShift);
    
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
      this.fireEvent( 'onShiftFocus', shiftId )
    }.bind( this ));
    newShift.addEvent( 'onShiftBlur', function( shiftId ) {
      this.onShiftBlur(shiftId);
      this.fireEvent( 'onShiftBlur', shiftId );
    }.bind( this ));
    newShift.addEvent( 'onShiftSave', function( shiftId ) {
      this.onShiftSave(shiftId);
      this.fireEvent( 'onShiftSave', shiftId );
    }.bind( this ));
    
    console.log('events added');
    
    this.shifts[newShift.getId()] = newShift;
    
    console.log('exiting');
    
    return this.shifts[newShift.getId()];
  },
  
  /*
    Function: allocateNewShift
      Used when it necessary to kick off shift allocation from with in a Space
      and not from the ShiftMenu.  ImageSwap uses this.
  */
  allocateNewShift: function()
  {
    if(typeof initShift != 'undefined') initShift(this.getName(), {});
  },
  
  /*
    Function : createShift
      Create a new shift.
      
    Parameters :
      newShiftJson - The JSON for the new shift.
      
    Returns:
      The new Shift object.
  */
  createShift : function( newShiftJson )
  {
    console.log('createShift, cssIsLoaded:' + this.cssIsLoaded());
    if(this.cssIsLoaded())
    {
      console.log('add a shift');
      this.addShift(newShiftJson);
      console.log('added shift');
      var _newShift = this.shifts[newShiftJson.id];
      console.log('fire event');
      this.fireEvent( 'onCreateShift', { 'space' : this, 'shift' : _newShift } );
      console.log('return new baby');
      return _newShift;
    }
    else
    {
      // we need to load these when the css is done
      this.addDeferredNew( newShiftJson );
    }
  },
  
  /*
    Function : deleteShift
      Delete a shift.
      
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
    Function : updateShift
    
    Parameters :
      aShift - The shift instance to update.
  */
  updateShift : function( aShift ) 
  {
    // notify other object such as the console
    var shiftJson = aShift.encode();
    shiftJson.id = aShift.getId();
    shiftJson.space = this.attributes.name;
    shiftJson.username = ShiftSpace.user.getUsername();
    this.fireEvent('onShiftUpdate', shiftJson);
  },
  
  /*
    Function : showShift
    
    Parameters :
      shiftId - The JSON representing the shift to show.
      
    Returns :
      An actual Shift object.
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
          console.log(SSDescribeException(exc));
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
          cShift._show();
          cShift.show();
          cShift.setIsVisible(true);
          cShift.setIsBeingEdited(false);
        }
      
        // focus the shift
        cShift.onFocus();
      }
    
      // set the currentShift
    
      return cShift;
    }
  },
  
  /*
    Function : hideShift
    
    Parameters
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
    Function: setValue
      Set a value with GM_setValue
    
    Parameters:
      key - the key of the value to set.
      value - the value itself.
  */
  setValue : function( key, value ) {
    var self = this;
    setTimeout(function() {
      setValue(self.getName() + '.' + key, value);
    }, 0);
  },
  
  /*
    Function: getValue
      Retrieve a value with GM_setValue
    
    Parameters:
      key - the key of the value to retrieve.
      defaultValue - returned if the key hasn't been set before.
  */
  getValue : function( key, defaultValue ) {
    return getValue(this.getName() + '.' + key, defaultValue);
  },
  
  /*
    Function: orderFront
      Move a shift back in the display order.  This is generally called by ShiftSpace.
      +
    Parameters:
      shiftId - the id of the Shift.
  */
  orderFront : function( shiftId, layer )
  {
    var mv = this.shifts[shiftId].getMainView();
    if(mv && !mv.hasClass('SSUnordered')) 
    {
      mv.setStyle('zIndex', 99);
    }
  },
  
  /*
    Function: orderBack
      Move a shift front in the display order.
      
    Parameters:
      shiftId - the id of the Shift.
  */
  orderBack : function( shiftId, layer )
  {
    var mv = this.shifts[shiftId].getMainView();
    if(mv && !mv.hasClass('SSUnordered'))
    {
      mv.setStyle('zIndex', 1);
    }
  },
  
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
      Checks to see if any of the visible shifts are obscuring the region.
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
    Function: setCurrentShift
      Set the current shift.
  */
  setCurrentShift : function(newShift)
  {
    this.__currentShift__ = newShift;
  },
  
  /*
    Function: getCurrentShift
      Set the current shift.
  */
  getCurrentShift : function()
  {
    return this.__currentShift__;
  },
  
  getShift: function(shiftId)
  {
    return this.shifts[shiftId];
  },
  
  focusShift : function(shiftId)
  {
    this.setCurrentShift(this.shifts[shiftId]);
    this.getCurrentShift().onFocus();
  },
  
  blurShift: function(shiftId)
  {
    var theShift = this.shifts[shiftId];
    theShift.onBlur();
    theShift.setIsBeingEdited(false);
  },
  
  onShiftCreate : function(shiftId) {},
  onShiftEdit: function(shiftId) {},
  onShiftSave : function(shiftId) {},
  onShiftDelete : function(shiftId) {},
  onShiftDestroy : function(shiftId) {},
  onShiftShow : function(shiftId) {},
  onShiftHide : function(shiftId) {},
  onShiftFocus : function(shiftId) {},
  onShiftBlur: function(shiftId) {},
  
  setValue : function(key, value)
  {
    setValue.safeCall(this.attributes.name + "." + key, value);
  },
  
  getValue : function(key, callback)
  {
    getValue.safeCallWithResult(this.attributes.name + '.' + key, callback);
  },
  
  updateTitleOfShift: function(shiftId, title)
  {
    this.shifts[shiftId].updateTitle(title);
  },
  
  mainViewForShift: function(shiftId)
  {
    return this.shifts[shiftId].getMainView();
  },
  
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
  
  restoreState: function()
  {
    this.__state__.get('visibleShifts').each(function(x) { x.show(); });
  },
  
  isNewShift: function(shiftId)
  {
    return SSIsNewShift(shiftId);
  }
});

ShiftSpace.Space.implement( new Options );
ShiftSpace.Space.implement( new Events );