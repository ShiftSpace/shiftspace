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
  },
  
  show : function()
  {
    this.showInterface();
  },
  
  hide : function()
  {
    this.hideInterface();
    
    for(shift in this.shifts)
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
    for(shift in this.shifts)
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
    if(!this.interfaceIsBuilt())
    {
      this.buildInterface();
      this.setInterfaceIsBuilt(true);
      
      if(position)
      {
        this.setPosition(position);
      }
    }
  },
  
  hideInterface : function() 
  {
    // remove any unsaved shifts
    var unsavedShifts = [];
    for(shift in this.shifts)
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

    // create the new shift
    var newShift = new this.shiftClass( aShift );
    
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
      this.fireEvent( 'onShiftDestroy', shiftId );
    }.bind( this ) );
    newShift.addEvent( 'onShiftFocus', function( aShift ) {
      focusShift( aShift.getId() );
    }.bind( this ));
    
    this.shifts[newShift.getId()] = newShift;
    
    return newShift;
  },
  
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
    var newShift = this.addShift( newShiftJson );
    this.fireEvent( 'onCreateShift', { space : this, shift : newShift } );
    return newShift;
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
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> showShift');
    console.log(aShift);
    
    if($type(aShift) != 'object')
    {
      console.error("showShift called with non-object. Perhaps you passed a shift id accidentally");
      return;
    }

    // get the shift
    var cShift = this.shifts[aShift.id];
    
    if( !cShift )
    {
      // add the shift if we don't have it already
      cShift = this.addShift( aShift );
      var cShift = this.shifts[aShift.id];
    }
    
    if( cShift.canShow() )
    {
      // blur the old shift
      if(this.getCurrentShift() &&
         cShift != this.getCurrentShift())
      {
        this.getCurrentShift().blur();
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
      cShift.focus();
    }
    
    // set the currentShift
    
    return cShift;
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
    for(shift in this.shifts)
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
    return setValue(this.getName() + '.' + key, value);
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
  
  focusShift : function(shiftId)
  {
    this.setCurrentShift(this.shifts[shiftId]);
    this.getCurrentShift().focus();
  },
  
  blurShift: function(shiftId)
  {
    var theShift = this.shifts[shiftId];
    
    theShift.blur();
    theShift.setIsBeingEdited(false);
  },
  
  onShiftCreate : function(shiftId) {},
  onShiftEdit: function(shiftId) {},
  onShiftSave : function(shiftId) {},
  onShiftDelete : function(shiftId) {},
  onShiftShow : function(shiftId) {},
  onShiftHide : function(shiftId) {},
  onShiftFocus : function(shiftId) {},
  onShiftBlur: function(shiftId) {},
  
  setValue : function(key, value)
  {
    setValue(this.attributes.name + "." + key, value);
  },
  
  getValue : function(key)
  {
    return getValue(this.attributes.name + "." + key);
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
    for(shift in this.shifts)
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
  }
});

ShiftSpace.Space.implement( new Options );
ShiftSpace.Space.implement( new Events );